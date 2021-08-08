import { coerceArray, SafeRxJS } from '@kaikokeke/common';
import { delay, merge } from 'lodash-es';
import {
  defer,
  MonoTypeOperatorFunction,
  Observable,
  ObservableInput,
  of,
  OperatorFunction,
  ReplaySubject,
  throwError
} from 'rxjs';
import { catchError, concatAll, finalize, map, mergeAll, take, tap } from 'rxjs/operators';

import { environmentConfigFactory } from '../application';
import { EnvironmentServiceGateway, PropertiesSourceGateway } from '../gateways';
import { EnvironmentConfig, LoadType, MergeStrategy, Properties } from '../types';

/**
 * Loads properties and set them in the environment store.
 */
export abstract class EnvironmentLoaderGateway {
  protected appLoad$: ReplaySubject<void> = new ReplaySubject();
  protected dismissOtherSources = false;

  protected readonly rxjs: SafeRxJS = new SafeRxJS();
  protected readonly config: EnvironmentConfig = environmentConfigFactory(this.partialConfig);

  constructor(
    protected readonly service: EnvironmentServiceGateway,
    protected readonly partialConfig: Partial<EnvironmentConfig>,
    protected readonly sources: PropertiesSourceGateway[]
  ) {}

  /**
   * Initializes the application once the sources are loaded.
   * @returns A Promise to initialize the application.
   */
  async load(): Promise<void> {
    this.processMaxLoadTime();
    this.processInitializationSources();
    this.processDeferredSourcesNotInOrder();

    return this.appLoad$.pipe(this.appLoadErrorOperator()).toPromise();
  }

  /**
   * Initializes a module once the sources are loaded.
   * @param sources The sources to be processed by the module.
   * @param config The custom config of the module. Will be merged with the application config.
   * @returns A Promise to initialize the module.
   */
  loadModule(sources: PropertiesSourceGateway[], config?: Partial<EnvironmentConfig>): Promise<void> {
    if (this.appLoad$.closed) {
      this.appLoad$ = new ReplaySubject();
    }
    this.dismissOtherSources = false;

    const moduleConfig = merge({}, this.config, environmentConfigFactory(config));

    this.processMaxLoadTime(moduleConfig.maxLoadTime);
    this.processInitializationSources(sources, moduleConfig);
    this.processDeferredSourcesNotInOrder(sources, moduleConfig);

    return this.appLoad$.pipe(this.appLoadErrorOperator()).toPromise();
  }

  /**
   * Destroys all pending sources loads on load error.
   * @returns An Observable that emits an error notification on error.
   */
  protected appLoadErrorOperator(): MonoTypeOperatorFunction<void> {
    return (observable: Observable<void>): Observable<void> =>
      observable.pipe(
        catchError((error: Error): Observable<never> => {
          this.rxjs.onDestroy();

          return throwError(error);
        })
      );
  }

  /**
   * Emits a message to load the application once the `maxLoadTime` is reached.
   * @param maxLoadTime The max load time to load the application.
   */
  protected processMaxLoadTime(maxLoadTime: number | undefined = this.config.maxLoadTime): void {
    if (maxLoadTime != null) {
      delay(() => {
        this.appLoad$.next();
        this.appLoad$.complete();
      }, maxLoadTime);
    }
  }

  protected processInitializationSources(
    sources: PropertiesSourceGateway[] = this.sources,
    config: EnvironmentConfig = this.config
  ): void {
    const initializationSources: PropertiesSourceGateway[] = coerceArray(sources).filter(
      (source: PropertiesSourceGateway): boolean => source.loadType === LoadType.INITIALIZATION
    );

    (initializationSources.length > 0
      ? of(...this.loadSources$(initializationSources, config))
          .pipe(this.onLoadInOrderOperator(), this.rxjs.takeUntilDestroy())
          .pipe(map(() => undefined))
      : of(undefined)
    )
      .pipe(
        finalize(() => {
          this.checkProcessDeferredInOrder();
          this.appLoad$.complete();
        })
      )
      .subscribe({
        next: () => {
          this.appLoad$.next();
        },
        error: (error: Error) => {
          this.appLoad$.error(error);
        },
      });
  }

  protected checkProcessDeferredInOrder(sources: PropertiesSourceGateway[] = this.sources): void {
    if (this.config.loadInOrder) {
      this.processDeferred(sources);
    }
  }

  protected onLoadInOrderOperator(): OperatorFunction<ObservableInput<Properties>, Properties> {
    return (observable: Observable<ObservableInput<Properties>>): Observable<Properties> =>
      observable.pipe(this.config.loadInOrder ? concatAll<Properties>() : mergeAll<Properties>());
  }

  protected processDeferredSourcesNotInOrder(
    sources: PropertiesSourceGateway[] = this.sources,
    config: EnvironmentConfig = this.config
  ): void {
    if (!config.loadInOrder) {
      this.processDeferred(sources);
    }
  }

  protected processDeferred(originalSources: PropertiesSourceGateway[], config: EnvironmentConfig = this.config): void {
    const deferredSources: PropertiesSourceGateway[] = coerceArray(originalSources).filter(
      (source: PropertiesSourceGateway): boolean => source.loadType === LoadType.DEFERRED
    );

    if (deferredSources.length > 0 && !this.dismissOtherSources) {
      of(...this.loadSources$(deferredSources, config))
        .pipe(mergeAll(), this.rxjs.takeUntilDestroy())
        .subscribe();
    }
  }

  protected loadSources$(sources: PropertiesSourceGateway[], config: EnvironmentConfig): Observable<Properties>[] {
    return sources.map((source: PropertiesSourceGateway) =>
      defer(() => source.load()).pipe(
        catchError((error: Error) => this.checkLoadError$(error, source, config)),
        tap({
          next: (value: Properties) => {
            this.checkResetEnvironment(value, source, config);
            this.checkImmediateLoad(value, source, config);
            this.checkDismissOtherSources(value, source, config);
            this.saveToStore(value, source, config);
          },
        }),
        this.initializationTakeOneOperator(source, config)
      )
    );
  }

  protected checkLoadError$(
    error: Error,
    source: PropertiesSourceGateway,
    config: EnvironmentConfig
  ): Observable<Properties> {
    const message: string = error.message ? `: ${error.message}` : '';
    const errorMessage = new Error(`Required Environment PropertiesSource "${source.name}" failed to load${message}`);

    if (source.isRequired && source.loadType === LoadType.INITIALIZATION) {
      this.appLoad$.error(errorMessage);
    } else {
      console.error(errorMessage);
    }

    return of({});
  }

  protected checkResetEnvironment(value: Properties, source: PropertiesSourceGateway, config: EnvironmentConfig): void {
    if (source.resetEnvironment) {
      this.service.reset();
    }
  }

  protected saveToStore(value: Properties, source: PropertiesSourceGateway, config: EnvironmentConfig) {
    if (source.mergeStrategy === MergeStrategy.MERGE) {
      this.service.merge(value, source.path);
    } else {
      this.service.overwrite(value, source.path);
    }
  }

  protected checkImmediateLoad(value: Properties, source: PropertiesSourceGateway, config: EnvironmentConfig): void {
    if (source.immediate) {
      this.appLoad$.next();
      this.appLoad$.complete();
    }
  }

  protected checkDismissOtherSources(
    value: Properties,
    source: PropertiesSourceGateway,
    config: EnvironmentConfig
  ): void {
    if (source.dismissOtherSources) {
      this.dismissOtherSources = true;
      this.rxjs.destroy$.next();
    }
  }

  protected initializationTakeOneOperator<T, K = T>(
    source: PropertiesSourceGateway,
    config: EnvironmentConfig
  ): OperatorFunction<T, T | K> {
    return (observable: Observable<T>): Observable<T | K> =>
      source.loadType === LoadType.INITIALIZATION ? observable.pipe(take(1)) : observable;
  }

  /**
   * Disposes the resource held by Observable subscriptions.
   */
  onDestroy(): void {
    this.appLoad$.complete();
    this.rxjs.onDestroy();
  }
}

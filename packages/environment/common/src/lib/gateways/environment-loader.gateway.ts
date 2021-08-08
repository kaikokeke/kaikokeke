import { coerceArray, SafeRxJS } from '@kaikokeke/common';
import { delay, merge } from 'lodash-es';
import { defer, Observable, ObservableInput, of, OperatorFunction, ReplaySubject, throwError } from 'rxjs';
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

  async load(): Promise<void> {
    this.processMaxLoadTime();
    this.processInitializationSources();
    this.processDeferredSourcesNotInOrder();

    return this.appLoad$.pipe(this.onAppLoadErrorOperator()).toPromise();
  }

  loadChild(sources: PropertiesSourceGateway[], config?: Partial<EnvironmentConfig>): Promise<void> {
    if (this.appLoad$.closed) {
      this.appLoad$ = new ReplaySubject();
    }
    this.dismissOtherSources = false;

    const childConfig = merge({}, this.config, environmentConfigFactory(config));

    this.processMaxLoadTime(childConfig.maxLoadTime);
    this.processInitializationSources(sources, childConfig);
    this.processDeferredSourcesNotInOrder(sources, childConfig);

    return this.appLoad$.pipe(this.onAppLoadErrorOperator()).toPromise();
  }

  protected onAppLoadErrorOperator<T, K = T>(): OperatorFunction<T, T | K> {
    return (observable: Observable<T>): Observable<T | K> =>
      observable.pipe(
        catchError((error: Error) => {
          this.rxjs.onDestroy();

          return throwError(error);
        })
      );
  }

  protected processDeferredSourcesNotInOrder(
    sources: PropertiesSourceGateway[] = this.sources,
    config: Partial<EnvironmentConfig> = this.config
  ): void {
    if (!config.loadInOrder) {
      this.processDeferred(sources);
    }
  }

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
          .pipe(this.loadInOrderOperator(), this.rxjs.takeUntilDestroy())
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

  protected loadInOrderOperator(): OperatorFunction<ObservableInput<Properties>, Properties> {
    return (observable: Observable<ObservableInput<Properties>>): Observable<Properties> =>
      observable.pipe(this.config.loadInOrder ? concatAll<Properties>() : mergeAll<Properties>());
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
            this.checkImmediateLoad(value, source);
            this.checkDismissOtherSources(value, source);
            this.saveToStore(value, source);
          },
        }),
        this.onInitializationTakeOneOperator(source)
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

  protected saveToStore(value: Properties, source: PropertiesSourceGateway) {
    if (source.mergeStrategy === MergeStrategy.MERGE) {
      this.service.merge(value, source.path);
    } else {
      this.service.overwrite(value, source.path);
    }
  }

  protected checkImmediateLoad(value: Properties, source: PropertiesSourceGateway): void {
    if (source.immediate) {
      this.appLoad$.next();
      this.appLoad$.complete();
    }
  }

  protected checkDismissOtherSources(value: Properties, source: PropertiesSourceGateway): void {
    if (source.dismissOtherSources) {
      this.dismissOtherSources = true;
      this.rxjs.destroy$.next();
    }
  }

  protected onInitializationTakeOneOperator<T, K = T>(source: PropertiesSourceGateway): OperatorFunction<T, T | K> {
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

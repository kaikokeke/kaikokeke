import { coerceArray, SafeRxJS } from '@kaikokeke/common';
import { defer, NEVER, Observable, ObservableInput, of, OperatorFunction, Subject, throwError } from 'rxjs';
import { catchError, concatAll, delay, map, mergeAll, take, tap } from 'rxjs/operators';

import { environmentConfigFactory } from '../application';
import { EnvironmentServiceGateway, PropertiesSourceGateway } from '../gateways';
import { EnvironmentConfig, LoadType, MergeStrategy, Properties } from '../types';

/**
 * Loads properties and set them in the environment store.
 */
export abstract class EnvironmentLoaderGateway {
  /**
   * Manages safe RxJS subscriptions.
   */
  protected readonly rxjs: SafeRxJS = new SafeRxJS();

  /**
   * Emits when an immediate source is resolved to load the application.
   */
  protected readonly immediateLoad$: Subject<void> = new Subject();

  /**
   * Configuration parameters for the Environment module.
   */
  protected readonly config: EnvironmentConfig = environmentConfigFactory(this.partialConfig);

  /**
   * Manages the complete loading status.
   */
  protected dismissOtherSources = false;

  /**
   * Manages if the application have been loaded.
   */
  protected isApplicationLoaded = false;

  constructor(
    protected readonly service: EnvironmentServiceGateway,
    protected readonly partialConfig: Partial<EnvironmentConfig>,
    protected readonly sources: PropertiesSourceGateway[]
  ) {}

  /**
   * Loads the environment properties from the properties sources.
   * @returns A promise to start the application load.
   */
  async load(): Promise<void> {
    this.processDeferredNotInOrder();

    return Promise.race([this.processMaxLoadTime(), this.processImmediate(), this.processInitialization()]).then(() => {
      this.isApplicationLoaded = true;
    });
  }

  protected processDeferredNotInOrder(): void {
    if (!this.config.loadInOrder) {
      this.processDeferred();
    }
  }

  /**
   * Loads the environment properties for lazy loaded modules.
   */
  loadChild(sources: PropertiesSourceGateway[]): void {
    of(...this.loadSources$(sources))
      .pipe(mergeAll(), this.rxjs.takeUntilDestroy())
      .subscribe();
  }

  /**
   * If the `maxLoadTime` config property is setted,
   * emits the signal to load the application once the maximum load time is reached.
   * @returns A void Promise once the maximum load time is reached.
   */
  protected processMaxLoadTime(): Promise<void> {
    return (this.config.maxLoadTime ? of(undefined).pipe(delay(this.config.maxLoadTime)) : NEVER).toPromise();
  }

  /**
   * Emits the signal to load the application once an immediate source loads.
   * @returns A void Promise once the first source is resolved.
   */
  protected async processImmediate(): Promise<void> {
    return this.immediateLoad$.pipe(take(1)).toPromise();
  }

  /**
   * Stores the properties received by the initialization sources.
   * @returns A void Promise once all sources are resolved.
   */
  protected async processInitialization(): Promise<void> {
    const sources: PropertiesSourceGateway[] = coerceArray(this.sources).filter(
      (source: PropertiesSourceGateway): boolean => source.loadType === LoadType.INITIALIZATION
    );

    return (
      sources.length > 0
        ? of(...this.loadSources$(sources))
            .pipe(this.loadInOrderOperator(), this.rxjs.takeUntilDestroy())
            .pipe(map(() => undefined))
        : of(undefined)
    )
      .toPromise()
      .then(() => this.processDeferredInOrder());
  }

  protected processDeferredInOrder(): void {
    if (this.config.loadInOrder) {
      this.processDeferred();
    }
  }

  /**
   * Sets the RxJS operator to load the sources in order or all at once based in the `loadInOrder` config property.
   * @returns The RxJS operator to load the sources in order or all at once.
   */
  protected loadInOrderOperator(): OperatorFunction<ObservableInput<Properties>, Properties> {
    return (observable: Observable<ObservableInput<Properties>>): Observable<Properties> =>
      observable.pipe(this.config.loadInOrder ? concatAll<Properties>() : mergeAll<Properties>());
  }

  /**
   * Stores the properties received by the deferred sources.
   */
  protected processDeferred(): void {
    const deferred: PropertiesSourceGateway[] = coerceArray(this.sources).filter(
      (source: PropertiesSourceGateway): boolean => source.loadType === LoadType.DEFERRED
    );

    if (this.areLoadable(deferred.length)) {
      of(...this.loadSources$(deferred))
        .pipe(mergeAll(), this.rxjs.takeUntilDestroy())
        .subscribe();
    }
  }

  protected areLoadable(length: number): boolean {
    return length > 0 && !this.dismissOtherSources;
  }

  protected loadSources$(sources: PropertiesSourceGateway[]): Observable<Properties>[] {
    return sources.map((source: PropertiesSourceGateway) =>
      defer(() => source.load()).pipe(
        catchError((error: Error) => this.checkRequired$(error, source)),
        this.customLoadSourcesOperator(source),
        tap({
          next: (value: Properties) => {
            this.checkResetEnvironment(value, source);
            this.saveToStore(value, source);
            this.checkImmediate(value, source);
            this.checkDismissOtherSources(value, source);
          },
        })
      )
    );
  }

  /**
   * Operator created to overwrite in case custom behavior is needed during source loading.
   * Runs after error checking and before source properties are checked and the value is set.
   * @param source The original PropertiesSource object.
   * @returns An operaton function to modify the emitted value or source behavior.
   */
  protected customLoadSourcesOperator<T, K = T>(source: PropertiesSourceGateway): OperatorFunction<T, T | K> {
    return (observable: Observable<T>): Observable<T | K> => observable;
  }

  protected checkRequired$(error: Error, source: PropertiesSourceGateway): Observable<Properties> {
    return source.isRequired && !this.isApplicationLoaded
      ? this.onRequiredError(error, source)
      : this.onNotRequiredError(error, source);
  }

  protected onRequiredError(error: Error, source: PropertiesSourceGateway): Observable<never> {
    this.service.reset();

    return throwError(this.getLoadError(error, source.name));
  }

  protected onNotRequiredError(error: Error, source: PropertiesSourceGateway): Observable<Properties> {
    console.error(this.getLoadError(error, source.name));

    return of({});
  }

  protected getLoadError(error: Error, name: string): Error {
    const message: string = error.message ? `: ${error.message}` : '';

    return new Error(`Required Environment PropertiesSource "${name}" failed to load${message}`);
  }

  protected checkResetEnvironment(value: Properties, source: PropertiesSourceGateway): void {
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

  protected checkImmediate(value: Properties, source: PropertiesSourceGateway): void {
    if (source.immediate && !this.immediateLoad$.isStopped) {
      this.immediateLoad$.next();
      this.immediateLoad$.complete();
    }
  }

  protected checkDismissOtherSources(value: Properties, source: PropertiesSourceGateway): void {
    if (source.dismissOtherSources) {
      this.dismissOtherSources = true;
      this.rxjs.destroy$.next();
    }
  }

  /**
   * Disposes the resource held by Observable subscriptions.
   */
  onDestroy(): void {
    this.immediateLoad$.complete();
    this.rxjs.onDestroy();
  }
}

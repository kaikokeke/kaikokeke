import { executeIfExists } from '@kaikokeke/common';
import { isEqual, isString } from 'lodash-es';
import { BehaviorSubject, concat, defer, merge, Observable, of, ReplaySubject } from 'rxjs';
import { catchError, filter, finalize, take, takeUntil, tap } from 'rxjs/operators';

import { LoaderPropertiesSource, Properties } from '../types';
import { EnvironmentService } from './environment-service.gateway';
import { propertiesSourceFactory } from './properties-source-factory.function';
import { PropertiesSource } from './properties-source.gateway';

/**
 * Loads the environment properties from the provided asynchronous sources.
 */
export abstract class EnvironmentLoader {
  protected readonly onLoad$: ReplaySubject<void> = new ReplaySubject();
  protected readonly onCompleteSourcesLoad$: ReplaySubject<void> = new ReplaySubject();
  protected readonly onRequiredToLoad$: BehaviorSubject<Set<string>> = new BehaviorSubject(new Set());
  protected readonly loaderSources: LoaderPropertiesSource[] = propertiesSourceFactory(this.sources);

  /**
   * Loads the environment properties from the provided asynchronous sources.
   * @param service Sets properties in the environment store.
   * @param sources The environment properties sources to get the application properties asynchronously.
   */
  constructor(
    protected readonly service: EnvironmentService,
    protected readonly sources?: PropertiesSource | PropertiesSource[],
  ) {}

  /**
   * Loads the environment properties from the provided asynchronous sources.
   * @returns A promise to load once the `requiredToLoad` sources are loaded.
   */
  async load(): Promise<void> {
    return this._load$()
      .toPromise()
      .then(() => {
        executeIfExists(this, 'onAfterLoad');
        Promise.resolve();
      })
      .catch(<E>(error: E) => {
        executeIfExists(this, 'onAfterError', error);
        throw error;
      });
  }

  protected _load$(): Observable<void> {
    executeIfExists(this, 'onBeforeLoad');

    this._watchRequiredToLoadSources();
    this._loadSources();

    return this.onLoad$.pipe(take(1), takeUntil(this.onCompleteSourcesLoad$));
  }

  protected _watchRequiredToLoadSources(): void {
    const requiredToLoadSources: Set<string> = new Set(
      this.loaderSources
        .filter((source: LoaderPropertiesSource) => source.requiredToLoad)
        .map((source: LoaderPropertiesSource) => source.id),
    );

    this.onRequiredToLoad$
      .pipe(
        filter((requiredToLoadLoaded: Set<string>) => isEqual(requiredToLoadLoaded, requiredToLoadSources)),
        tap({ next: () => this.resolveLoad() }),
        take(1),
        takeUntil(this.onCompleteSourcesLoad$),
      )
      .subscribe();
  }

  protected _loadSources(): void {
    merge(this._loadOrderedSources(), this._loadUnorderedSources())
      .pipe(finalize(() => executeIfExists(this, 'onAfterComplete')))
      .subscribe();
  }

  protected _loadUnorderedSources(): Observable<Properties> {
    const unorderedSources: LoaderPropertiesSource[] = this.loaderSources.filter(
      (source: LoaderPropertiesSource) => !source.loadInOrder,
    );
    const unorderedSources$: Observable<Properties>[] = this._getSources$(unorderedSources);

    return merge(...unorderedSources$).pipe(takeUntil(this.onCompleteSourcesLoad$));
  }

  protected _loadOrderedSources(): Observable<Properties> {
    const orderedSources: LoaderPropertiesSource[] = this.loaderSources.filter(
      (source: LoaderPropertiesSource) => source.loadInOrder,
    );
    const orderedSources$: Observable<Properties>[] = this._getSources$(orderedSources);

    return concat(...orderedSources$).pipe(takeUntil(this.onCompleteSourcesLoad$));
  }

  protected _getSources$(sources: LoaderPropertiesSource[]): Observable<Properties>[] {
    return sources.map((source: LoaderPropertiesSource) => {
      return defer(() => {
        executeIfExists(this, 'onBeforeSourceLoad', source);

        return source.load();
      }).pipe(
        tap({
          next: (properties: Properties) => {
            executeIfExists(this, 'onBeforeSourceAdd', properties, source);
            this._saveSourceValueToStore(properties, source);
            executeIfExists(this, 'onAfterSourceAdd', properties, source);
          },
        }),
        catchError(<E>(error: E) => this._checkSourceLoadError(error, source)),
        finalize(() => {
          executeIfExists(this, 'onAfterSourceComplete', source);
          this._checkRequiredToLoad(source);
        }),
      );
    });
  }

  protected _saveSourceValueToStore(properties: Properties, source: LoaderPropertiesSource): void {
    if (source.mergeProperties) {
      this.service.merge(properties, source.path);
    } else {
      this.service.add(properties, source.path);
    }
  }

  protected _checkSourceLoadError<E>(error: E, source: LoaderPropertiesSource): Observable<Properties> {
    const newError: Error = this._getError(error);
    const originalMessage: string = newError.message ? `: ${newError.message}` : '';
    newError.message = `The Environment PropertiesSource "${
      source.name ? source.name : source.id
    }" failed to load${originalMessage}`;

    executeIfExists(this, 'onAfterSourceError', newError, source);

    if (source.requiredToLoad && !source.ignoreError && !this.onLoad$.isStopped) {
      this.rejectLoad(newError);
    }

    return of({});
  }

  protected _getError<E>(error: E): Error {
    if (error instanceof Error) {
      return error;
    }

    const newError = new Error();

    if (isString(error)) {
      newError.message = String(error);
    }

    return newError;
  }

  protected _checkRequiredToLoad(source: LoaderPropertiesSource): void {
    if (source.requiredToLoad) {
      const requiredToLoadLoaded: Set<string> = this.onRequiredToLoad$.getValue().add(source.id);

      this.onRequiredToLoad$.next(requiredToLoadLoaded);
    }
  }

  /**
   * Forces the load to resolve.
   */
  resolveLoad(): void {
    this.onLoad$.next();
  }

  /**
   * Forces the load to reject.
   */
  rejectLoad<T>(error: T): void {
    this.onLoad$.error(error);
  }

  /**
   * Forces the load to resolve and stops all ongoing source loads.
   */
  completeSourcesLoad(): void {
    this.onCompleteSourcesLoad$.next();
  }

  /**
   * the load to resolve, stops all ongoing source loads and completes the subjects.
   */
  onDestroy(): void {
    this.completeSourcesLoad();
    this.onLoad$.complete();
    this.onCompleteSourcesLoad$.complete();
    this.onRequiredToLoad$.complete();
  }
}

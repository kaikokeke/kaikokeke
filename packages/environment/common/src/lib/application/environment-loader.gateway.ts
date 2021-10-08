import { executeIfExists } from '@kaikokeke/common';
import { isEqual } from 'lodash-es';
import { BehaviorSubject, concat, defer, merge, Observable, of, ReplaySubject } from 'rxjs';
import { catchError, filter, finalize, take, takeUntil, tap } from 'rxjs/operators';

import { propertiesSourceFactory } from '../helpers';
import { LoaderPropertiesSource, Properties } from '../types';
import { EnvironmentService } from './environment-service.gateway';
import { PropertiesSource } from './properties-source.gateway';

/**
 * Loads the environment properties from the provided asynchronous sources.
 */
export abstract class EnvironmentLoader {
  protected readonly loadSubject$: ReplaySubject<void> = new ReplaySubject();
  protected readonly completeAllSubject$: ReplaySubject<void> = new ReplaySubject();
  protected readonly requiredToLoadSubject$: BehaviorSubject<Set<string>> = new BehaviorSubject(new Set());
  protected readonly sourcesSubject$: Map<string, ReplaySubject<void>> = new Map();
  protected readonly loaderSources: ReadonlyArray<LoaderPropertiesSource>;

  /**
   * Loads the environment properties from the provided asynchronous sources.
   * @param service Sets properties in the environment store.
   * @param sources The environment properties sources to get the application properties asynchronously.
   */
  constructor(
    protected readonly service: EnvironmentService,
    protected readonly sources?: PropertiesSource | PropertiesSource[],
  ) {
    this.loaderSources = propertiesSourceFactory(this.sources);
    this.loaderSources.forEach((source: LoaderPropertiesSource) => {
      this.sourcesSubject$.set(source.id, new ReplaySubject());
    });
  }

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

    return this.loadSubject$.pipe(take(1), takeUntil(this.completeAllSubject$));
  }

  protected _watchRequiredToLoadSources(): void {
    const requiredToLoadSources: Set<string> = new Set(
      this.loaderSources
        .filter((source: LoaderPropertiesSource) => source.requiredToLoad)
        .map((source: LoaderPropertiesSource) => source.id),
    );

    this.requiredToLoadSubject$
      .pipe(
        filter((requiredToLoadLoaded: Set<string>) => isEqual(requiredToLoadLoaded, requiredToLoadSources)),
        tap({ next: () => this.resolveLoad() }),
        take(1),
        takeUntil(this.completeAllSubject$),
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

    return merge(...unorderedSources$);
  }

  protected _loadOrderedSources(): Observable<Properties> {
    const orderedSources: LoaderPropertiesSource[] = this.loaderSources.filter(
      (source: LoaderPropertiesSource) => source.loadInOrder,
    );
    const orderedSources$: Observable<Properties>[] = this._getSources$(orderedSources);

    return concat(...orderedSources$);
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
            const modifiedProperties: Properties = this.preAddProperties(properties, source);
            this._saveSourceValueToStore(modifiedProperties, source);
            executeIfExists(this, 'onAfterSourceAdd', modifiedProperties, source);
          },
        }),
        catchError(<E>(error: E) => this._checkSourceLoadError(error, source)),
        finalize(() => {
          executeIfExists(this, 'onAfterSourceComplete', source);
          this._checkRequiredToLoad(source);
        }),
        takeUntil(this.completeAllSubject$),
        takeUntil(this._getSafeSourceSubject$(source.id)),
      );
    });
  }

  /**
   * Middleware function that gives the possibility to modify the source properties before inserting it into the environment.
   * @param properties The source properties.
   * @param source The environment properties source.
   * @returns The modified source properties.
   */
  preAddProperties(properties: Properties, source: LoaderPropertiesSource): Properties {
    return properties;
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
    const sourceId: string = source.name ?? source.id;
    const originalMessage: string = newError.message ? `: ${newError.message}` : '';
    newError.message = `The Environment PropertiesSource "${sourceId}" failed to load${originalMessage}`;

    executeIfExists(this, 'onAfterSourceError', newError, source);

    if (source.requiredToLoad && !source.ignoreError && !this.loadSubject$.isStopped) {
      this.rejectLoad(newError);
    }

    return of({});
  }

  protected _getError<E>(error: E): Error {
    if (error instanceof Error) {
      return error;
    }

    const newError = new Error();
    newError.message = String(error);

    return newError;
  }

  protected _checkRequiredToLoad(source: LoaderPropertiesSource): void {
    if (source.requiredToLoad) {
      const requiredToLoadLoaded: Set<string> = this.requiredToLoadSubject$.getValue().add(source.id);

      this.requiredToLoadSubject$.next(requiredToLoadLoaded);
    }
  }

  protected _getSafeSourceSubject$(id: string): ReplaySubject<void> {
    let subject: ReplaySubject<void> | undefined = this.sourcesSubject$.get(id);

    if (subject === undefined) {
      subject = new ReplaySubject();
      this.sourcesSubject$.set(id, subject);
    }

    return subject;
  }

  /**
   * Forces the load to resolve.
   */
  resolveLoad(): void {
    this.loadSubject$.next();
  }

  /**
   * Forces the load to reject.
   */
  rejectLoad<T>(error: T): void {
    this.loadSubject$.error(error);
  }

  /**
   * Forces the load to resolve and stops all ongoing source loads.
   */
  completeAllSources(): void {
    this.completeAllSubject$.next();
  }

  /**
   * Completes a source load.
   * @param id The id of the source to complete.
   */
  completeSource(id: string): void {
    this.sourcesSubject$.get(id)?.next();
  }

  /**
   * the load to resolve, stops all ongoing source loads and completes the subjects.
   */
  onDestroy(): void {
    this.completeAllSources();
    this.loadSubject$.complete();
    this.completeAllSubject$.complete();
    this.requiredToLoadSubject$.complete();
    this.sourcesSubject$.forEach((subject: ReplaySubject<void>) => subject.complete());
  }
}

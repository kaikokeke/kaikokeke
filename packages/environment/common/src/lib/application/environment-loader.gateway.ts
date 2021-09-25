import { executeIfExists } from '@kaikokeke/common';
import { isEqual } from 'lodash-es';
import { BehaviorSubject, concat, defer, merge, Observable, of, ReplaySubject } from 'rxjs';
import { catchError, filter, finalize, take, takeUntil, tap } from 'rxjs/operators';

import { Properties } from '../types';
import { EnvironmentService } from './environment-service.gateway';
import { PropertiesSource } from './properties-source.gateway';

/**
 * Loads the environment properties from the provided asynchronous sources.
 */
export abstract class EnvironmentLoader {
  protected readonly load$List: ReplaySubject<void>[] = [];
  protected readonly destroy$List: ReplaySubject<void>[] = [];
  protected readonly requiredToLoad$List: BehaviorSubject<Set<string>>[] = [];

  protected loaderSources: PropertiesSource[][] = [];
  protected loadIndex = 0;

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
   * Loads the application environment properties from the provided asynchronous sources.
   * @returns A promise to load the application once the required properties are loaded.
   */
  async load(): Promise<void> {
    const coercedSources: PropertiesSource[] = this.coerceSources(this.sources);

    return this.loadSources('app', coercedSources);
  }

  /**
   * Loads the submodule environment properties from the provided asynchronous sources.
   * @param loadName The submodule load name.
   * @param sources The environment properties sources to get the submodule properties asynchronously.
   * @returns A promise to load the submodule once the required properties are loaded.
   */
  async loadSubmodule(loadName: string, sources: PropertiesSource | PropertiesSource[]): Promise<void> {
    const coercedSources: PropertiesSource[] = this.coerceSources(sources);

    return this.loadSources(loadName, coercedSources);
  }

  protected coerceSources(sources?: PropertiesSource | PropertiesSource[]): PropertiesSource[] {
    if (sources == null) {
      return [];
    }

    return Array.isArray(sources) ? sources : [sources];
  }

  protected async loadSources(loadName: string, sources: PropertiesSource[]): Promise<void> {
    const loadIndex: number = this.loadIndex++;

    this.load$List[loadIndex] = new ReplaySubject();
    this.destroy$List[loadIndex] = new ReplaySubject();
    this.requiredToLoad$List[loadIndex] = new BehaviorSubject(new Set());
    this.loaderSources[loadIndex] = sources;

    executeIfExists(this, 'onBeforeLoad', loadIndex, loadName);

    this.watchRequiredToLoadSources(loadIndex, loadName);
    this.loadUnorderedSources(loadIndex, loadName);
    this.loadOrderedSources(loadIndex, loadName);

    return this.load$List[loadIndex]
      .pipe(
        take(1),
        takeUntil(this.destroy$List[loadIndex]),
        tap({
          next: () => executeIfExists(this, 'onAfterLoad', loadIndex, loadName),
          error: (error: Error) => executeIfExists(this, 'onAfterLoadError', loadIndex, loadName, error),
        }),
      )
      .toPromise();
  }

  protected watchRequiredToLoadSources(LoadIndex: number, loadName: string): void {
    const requiredToLoadSources: Set<string> = new Set(
      this.loaderSources[LoadIndex].filter((source: PropertiesSource) => source.requiredToLoad).map(
        (source: PropertiesSource) => source._sourceId,
      ),
    );

    this.requiredToLoad$List[LoadIndex].pipe(
      filter((requiredToLoadLoaded: Set<string>) => isEqual(requiredToLoadLoaded, requiredToLoadSources)),
      tap({ next: () => this.onLoadSources(LoadIndex) }),
      take(1),
      takeUntil(this.destroy$List[LoadIndex]),
    ).subscribe();
  }

  protected loadUnorderedSources(loadIndex: number, loadName: string): void {
    const unorderedSources: PropertiesSource[] = this.loaderSources[loadIndex].filter(
      (source: PropertiesSource) => !source.loadInOrder,
    );
    const unorderedSources$List: Observable<Properties>[] = this.getSources$List(loadIndex, loadName, unorderedSources);

    merge(...unorderedSources$List)
      .pipe(takeUntil(this.destroy$List[loadIndex]))
      .subscribe();
  }

  protected loadOrderedSources(loadIndex: number, loadName: string): void {
    const orderedSources: PropertiesSource[] = this.loaderSources[loadIndex].filter(
      (source: PropertiesSource) => source.loadInOrder,
    );
    const orderedSources$List: Observable<Properties>[] = this.getSources$List(loadIndex, loadName, orderedSources);

    concat(...orderedSources$List)
      .pipe(takeUntil(this.destroy$List[loadIndex]))
      .subscribe();
  }

  protected getSources$List(
    loadIndex: number,
    loadName: string,
    sources: PropertiesSource[],
  ): Observable<Properties>[] {
    return sources.map((source: PropertiesSource) => {
      return defer(() => {
        executeIfExists(source, 'onBeforeSourceLoad', loadIndex, loadName);

        return source.load();
      }).pipe(
        tap({
          next: (properties: Properties) => {
            executeIfExists(source, 'onBeforeSourceValue', loadIndex, loadName, properties);
            this.saveSourceValueToStore(loadIndex, loadName, properties, source);
            this.checkDismissOtherSources(loadIndex, loadName, properties, source);
            this.checkLoadImmediately(loadIndex, loadName, properties, source);
            executeIfExists(source, 'onAfterSourceValue', loadIndex, loadName, properties);
          },
          error: (error: Error) => {
            const loadError: Error = this.getSourceError(loadIndex, loadName, error, source);
            executeIfExists(source, 'onAfterSourceError', loadIndex, loadName, loadError);
          },
        }),
        catchError((error: Error) => this.checkLoadError(loadIndex, loadName, error, source)),
        finalize(() => {
          this.checkRequiredToLoad(loadIndex, loadName, source);
          executeIfExists(source, 'onAfterSourceLoad', loadIndex, loadName);
        }),
      );
    });
  }

  protected saveSourceValueToStore(
    loadIndex: number,
    loadName: string,
    properties: Properties,
    source: PropertiesSource,
  ): void {
    if (source.deepMergeValues) {
      this.service.deepMerge(properties, source.path);
    } else {
      this.service.merge(properties, source.path);
    }
  }

  protected checkDismissOtherSources(
    loadIndex: number,
    loadName: string,
    properties: Properties,
    source: PropertiesSource,
  ): void {
    if (source.dismissOtherSources) {
      this.onDestroySources(loadIndex);
    }
  }

  protected checkLoadImmediately(
    loadIndex: number,
    loadName: string,
    properties: Properties,
    source: PropertiesSource,
  ): void {
    if (source.loadImmediately) {
      this.onLoadSources(loadIndex);
    }
  }

  protected checkLoadError(
    loadIndex: number,
    loadName: string,
    error: Error,
    source: PropertiesSource,
  ): Observable<Properties> {
    if (this.isRequiredToLoadAndNotLoaded(loadIndex, loadName, source)) {
      const loadError: Error = this.getSourceError(loadIndex, loadName, error, source);
      this.load$List[loadIndex].error(loadError);
    }

    return of({});
  }

  protected getSourceError(loadIndex: number, loadName: string, error: Error, source: PropertiesSource): Error {
    const originalMessage: string = error.message ? `: ${error.message}` : '';
    const errorMessage = `The Environment PropertiesSource "${source.sourceName}" failed to load${originalMessage}`;

    return new Error(errorMessage);
  }

  protected isRequiredToLoadAndNotLoaded(loadIndex: number, loadName: string, source: PropertiesSource): boolean {
    return source.requiredToLoad && !source.ignoreError && !this.load$List[loadIndex].isStopped;
  }

  protected checkRequiredToLoad(loadIndex: number, loadName: string, source: PropertiesSource): void {
    if (source.requiredToLoad) {
      const requiredToLoadLoaded: Set<string> = this.requiredToLoad$List[loadIndex].getValue().add(source._sourceId);

      this.requiredToLoad$List[loadIndex].next(requiredToLoadLoaded);
    }
  }

  protected onLoadSources(loadIndex: number, loadName?: string): void {
    this.load$List[loadIndex].next();
    this.load$List[loadIndex].complete();
  }

  protected onDestroySources(loadIndex: number, loadName?: string): void {
    this.destroy$List[loadIndex].next();
    this.destroy$List[loadIndex].complete();
  }

  /**
   * Stops sources loading and releases ongoing asynchronous calls.
   */
  onDestroy(): void {
    this.destroy$List.forEach((subject: ReplaySubject<void>) => {
      subject.next();
      subject.complete();
    });
    this.load$List.forEach((subject: ReplaySubject<void>) => subject.complete());
    this.requiredToLoad$List.forEach((subject: BehaviorSubject<Set<string>>) => subject.complete());
  }
}

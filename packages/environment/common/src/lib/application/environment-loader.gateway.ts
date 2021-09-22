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

    return this.loadSources(coercedSources, this.onLoad, this.onError);
  }

  protected onLoad(index: number): void {
    // Override to provide functionality.
  }

  protected onError(index: number, error: Error): void {
    // Override to provide functionality.
  }

  /**
   * Loads the submodule environment properties from the provided asynchronous sources.
   * @param sources The environment properties sources to get the submodule properties asynchronously.
   * @param onLoadFn The optional function to execute on submodule load.
   * @param onErrorFn The optional function to execute on submodule load error.
   * @returns A promise to load the submodule once the required properties are loaded.
   */
  async loadSubmodule(
    sources: PropertiesSource | PropertiesSource[],
    onLoadFn?: (index: number) => void,
    onErrorFn?: (index: number, error: Error) => void,
  ): Promise<void> {
    const coercedSources: PropertiesSource[] = this.coerceSources(sources);

    return this.loadSources(coercedSources, onLoadFn, onErrorFn);
  }

  protected coerceSources(sources?: PropertiesSource | PropertiesSource[]): PropertiesSource[] {
    if (sources == null) {
      return [];
    }

    return Array.isArray(sources) ? sources : [sources];
  }

  protected async loadSources(
    sources: PropertiesSource[],
    onLoadFn: (index: number) => void = () => null,
    onErrorFn: (index: number, error: Error) => void = () => null,
  ): Promise<void> {
    const index: number = this.loadIndex++;

    this.load$List[index] = new ReplaySubject();
    this.destroy$List[index] = new ReplaySubject();
    this.requiredToLoad$List[index] = new BehaviorSubject(new Set());

    this.watchRequiredToLoadSources(index, sources);
    this.loadUnorderedSources(index, sources);
    this.loadOrderedSources(index, sources);

    return this.load$List[index]
      .pipe(
        take(1),
        takeUntil(this.destroy$List[index]),
        tap({
          next: () => onLoadFn(index),
          error: (error: Error) => onErrorFn(index, error),
        }),
      )
      .toPromise();
  }

  protected watchRequiredToLoadSources(index: number, sources: PropertiesSource[]): void {
    const requiredToLoadSources: Set<string> = new Set(
      sources
        .filter((source: PropertiesSource) => source.requiredToLoad)
        .map((source: PropertiesSource) => source._sourceId),
    );

    this.requiredToLoad$List[index]
      .pipe(
        filter((requiredToLoadLoaded: Set<string>) => isEqual(requiredToLoadLoaded, requiredToLoadSources)),
        tap({ next: () => this.onLoadSources(index) }),
        take(1),
        takeUntil(this.destroy$List[index]),
      )
      .subscribe();
  }

  protected loadUnorderedSources(index: number, sources: PropertiesSource[]): void {
    const unorderedSources: PropertiesSource[] = sources.filter((source: PropertiesSource) => !source.loadInOrder);
    const unorderedSources$List: Observable<Properties>[] = this.getSources$List(index, unorderedSources);

    merge(...unorderedSources$List)
      .pipe(takeUntil(this.destroy$List[index]))
      .subscribe();
  }

  protected loadOrderedSources(index: number, sources: PropertiesSource[]): void {
    const orderedSources: PropertiesSource[] = sources.filter((source: PropertiesSource) => source.loadInOrder);
    const orderedSources$List: Observable<Properties>[] = this.getSources$List(index, orderedSources);

    concat(...orderedSources$List)
      .pipe(takeUntil(this.destroy$List[index]))
      .subscribe();
  }

  protected getSources$List(index: number, sources: PropertiesSource[]): Observable<Properties>[] {
    return sources.map((source: PropertiesSource) =>
      defer(() => source.load()).pipe(
        tap({
          next: (properties: Properties) => {
            source.onBeforeLoad(properties);
            this.saveSourceValueToStore(index, properties, source);
            this.checkDismissOtherSources(index, properties, source);
            this.checkLoadImmediately(index, properties, source);
            source.onAfterLoad(properties);
          },
        }),
        catchError((error: Error) => this.checkLoadError(index, error, source)),
        finalize(() => this.checkRequiredToLoad(index, source)),
      ),
    );
  }

  protected saveSourceValueToStore(index: number, properties: Properties, source: PropertiesSource): void {
    if (source.deepMergeValues) {
      this.service.deepMerge(properties, source.path);
    } else {
      this.service.merge(properties, source.path);
    }
  }

  protected checkDismissOtherSources(index: number, properties: Properties, source: PropertiesSource): void {
    if (source.dismissOtherSources) {
      this.onDestroySources(index);
    }
  }

  protected checkLoadImmediately(index: number, properties: Properties, source: PropertiesSource): void {
    if (source.loadImmediately) {
      this.onLoadSources(index);
    }
  }

  protected checkLoadError(index: number, error: Error, source: PropertiesSource): Observable<Properties> {
    const originalMessage: string = error.message ? `: ${error.message}` : '';
    const errorMessage = `Required Environment PropertiesSource "${source.sourceName}" failed to load${originalMessage}`;
    const loadError: Error = new Error(errorMessage);

    if (this.isRequiredToLoadAndNotLoaded(index, source)) {
      this.load$List[index].error(loadError);
      source.onError(loadError);
    } else {
      source.onSoftError(loadError);
    }

    return of({});
  }

  protected isRequiredToLoadAndNotLoaded(index: number, source: PropertiesSource): boolean {
    return source.requiredToLoad && !source.ignoreError && !this.load$List[index].isStopped;
  }

  protected checkRequiredToLoad(index: number, source: PropertiesSource): void {
    if (source.requiredToLoad) {
      const requiredToLoadLoaded: Set<string> = this.requiredToLoad$List[index].getValue().add(source._sourceId);

      this.requiredToLoad$List[index].next(requiredToLoadLoaded);
    }
  }

  protected onLoadSources(index: number): void {
    this.load$List[index].next();
    this.load$List[index].complete();
  }

  protected onDestroySources(index: number): void {
    this.destroy$List[index].next();
    this.destroy$List[index].complete();
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

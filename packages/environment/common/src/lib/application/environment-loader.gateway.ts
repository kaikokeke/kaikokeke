import { isEqual } from 'lodash-es';
import { BehaviorSubject, concat, defer, merge, Observable, of, OperatorFunction, ReplaySubject } from 'rxjs';
import { catchError, filter, take, takeUntil, tap } from 'rxjs/operators';

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
    const sources: PropertiesSource[] = this.coerceSources();

    return this.loadSources(sources);
  }

  protected coerceSources(): PropertiesSource[] {
    if (this.sources == null) {
      return [];
    }

    return Array.isArray(this.sources) ? this.sources : [this.sources];
  }

  /**
   * Loads the submodule environment properties from the provided asynchronous sources.
   * @param sources The environment properties sources to get the submodule properties asynchronously.
   * @returns A promise to load the submodule once the required properties are loaded.
   */
  async loadSubmodule(sources: PropertiesSource[]): Promise<void> {
    return this.loadSources(sources);
  }

  protected async loadSources(sources: PropertiesSource[]): Promise<void> {
    const index: number = this.loadIndex++;

    this.load$List[index] = new ReplaySubject();
    this.destroy$List[index] = new ReplaySubject();
    this.requiredToLoad$List[index] = new BehaviorSubject(new Set());

    this.watchRequiredToLoadSources(index, sources);
    this.loadUnorderedSources(index, sources);
    this.loadOrderedSources(index, sources);

    return this.load$List[index].pipe(take(1), takeUntil(this.destroy$List[index])).toPromise();
  }

  protected watchRequiredToLoadSources(index: number, sources: PropertiesSource[]): void {
    const requiredToLoadSources: Set<string> = new Set(
      sources.filter((source: PropertiesSource) => source.requiredToLoad).map((source: PropertiesSource) => source.id),
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
        catchError((error: Error) => this.checkLoadError(index, error, source)),
        this.customSourceOperator(index, source),
        tap({
          next: (value: Properties) => {
            this.checkResetEnvironment(index, value, source);
            this.saveSourceValueToStore(index, value, source);
            this.checkLoadImmediately(index, value, source);
            this.checkDismissOtherSources(index, value, source);
            this.checkRequiredToLoad(index, value, source);
          },
        }),
      ),
    );
  }

  protected checkLoadError(index: number, error: Error, source: PropertiesSource): Observable<Properties> {
    const originalMessage: string = error.message ? `: ${error.message}` : '';
    const errorMessage = `Required Environment PropertiesSource "${source.name}" failed to load${originalMessage}`;

    if (this.isRequiredToLoadAndNotLoaded(index, source)) {
      const loadError: Error = new Error(errorMessage);

      this.load$List[index].error(loadError);
      this.onDestroySources(index);
    } else {
      console.error(errorMessage);
    }

    return of({});
  }

  protected isRequiredToLoadAndNotLoaded(index: number, source: PropertiesSource): boolean {
    return source.requiredToLoad && !source.ignoreError && !this.load$List[index].isStopped;
  }

  protected customSourceOperator<T, K = T>(index: number, source: PropertiesSource): OperatorFunction<T, T | K> {
    return (observable: Observable<T>) => observable;
  }

  protected checkResetEnvironment(index: number, value: Properties, source: PropertiesSource): void {
    if (source.resetEnvironment) {
      this.service.reset();
    }
  }

  protected saveSourceValueToStore(index: number, value: Properties, source: PropertiesSource): void {
    if (Object.keys(value).length > 0) {
      if (source.deepMergeValues) {
        this.service.deepMerge(value, source.path);
      } else {
        this.service.merge(value, source.path);
      }
    }
  }

  protected checkLoadImmediately(index: number, value: Properties, source: PropertiesSource): void {
    if (source.loadImmediately) {
      this.onLoadSources(index);
    }
  }

  protected checkDismissOtherSources(index: number, value: Properties, source: PropertiesSource): void {
    if (source.dismissOtherSources) {
      this.onDestroySources(index);
    }
  }

  protected checkRequiredToLoad(index: number, value: Properties, source: PropertiesSource): void {
    if (source.requiredToLoad) {
      const requiredToLoadLoaded: Set<string> = this.requiredToLoad$List[index].getValue().add(source.id);

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

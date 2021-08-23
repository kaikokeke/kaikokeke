import { coerceArray } from '@kaikokeke/common';
import { isEqual } from 'lodash-es';
import { BehaviorSubject, concat, defer, merge, Observable, of, ReplaySubject } from 'rxjs';
import { catchError, filter, take, takeUntil, tap } from 'rxjs/operators';

import { Properties } from '../types';
import { EnvironmentServiceGateway } from './environment-service.gateway';
import { PropertiesSourceGateway } from './properties-source.gateway';

/**
 * Loads the environment properties from the provided asynchronous sources.
 */
export abstract class EnvironmentLoaderGateway {
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
    protected readonly service: EnvironmentServiceGateway,
    protected readonly sources: PropertiesSourceGateway | PropertiesSourceGateway[],
  ) {}

  /**
   * Loads the application environment properties from the provided asynchronous sources.
   * @returns A promise to load the application once the required properties are loaded.
   */
  async load(): Promise<void> {
    return this.loadSources(coerceArray(this.sources));
  }

  /**
   * Loads the submodule environment properties from the provided asynchronous sources.
   * @param sources The environment properties sources to get the submodule properties asynchronously.
   * @returns A promise to load the submodule once the required properties are loaded.
   */
  async loadSubmodule(sources: PropertiesSourceGateway[]): Promise<void> {
    return this.loadSources(sources);
  }

  protected async loadSources(sources: PropertiesSourceGateway[]): Promise<void> {
    const index: number = this.loadIndex++;

    this.load$List[index] = new ReplaySubject();
    this.destroy$List[index] = new ReplaySubject();
    this.requiredToLoad$List[index] = new BehaviorSubject(new Set());

    this.watchRequiredToLoadSources(index, sources);
    this.loadUnorderedSources(index, sources);
    this.loadOrderedSources(index, sources);

    return this.load$List[index].pipe(take(1), takeUntil(this.destroy$List[index])).toPromise();
  }

  protected watchRequiredToLoadSources(index: number, sources: PropertiesSourceGateway[]): void {
    const requiredToLoadSources: Set<string> = new Set(
      sources
        .filter((source: PropertiesSourceGateway) => source.requiredToLoad)
        .map((source: PropertiesSourceGateway) => source.name),
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

  protected loadUnorderedSources(index: number, sources: PropertiesSourceGateway[]): void {
    merge(
      ...this.getSources$List(
        index,
        sources.filter((source: PropertiesSourceGateway) => !source.loadInOrder),
      ),
    )
      .pipe(takeUntil(this.destroy$List[index]))
      .subscribe();
  }

  protected loadOrderedSources(index: number, sources: PropertiesSourceGateway[]): void {
    concat(
      ...this.getSources$List(
        index,
        sources.filter((source: PropertiesSourceGateway) => source.loadInOrder),
      ),
    )
      .pipe(takeUntil(this.destroy$List[index]))
      .subscribe();
  }

  protected getSources$List(index: number, sources: PropertiesSourceGateway[]): Observable<Properties>[] {
    return sources.map((source: PropertiesSourceGateway) =>
      defer(() => source.load()).pipe(
        catchError((error: Error) => this.checkLoadError(index, error, source)),
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

  protected checkLoadError(index: number, error: Error, source: PropertiesSourceGateway): Observable<Properties> {
    const originalMessage: string = error.message ? `: ${error.message}` : '';
    const errorMessage = `Required Environment PropertiesSource "${source.name}" failed to load${originalMessage}`;

    if (source.requiredToLoad && !source.ignoreError && !this.load$List[index].isStopped) {
      this.load$List[index].error(new Error(errorMessage));
      this.onDestroySources(index);
    } else {
      console.error(errorMessage);
    }

    return of({});
  }

  protected checkResetEnvironment(index: number, value: Properties, source: PropertiesSourceGateway): void {
    if (source.resetEnvironment) {
      this.service.reset();
    }
  }

  protected saveSourceValueToStore(index: number, value: Properties, source: PropertiesSourceGateway): void {
    if (Object.keys(value).length > 0) {
      if (source.deepMergeValues) {
        this.service.deepMerge(value, source.path);
      } else {
        this.service.merge(value, source.path);
      }
    }
  }

  protected checkLoadImmediately(index: number, value: Properties, source: PropertiesSourceGateway): void {
    if (source.loadImmediately) {
      this.onLoadSources(index);
    }
  }

  protected checkDismissOtherSources(index: number, value: Properties, source: PropertiesSourceGateway): void {
    if (source.dismissOtherSources) {
      this.onDestroySources(index);
    }
  }

  protected checkRequiredToLoad(index: number, value: Properties, source: PropertiesSourceGateway): void {
    if (source.requiredToLoad) {
      this.requiredToLoad$List[index].next(this.requiredToLoad$List[index].getValue().add(source.name));
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

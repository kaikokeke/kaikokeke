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
  protected readonly destroy$: ReplaySubject<void>[] = [];
  protected readonly loadApp$: ReplaySubject<void>[] = [];
  protected readonly loadBeforeApp$: BehaviorSubject<Set<string>>[] = [];

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
    return this.loadApp(coerceArray(this.sources));
  }

  /**
   * Loads the submodule environment properties from the provided asynchronous sources.
   * @param sources The environment properties sources to get the submodule properties asynchronously.
   * @returns A promise to load the submodule once the required properties are loaded.
   */
  async loadSubmodule(sources: PropertiesSourceGateway[]): Promise<void> {
    return this.loadApp(sources);
  }

  protected async loadApp(sources: PropertiesSourceGateway[]): Promise<void> {
    const index: number = this.loadIndex++;

    this.destroy$[index] = new ReplaySubject();
    this.loadApp$[index] = new ReplaySubject();
    this.loadBeforeApp$[index] = new BehaviorSubject(new Set());

    this.processLoadBeforeAppSources(index, sources);
    this.processUnorderedSources(index, sources);
    this.processOrderedSources(index, sources);

    return this.loadApp$[index].pipe(take(1), takeUntil(this.destroy$[index])).toPromise();
  }

  protected processLoadBeforeAppSources(index: number, sources: PropertiesSourceGateway[]): void {
    const loadBeforeAppSources: Set<string> = new Set(
      sources
        .filter((source: PropertiesSourceGateway) => source.loadBeforeApp)
        .map((source: PropertiesSourceGateway) => source.name),
    );

    this.loadBeforeApp$[index]
      .pipe(
        filter((loadBeforeAppLoaded: Set<string>) => isEqual(loadBeforeAppLoaded, loadBeforeAppSources)),
        tap({ next: () => this.onSourceLoad(index) }),
        take(1),
        takeUntil(this.destroy$[index]),
      )
      .subscribe();
  }

  protected processUnorderedSources(index: number, sources: PropertiesSourceGateway[]): void {
    merge(
      ...this.getSourcesLoad(
        index,
        sources.filter((source: PropertiesSourceGateway) => !source.loadInOrder),
      ),
    )
      .pipe(takeUntil(this.destroy$[index]))
      .subscribe();
  }

  protected processOrderedSources(index: number, sources: PropertiesSourceGateway[]): void {
    concat(
      ...this.getSourcesLoad(
        index,
        sources.filter((source: PropertiesSourceGateway) => source.loadInOrder),
      ),
    )
      .pipe(takeUntil(this.destroy$[index]))
      .subscribe();
  }

  protected getSourcesLoad(index: number, sources: PropertiesSourceGateway[]): Observable<Properties>[] {
    return sources.map((source: PropertiesSourceGateway) =>
      defer(() => source.load()).pipe(
        catchError((error: Error) => this.checkLoadError(index, error, source)),
        tap({
          next: (value: Properties) => {
            this.checkResetEnvironment(index, value, source);
            this.saveSourceValueToStore(index, value, source);
            this.checkLoadImmediately(index, value, source);
            this.checkDismissOtherSources(index, value, source);
            this.checkLoadBeforeApp(index, value, source);
          },
        }),
      ),
    );
  }

  protected checkLoadError(index: number, error: Error, source: PropertiesSourceGateway): Observable<Properties> {
    const originalMessage: string = error.message ? `: ${error.message}` : '';
    const errorMessage = `Required Environment PropertiesSource "${source.name}" failed to load${originalMessage}`;

    if (source.isRequired && source.loadBeforeApp && !this.loadApp$[index].isStopped) {
      this.loadApp$[index].error(new Error(errorMessage));
      this.onSourceDestroy(index);
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
      this.onSourceLoad(index);
    }
  }

  protected checkDismissOtherSources(index: number, value: Properties, source: PropertiesSourceGateway): void {
    if (source.dismissOtherSources) {
      this.onSourceDestroy(index);
    }
  }

  protected checkLoadBeforeApp(index: number, value: Properties, source: PropertiesSourceGateway): void {
    if (source.loadBeforeApp) {
      this.loadBeforeApp$[index].next(this.loadBeforeApp$[index].getValue().add(source.name));
    }
  }

  protected onSourceLoad(index: number): void {
    this.loadApp$[index].next();
    this.loadApp$[index].complete();
  }

  protected onSourceDestroy(index: number): void {
    this.destroy$[index].next();
    this.destroy$[index].complete();
  }

  /**
   * Stops sources loading and releases ongoing asynchronous calls.
   */
  onDestroy(): void {
    this.destroy$.forEach((subject: ReplaySubject<void>) => {
      subject.next();
      subject.complete();
    });
    this.loadApp$.forEach((subject: ReplaySubject<void>) => subject.complete());
    this.loadBeforeApp$.forEach((subject: BehaviorSubject<Set<string>>) => subject.complete());
  }
}

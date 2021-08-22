import { coerceArray } from '@kaikokeke/common';
import { isEqual } from 'lodash-es';
import { BehaviorSubject, concat, defer, merge, Observable, of, ReplaySubject, Subject } from 'rxjs';
import { catchError, filter, take, takeUntil, tap } from 'rxjs/operators';

import { Properties } from '../types';
import { EnvironmentServiceGateway } from './environment-service.gateway';
import { PropertiesSourceGateway } from './properties-source.gateway';

export abstract class EnvironmentLoaderGateway {
  protected readonly destroy$List: Subject<void>[] = [];
  protected readonly load$List: ReplaySubject<void>[] = [];
  protected readonly beforeApp$List: BehaviorSubject<Set<string>>[] = [];
  protected readonly sources: PropertiesSourceGateway[] = coerceArray(this.originalSources);

  protected index = 0;

  constructor(
    protected readonly service: EnvironmentServiceGateway,
    protected readonly originalSources: PropertiesSourceGateway | PropertiesSourceGateway[],
  ) {}

  async load(): Promise<void> {
    const index = this.getIndex();

    this.processBeforeAppSources(index, this.sources);
    this.processUnorderedSources(index, this.sources);
    this.processOrderedSources(index, this.sources);

    return this.loadAsPromise(index);
  }

  async loadModule(sources: PropertiesSourceGateway[]): Promise<void> {
    const index = this.getIndex();

    this.processBeforeAppSources(index, sources);
    this.processUnorderedSources(index, sources);
    this.processOrderedSources(index, sources);

    return this.loadAsPromise(index);
  }

  protected getIndex(): number {
    const index = this.index++;

    this.destroy$List[index] = new Subject();
    this.load$List[index] = new ReplaySubject();
    this.beforeApp$List[index] = new BehaviorSubject(new Set());

    return index;
  }

  protected async loadAsPromise(index: number): Promise<void> {
    return this.load$List[index].pipe(take(1), takeUntil(this.destroy$List[index])).toPromise();
  }

  protected processBeforeAppSources(index: number, sources: PropertiesSourceGateway[]): void {
    const beforeAppSources: Set<string> = new Set(
      sources
        .filter((source: PropertiesSourceGateway) => source.loadBeforeApp)
        .map((source: PropertiesSourceGateway) => source.name),
    );

    this.beforeApp$List[index]
      .pipe(
        filter((beforeAppLoaded: Set<string>) => isEqual(beforeAppLoaded, beforeAppSources)),
        tap({
          next: () => {
            this.onSourceLoad(index);
          },
        }),
        take(1),
        takeUntil(this.destroy$List[index]),
      )
      .subscribe();
  }

  protected processUnorderedSources(index: number, sources: PropertiesSourceGateway[]): void {
    merge(
      ...this.getSourcesObservable(
        index,
        sources.filter((source: PropertiesSourceGateway) => !source.loadInOrder),
      ),
    )
      .pipe(takeUntil(this.destroy$List[index]))
      .subscribe();
  }

  protected processOrderedSources(index: number, sources: PropertiesSourceGateway[]): void {
    concat(
      ...this.getSourcesObservable(
        index,
        sources.filter((source: PropertiesSourceGateway) => source.loadInOrder),
      ),
    )
      .pipe(takeUntil(this.destroy$List[index]))
      .subscribe();
  }

  protected getSourcesObservable(index: number, sources: PropertiesSourceGateway[]): Observable<Properties>[] {
    return sources.map((source: PropertiesSourceGateway) =>
      defer(() => source.load()).pipe(
        catchError((error: Error) => this.checkLoadError(index, error, source)),
        tap({
          next: (value: Properties) => {
            this.checkResetEnvironment(index, value, source);
            this.saveSourceValueToStore(index, value, source);
            this.checkLoadImmediately(index, value, source);
            this.checkInitializationSourcesLoaded(index, value, source);
            this.checkDismissOtherSources(index, value, source);
          },
        }),
      ),
    );
  }

  protected checkLoadError(index: number, error: Error, source: PropertiesSourceGateway): Observable<Properties> {
    const originalMessage: string = error.message ? `: ${error.message}` : '';
    const errorMessage = `Required Environment PropertiesSource "${source.name}" failed to load${originalMessage}`;

    if (source.isRequired && source.loadBeforeApp && !this.load$List[index].isStopped) {
      this.load$List[index].error(new Error(errorMessage));
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

  protected checkInitializationSourcesLoaded(index: number, value: Properties, source: PropertiesSourceGateway): void {
    if (source.loadBeforeApp) {
      this.beforeApp$List[index].next(this.beforeApp$List[index].getValue().add(source.name));
    }
  }

  protected checkDismissOtherSources(index: number, value: Properties, source: PropertiesSourceGateway): void {
    if (source.dismissOtherSources) {
      this.onSourceDestroy(index);
    }
  }

  protected onSourceLoad(index: number): void {
    this.load$List[index].next();
    this.load$List[index].complete();
  }

  protected onSourceDestroy(index: number): void {
    this.destroy$List[index].next();
    this.destroy$List[index].complete();
  }

  onDestroy(): void {
    this.destroy$List.forEach((subject: Subject<void>) => {
      subject.next();
      subject.complete();
    });
    this.load$List.forEach((subject: ReplaySubject<void>) => subject.complete());
    this.beforeApp$List.forEach((subject: BehaviorSubject<Set<string>>) => subject.complete());
  }
}

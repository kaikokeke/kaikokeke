import { mergeDeep, SafeRxJS } from '@kaikokeke/common';
import { get, set } from 'lodash-es';
import { defer, NEVER, Observable, ObservableInput, of, OperatorFunction, Subject, throwError } from 'rxjs';
import { catchError, concatAll, delay, map, mergeAll, tap } from 'rxjs/operators';

import { environmentConfigFactory } from '../application';
import { EnvironmentStoreGateway } from '../gateways';
import { EnvironmentConfig, isPath, LoadType, MergeStrategy, Path, Properties, PropertiesSource } from '../types';

/**
 * Sets properties in the environment store.
 */
export abstract class EnvironmentServiceGateway {
  /**
   * Manages safe RxJS subscriptions.
   */
  protected readonly rxjs: SafeRxJS = new SafeRxJS();

  /**
   * Emits when an immediate source is resolved to load the application.
   */
  protected readonly loadImmediate$: Subject<void> = new Subject();

  /**
   * Configuration parameters for the Environment module.
   */
  protected readonly config: EnvironmentConfig = environmentConfigFactory(this.partialConfig);

  /**
   * Manages the complete loading status.
   */
  protected isCompleteLoading = false;

  constructor(
    protected readonly store: EnvironmentStoreGateway,
    protected readonly partialConfig: Partial<EnvironmentConfig>,
    protected readonly sources: PropertiesSource[] = []
  ) {}

  /**
   * Loads the environment properties from the properties sources.
   * @returns A promise to start the application load.
   */
  async load(): Promise<void> {
    if (!this.config.loadInOrder) {
      this.processDeferred();
    }

    return Promise.race([this.processMaxLoadTime(), this.processImmediate(), this.processInitialization()]);
  }

  /**
   * Loads the environment properties for lazy loaded modules.
   */
  loadChild(sources: PropertiesSource[]): void {
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
    return this.loadImmediate$.toPromise();
  }

  /**
   * Stores the properties received by the initialization sources.
   * @returns A void Promise once all sources are resolved.
   */
  protected async processInitialization(): Promise<void> {
    const immediate: PropertiesSource[] = this.sources.filter(
      (source: PropertiesSource): boolean => source.loadType === LoadType.IMMEDIATE
    );
    const initialization: PropertiesSource[] = this.sources.filter(
      (source: PropertiesSource): boolean => source.loadType === LoadType.INITIALIZATION
    );
    const sources: PropertiesSource[] = [...immediate, ...initialization];

    console.log(this.config, sources.length);
    return (
      sources.length > 0
        ? of(...this.loadSources$(sources))
            .pipe(this.loadInOrderOperator(), this.rxjs.takeUntilDestroy())
            .pipe(map(() => undefined))
        : of(undefined)
    )
      .toPromise()
      .then(() => {
        if (this.config.loadInOrder) {
          this.processDeferred();
        }
      });
  }

  /**
   * Sets the RxJS operator to load the sources in order or all at once based in the `loadInOrder` config property.
   * @returns The RxJS operator to load the sources in order or all at once.
   */
  protected loadInOrderOperator(): OperatorFunction<ObservableInput<Properties>, Properties> {
    return (source: Observable<ObservableInput<Properties>>): Observable<Properties> =>
      source.pipe(this.config.loadInOrder ? concatAll<Properties>() : mergeAll<Properties>());
  }

  /**
   * Stores the properties received by the deferred sources.
   */
  protected processDeferred(): void {
    const deferred: PropertiesSource[] = this.sources.filter(
      (source: PropertiesSource): boolean => source.loadType === LoadType.DEFERRED
    );

    if (this.areLoadable(deferred.length)) {
      of(...this.loadSources$(deferred))
        .pipe(mergeAll(), this.rxjs.takeUntilDestroy())
        .subscribe();
    }
  }

  protected areLoadable(length: number): boolean {
    return length > 0 && !this.isCompleteLoading;
  }

  protected loadSources$(sources: PropertiesSource[]): Observable<Properties>[] {
    return sources.map((source: PropertiesSource) =>
      defer(() => source.load()).pipe(
        catchError((error: Error) => this.checkRequiredBehavior$(error, source.isRequired, source.name)),
        tap({
          next: (value: Properties) => {
            this.saveToStore(value, source.mergeStrategy, source.path);
            this.checkImmediate(source.loadType);
            this.checkCompleteLoading(source.completeLoading);
          },
        })
      )
    );
  }

  protected checkImmediate(loadType: LoadType): void {
    if (loadType === LoadType.IMMEDIATE) {
      this.loadImmediate$.next();
      this.loadImmediate$.complete();
    }
  }

  protected checkCompleteLoading(completeLoading: boolean): void {
    if (completeLoading) {
      this.isCompleteLoading = true;
      this.rxjs.destroy$.next();
    }
  }

  protected checkRequiredBehavior$(error: Error, isRequired: boolean, name: string): Observable<Properties> {
    return isRequired ? this.onSourceError(error, name) : of({});
  }

  protected onSourceError(error: Error, name: string): Observable<never> {
    this.store.resetProperties();

    return throwError(new Error(`Required Environment PropertiesSource "${name}" failed to load: ${error.message}`));
  }

  protected saveToStore(value: Properties, mergeStrategy: MergeStrategy, path?: Path) {
    if (mergeStrategy === MergeStrategy.MERGE) {
      this.merge(value, path);
    } else {
      this.overwrite(value, path);
    }
  }

  /**
   * Creates a new property and sets the value. If the property exists, it's ignored.
   * @param path The path where the property will be created.
   * @param value The value of the property.
   */
  create<V>(path: Path, value: V): void {
    if (isPath(path)) {
      const state: Properties = this.store.getProperties();

      if (get(state, path) === undefined) {
        const newState: Properties = set(state, path, value);

        this.store.updateProperties(newState);
      }
    }
  }

  /**
   * Updates the value of a property. If the property does not exist it's ignored.
   * @param path The path of the property to update.
   * @param value The value of the property.
   */
  update<V>(path: Path, value: V): void {
    if (isPath(path)) {
      const state: Properties = this.store.getProperties();

      if (get(state, path) !== undefined) {
        const newState: Properties = set(state, path, value);

        this.store.updateProperties(newState);
      }
    }
  }

  /**
   * Upserts a property value.
   * @param path The path where the properties will be set.
   * @param value The value of the property.
   */
  upsert<V>(path: Path, value: V): void {
    if (isPath(path)) {
      const newState: Properties = set(this.store.getProperties(), path, value);

      this.store.updateProperties(newState);
    }
  }

  /**
   * Upserts a set of properties in the environment store using the merge strategy.
   * @param properties The set of properties to upsert.
   * @param path The path where the properties will be set. If it is undefined, the environment root will be used.
   */
  merge(properties: Properties, path?: Path): void {
    const newState: Properties = mergeDeep(
      this.store.getProperties(),
      this.propertiesAtPath(properties, path)
    ) as Properties;

    this.store.updateProperties(newState);
  }

  /**
   * Upserts a set of properties in the environment store using the overwrite strategy.
   * @param properties The set of properties to upsert.
   * @param path The path where the properties will be set. If it is undefined, the environment root will be used.
   */
  overwrite(properties: Properties, path?: Path): void {
    const newState: Properties = { ...this.store.getProperties(), ...this.propertiesAtPath(properties, path) };

    this.store.updateProperties(newState);
  }

  /**
   * Sets the properties at path.
   * @param properties The properties to set at path.
   * @param path The path to set the properties.
   * @returns The properties at path.
   */
  protected propertiesAtPath(properties: Properties, path?: Path): Properties {
    return path == null ? properties : this.valueAtPath(path, properties);
  }

  /**
   * Sets a value at path.
   * @param path The path to set the value.
   * @param value The value to set.
   * @returns The properties with the new vale.
   */
  protected valueAtPath<V>(path: Path, value: V): Properties {
    return isPath(path) ? set({}, path, value) : value;
  }

  /**
   * Disposes the resource held by Observable subscriptions.
   */
  onDestroy(): void {
    this.loadImmediate$.complete();
    this.rxjs.onDestroy();
  }
}

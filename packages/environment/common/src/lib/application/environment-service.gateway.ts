import { mergeDeep, SafeRxJS } from '@kaikokeke/common';
import { get, set } from 'lodash-es';
import { defer, Observable, of, Subject, throwError } from 'rxjs';
import { catchError, concatAll, map, mergeAll, tap } from 'rxjs/operators';

import { EnvironmentStoreGateway, isPath, LoadType, MergeStrategy, Path, Properties, PropertiesSource } from '../types';

/**
 * Sets properties in the environment store.
 */
export abstract class EnvironmentServiceGateway {
  /**
   * Manages safe RxJS subscriptions.
   */
  protected readonly rxjs: SafeRxJS = new SafeRxJS();

  /**
   * Emits when an immediate sorce is resolved.
   */
  protected readonly immediate$: Subject<void> = new Subject();

  /**
   * Manages complete loading status.
   */
  protected isCompleteLoading = false;

  constructor(protected readonly store: EnvironmentStoreGateway, protected readonly sources: PropertiesSource[] = []) {}

  /**
   * Loads the environment properties from sources.
   * @returns A promise to report the loading of properties.
   */
  async load(): Promise<void> {
    return Promise.race([this.processImmediate(), this.processInitialization()]);
  }

  /**
   * Loads the environment properties for lazy loaded modules.
   * @returns A promise to report the loading of properties.
   */
  loadChild(sources: PropertiesSource[]): void {
    of(...this.loadSources$(sources))
      .pipe(mergeAll(), this.rxjs.takeUntilDestroy())
      .subscribe();
  }

  /**
   * Stores the properties received by the immediate source.
   * @returns A void Promise once the first source is resolved.
   */
  protected async processImmediate(): Promise<void> {
    return this.immediate$.toPromise();
  }

  /**
   * Stores the properties received by the initialization sources.
   * @returns A void Promise once all sources are resolved.
   */
  protected async processInitialization(): Promise<void> {
    const initialization: PropertiesSource[] = this.sources.filter(
      (source: PropertiesSource): boolean =>
        source.loadType === LoadType.IMMEDIATE || source.loadType === LoadType.INITIALIZATION
    );

    return (
      this.areLoadable(initialization)
        ? of(...this.loadSources$(initialization)).pipe(concatAll(), this.rxjs.takeUntilDestroy())
        : of({})
    )
      .pipe(map(() => undefined))
      .toPromise()
      .then(() => this.processDeferred());
  }

  /**
   * Stores the properties received by the deferred sources.
   */
  protected processDeferred(): void {
    const deferred: PropertiesSource[] = this.sources.filter(
      (source: PropertiesSource): boolean => source.loadType === LoadType.DEFERRED
    );

    if (this.areLoadable(deferred)) {
      of(...this.loadSources$(deferred))
        .pipe(mergeAll(), this.rxjs.takeUntilDestroy())
        .subscribe();
    }
  }

  protected areLoadable(sources: PropertiesSource[]): boolean {
    return sources.length > 0 && !this.isCompleteLoading;
  }

  protected loadSources$(sources: PropertiesSource[]): Observable<Properties>[] {
    return sources.map((source: PropertiesSource) =>
      defer(() => source.load()).pipe(
        catchError(() => this.checkRequiredBehavior$(source.required, source.name)),
        tap({
          next: (value: Properties) => {
            this.saveToStore(value, source.mergeStrategy, source.path);
            this.checkImmediate(source);
            this.checkCompleteLoading(source);
          },
        })
      )
    );
  }

  protected checkImmediate(source: PropertiesSource): void {
    if (source.loadType === LoadType.IMMEDIATE) {
      this.immediate$.next();
      this.immediate$.complete();
    }
  }

  protected checkCompleteLoading(source: PropertiesSource): void {
    if (source.completeLoading) {
      this.isCompleteLoading = true;
      this.rxjs.destroy$.next();
    }
  }

  protected checkRequiredBehavior$(required: boolean, name: string): Observable<Properties> {
    return required ? this.onSourceError(name) : of({});
  }

  protected onSourceError(name: string): Observable<never> {
    this.store.resetProperties();

    return throwError(new Error(`Required PropertiesSource "${name}" failed`));
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
    this.rxjs.onDestroy();
  }
}

import { AtLeastOne, deepMerge, filterNil, firstNonNil, Path } from '@kaikokeke/common';
import { get, isEqual, isString } from 'lodash-es';
import { combineLatest, MonoTypeOperatorFunction, Observable } from 'rxjs';
import { distinctUntilChanged, filter, map, shareReplay, take } from 'rxjs/operators';

import { environmentConfigFactory } from '../helpers';
import { EnvironmentConfig, Properties, Property } from '../types';
import { EnvironmentStore } from './environment-store.gateway';

/**
 * Gets the properties from the environment.
 */
export abstract class EnvironmentQuery {
  protected readonly config: EnvironmentConfig = environmentConfigFactory(this.partialConfig);

  /**
   * Gets the properties from the environment store.
   * @param store Manages the environment store.
   * @param partialConfig Partial configuration parameters for the Environment module.
   */
  constructor(
    protected readonly store: EnvironmentStore,
    protected readonly partialConfig?: Partial<EnvironmentConfig>,
  ) {}

  /**
   * Gets all the environment properties.
   * @returns All the distinct environment properties as Observable.
   */
  getAll$(): Observable<Properties> {
    return this.store.getAll$().pipe(distinctUntilChanged(isEqual), shareReplay(1));
  }

  /**
   * Gets all the environment properties.
   * @returns The first non empty set of environment properties as Promise.
   */
  async getAllAsync(): Promise<Properties> {
    return this.getAll$()
      .pipe(
        filterNil(),
        filter((environment: Properties) => Object.keys(environment).length > 0),
        take(1),
      )
      .toPromise();
  }

  /**
   * Gets all the environment properties.
   * @returns All the environment properties.
   */
  getAll(): Properties {
    return this.store.getAll();
  }

  /**
   * Gets the environment property at path.
   * @param path The property path to resolve.
   * @returns The distinct environment property at path as Observable or `undefined` if the path cannot be resolved.
   * @see Path
   */
  get$<P extends Property>(path: Path): Observable<P | undefined> {
    return this.getAll$().pipe(
      map((environment: Properties): P | undefined => this._getProperty(environment, path)),
      distinctUntilChanged(isEqual),
    );
  }

  /**
   * Gets the environment property at path.
   * @param path The property path to resolve.
   * @returns The non nil environment property at path as Promise.
   * @see Path
   */
  getAsync<P extends Property>(path: Path): Promise<P> {
    return this.get$<P>(path).pipe(firstNonNil()).toPromise();
  }

  /**
   * Gets the environment property at path.
   * @param path The property path to resolve.
   * @returns The environment property at path or `undefined` if the path cannot be resolved.
   * @see Path
   */
  get<P extends Property>(path: Path): P | undefined {
    const environment: Properties = this.getAll();

    return this._getProperty(environment, path);
  }

  protected _getProperty<P extends Property>(environment: Properties, path: Path): P | undefined {
    return get(environment, path);
  }

  /**
   * Checks if the environment property path is available for resolution.
   * @param paths The property path to resolve.
   * @returns distinct `true` as Observable if the environment property path exists, otherwise `false`.
   * @see Path
   */
  contains$(path: Path): Observable<boolean> {
    return this.get$(path).pipe(
      map((property?: Property) => this._contains(property)),
      distinctUntilChanged(),
    );
  }

  /**
   * Checks if the environment property path is available for resolution.
   * @param paths The property path to resolve.
   * @returns `true` as Promise when the environment property path exists.
   * @see Path
   */
  containsAsync(path: Path): Promise<boolean> {
    return this.contains$(path).pipe(this._containsAsyncOperator()).toPromise();
  }

  /**
   * Checks if the environment property path is available for resolution.
   * @param paths The property path to resolve.
   * @returns `true` if the environment property path exists, otherwise `false`.
   * @see Path
   */
  contains(path: Path): boolean {
    const property: Property | undefined = this.get(path);

    return this._contains(property);
  }

  protected _contains(property?: Property): boolean {
    return property !== undefined;
  }

  /**
   * Checks if all the distinct environment property paths are available for resolution.
   * @param paths The list of property paths to resolve.
   * @returns `true` as Observable if all the environment property paths exists, otherwise `false`.
   * @see Path
   */
  containsAll$(...paths: AtLeastOne<Path>): Observable<boolean> {
    const containsList$: Observable<boolean>[] = paths.map((path: Path) => this.contains$(path));

    return combineLatest(containsList$).pipe(
      map((containsList: Array<boolean>) => this._containsAll(containsList)),
      distinctUntilChanged(),
    );
  }

  /**
   * Checks if all the environment property paths are available for resolution.
   * @param paths The property path to resolve.
   * @returns `true` as Promise when all environment property paths exists.
   * @see Path
   */
  containsAllAsync(...paths: AtLeastOne<Path>): Promise<boolean> {
    return this.containsAll$(...paths)
      .pipe(this._containsAsyncOperator())
      .toPromise();
  }

  /**
   * Checks if all the environment property paths are available for resolution.
   * @param paths The list of property paths to resolve.
   * @returns `true` if all the environment property paths exists, otherwise `false`.
   * @see Path
   */
  containsAll(...paths: AtLeastOne<Path>): boolean {
    const containsList: Array<boolean> = paths.map((path: Path) => this.contains(path));

    return this._containsAll(containsList);
  }

  protected _containsAll(containsList: Array<boolean>): boolean {
    return containsList.every((contains: boolean) => contains);
  }

  /**
   * Checks if some distinct environment property paths are available for resolution.
   * @param paths The list of property paths to resolve.
   * @returns `true` as Observable if some environment property paths exists, otherwise `false`.
   * @see Path
   */
  containsSome$(...paths: AtLeastOne<Path>): Observable<boolean> {
    const containsList$: Observable<boolean>[] = paths.map((path: Path) => this.contains$(path));

    return combineLatest(containsList$).pipe(
      map((containsList: Array<boolean>) => this._containsSome(containsList)),
      distinctUntilChanged(),
    );
  }

  /**
   * Checks if some environment property paths are available for resolution.
   * @param paths The property path to resolve.
   * @returns `true` as Promise when some environment property paths exists.
   * @see Path
   */
  containsSomeAsync(...paths: AtLeastOne<Path>): Promise<boolean> {
    return this.containsSome$(...paths)
      .pipe(this._containsAsyncOperator())
      .toPromise();
  }

  /**
   * Checks if some environment property paths are available for resolution.
   * @param paths The list of property paths to resolve.
   * @returns `true` if some environment property paths exists, otherwise `false`.
   * @see Path
   */
  containsSome(...paths: AtLeastOne<Path>): boolean {
    const containsList: Array<boolean> = paths.map((path: Path) => this.contains(path));

    return this._containsSome(containsList);
  }

  protected _containsSome(containsList: Array<boolean>): boolean {
    return containsList.some((contains: boolean) => contains);
  }

  protected _containsAsyncOperator(): MonoTypeOperatorFunction<boolean> {
    return (observable: Observable<boolean>) =>
      observable.pipe(
        filter((property: boolean) => property === true),
        take(1),
      );
  }

  /**
   * Gets the distinct required environment property at path.
   * @param path The property path to resolve.
   * @param defaultValue The value to return if the path cannot be resolved.
   * @returns The environment property at path as Observable or the `defaultValue` if the path cannot be resolved.
   * @throws If the property at path is undefined and `defaultValue` is not provided.
   * @see Path
   */
  getRequired$<P extends Property, D extends Property>(path: Path, defaultValue?: D): Observable<P | D> {
    return this.getAll$().pipe(
      map((environment: Properties) => this._getRequired(environment, path, defaultValue)),
      distinctUntilChanged(isEqual),
    );
  }

  /**
   * Gets the required environment property at path.
   * @param path The property path to resolve.
   * @param defaultValue The value to return if the path cannot be resolved.
   * @returns The environment property at path or the `defaultValue` if the path cannot be resolved.
   * @throws If the property at path is undefined and `defaultValue` is not provided.
   * @see Path
   */
  getRequired<P extends Property, D extends Property>(path: Path, defaultValue?: D): P | D {
    const environment: Properties = this.getAll();

    return this._getRequired(environment, path, defaultValue);
  }

  protected _getRequired<P extends Property, D extends Property>(
    environment: Properties,
    path: Path,
    defaultValue?: D,
  ): P | D {
    const value: P | D | undefined = get(environment, path, defaultValue);

    if (value === undefined) {
      throw new Error(`The environment property at path "${path}" is required and is undefined`);
    }

    return get(environment, path, defaultValue);
  }

  /**
   * Gets the distinct typed environment property at path.
   * @param path The property path to resolve.
   * @param targetType The expected type converter function.
   * @returns The environment property at path converted to the `targetType` as Observable
   * or `undefined` if the path cannot be resolved.
   * @see Path
   */
  getTyped$<P extends Property, T>(path: Path, targetType: (value: P) => T): Observable<T | undefined> {
    return this.get$<P>(path).pipe(
      map((property?: P) => this._getTyped(targetType, property)),
      distinctUntilChanged(isEqual),
    );
  }

  /**
   * Gets the typed environment property at path.
   * @param path The property path to resolve.
   * @param targetType The expected type converter function.
   * @returns The non nil environment property at path converted to the `targetType` as Promise.
   * @see Path
   */
  getTypedAsync<P extends Property, T>(path: Path, targetType: (value: P) => T): Promise<T> {
    return this.getTyped$(path, targetType).pipe(firstNonNil()).toPromise();
  }

  /**
   * Gets the typed environment property at path.
   * @param path The property path to resolve.
   * @param targetType The expected type converter function.
   * @returns The environment property at path converted to the `targetType`
   * or `undefined` if the path cannot be resolved.
   * @see Path
   */
  getTyped<P extends Property, T>(path: Path, targetType: (value: P) => T): T | undefined {
    const property: P | undefined = this.get<P>(path);

    return this._getTyped(targetType, property);
  }

  protected _getTyped<P extends Property, T>(targetType: (value: P) => T, property?: P): T | undefined {
    if (property === undefined) {
      return;
    }

    return targetType(property);
  }

  /**
   * Gets the distinct required typed environment property at path.
   * @param path The property path to resolve.
   * @param defaultValue The value to return if the path cannot be resolved.
   * @param targetType The expected type converter function.
   * @returns The environment property at path converted to the `targetType` as Observable
   * or the converted `defaultValue` if the path cannot be resolved.
   * @throws If the property at path is undefined and `defaultValue` is not provided.
   * @see Path
   */
  getRequiredTyped$<P extends Property, D extends Property, T>(
    path: Path,
    targetType: (value: P | D) => T,
    defaultValue?: D,
  ): Observable<T> {
    return this.getRequired$<P, D>(path, defaultValue).pipe(
      map((property: P | D) => this._getRequiredTyped(property, targetType)),
      distinctUntilChanged(isEqual),
    );
  }

  /**
   * Gets the required typed environment property at path.
   * @param path The property path to resolve.
   * @param defaultValue The value to return if the path cannot be resolved.
   * @param targetType The expected type converter function.
   * @returns The environment property at path converted to the `targetType`
   * or the converted `defaultValue` if the path cannot be resolved.
   * @throws If the property at path is undefined and `defaultValue` is not provided.
   * @see Path
   */
  getRequiredTyped<P extends Property, D extends Property, T>(
    path: Path,
    targetType: (value: P | D) => T,
    defaultValue?: D,
  ): T {
    const property: P | D = this.getRequired<P, D>(path, defaultValue);

    return this._getRequiredTyped(property, targetType);
  }

  protected _getRequiredTyped<P extends Property, D extends Property, T>(
    property: P | D,
    targetType: (value: P | D) => T,
  ): T {
    return targetType(property);
  }

  /**
   * Gets the distinct transpiled environment property at path.
   * @param path The property path to resolve.
   * @param properties The properties to resolve the interpolation.
   * @param config The custom environment config for the transpile.
   * @returns The transpiled environment property at path as Observable
   * or `undefined` if the path cannot be resolved.
   * @see Path
   */
  getTranspiled$<P extends Property>(
    path: Path,
    properties?: Properties,
    config?: Partial<EnvironmentConfig>,
  ): Observable<P | undefined> {
    return this.get$<P>(path).pipe(
      map((property?: P) => this._getTranspiled(property, properties, config)),
      distinctUntilChanged(isEqual),
    );
  }

  /**
   * Gets the transpiled environment property at path.
   * @param path The property path to resolve.
   * @param properties The properties to resolve the interpolation.
   * @param config The custom environment config for the transpile.
   * @returns The non nil transpiled environment property at path as Promise.
   * @see Path
   */
  getTranspiledAsync<P extends Property>(
    path: Path,
    properties?: Properties,
    config?: Partial<EnvironmentConfig>,
  ): Promise<P> {
    return this.getTranspiled$<P>(path, properties, config).pipe(firstNonNil()).toPromise();
  }

  /**
   * Gets the transpiled environment property at path.
   * @param path The property path to resolve.
   * @param properties The properties to resolve the interpolation.
   * @param config The custom environment config for the transpile.
   * @returns The transpiled environment property at path or `undefined` if the path cannot be resolved.
   * @see Path
   */
  getTranspiled<P extends Property>(
    path: Path,
    properties?: Properties,
    config?: Partial<EnvironmentConfig>,
  ): P | undefined {
    const property: P | undefined = this.get<P>(path);

    return this._getTranspiled(property, properties, config);
  }

  protected _getTranspiled<P extends Property>(
    property?: P,
    properties?: Properties,
    config?: Partial<EnvironmentConfig>,
  ): P | undefined {
    if (property === undefined) {
      return;
    }

    return this.transpile(property, properties, config);
  }

  /**
   * Gets the distinct required transpiled environment property at path.
   * @param path The property path to resolve.
   * @param defaultValue The default value to resolve if no value is found.
   * @param properties The properties to resolve the interpolation.
   * @param config The custom environment config for the transpile.
   * @returns The transpiled environment property at path as Observable
   * or the transpiled `defaultValue` if the path cannot be resolved.
   * @throws If the property at path is undefined and `defaultValue` is not provided.
   * @see Path
   */
  getRequiredTranspiled$<P extends Property, D extends Property>(
    path: Path,
    defaultValue?: D,
    properties?: Properties,
    config?: Partial<EnvironmentConfig>,
  ): Observable<P | D> {
    return this.getRequired$<P, D>(path, defaultValue).pipe(
      map((property: P | D) => this._getRequiredTranspiled(property, properties, config)),
      distinctUntilChanged(isEqual),
    );
  }

  /**
   * Gets the required transpiled environment property at path.
   * @param path The property path to resolve.
   * @param defaultValue The default value to resolve if no value is found.
   * @param properties The properties to resolve the interpolation.
   * @param config The custom environment config for the transpile.
   * @returns The transpiled environment property at path
   * or the transpiled `defaultValue` if the path cannot be resolved.
   * @throws If the property at path is undefined and `defaultValue` is not provided.
   * @see Path
   */
  getRequiredTranspiled<P extends Property, D extends Property>(
    path: Path,
    defaultValue?: D,
    properties?: Properties,
    config?: Partial<EnvironmentConfig>,
  ): P | D {
    const property: P | D = this.getRequired<P, D>(path, defaultValue);

    return this._getRequiredTranspiled(property, properties, config);
  }

  protected _getRequiredTranspiled<P extends Property>(
    property: P,
    properties?: Properties,
    config?: Partial<EnvironmentConfig>,
  ): P {
    return this.transpile(property, properties, config);
  }

  protected transpile<P extends Property>(
    value: P,
    properties: Properties = {},
    config: Partial<EnvironmentConfig> = {},
  ): P {
    const transpileConfig: EnvironmentConfig = { ...this.config, ...config };

    if (isString(value)) {
      const matcher: RegExp = this.getMatcher(transpileConfig);

      return value.replace(matcher, (substring: string, match: string) => {
        const transpileProperties: Properties = this.getTranspileProperties(properties, transpileConfig);

        return this.replacer(substring, match, transpileProperties);
      }) as P;
    }

    return value;
  }

  protected getMatcher(config: EnvironmentConfig): RegExp {
    const [start, end]: [string, string] = config.interpolation;
    const escapedStart: string = this.escapeChars(start);
    const escapedEnd: string = this.escapeChars(end);

    return new RegExp(`${escapedStart}\\s*(.*?)\\s*${escapedEnd}`, 'g');
  }

  protected escapeChars(chars: string): string {
    return [...chars].map((char: string) => `\\${char}`).join('');
  }

  protected getTranspileProperties(properties: Properties, config: EnvironmentConfig): Properties {
    if (!config.useEnvironmentToTranspile) {
      return properties;
    }

    const environment: Properties = this.store.getAll();

    return deepMerge(environment, properties);
  }

  protected replacer(substring: string, match: string, properties: Properties): string {
    const value: Property | undefined = get(properties, match);

    if (value == null) {
      return substring;
    }

    try {
      return typeof value === 'object' ? JSON.stringify(value) : String(value);
    } catch {
      return String(value);
    }
  }
}

class EnvironmentQueryImpl extends EnvironmentQuery {
  constructor(
    protected readonly store: EnvironmentStore,
    protected readonly partialConfig?: Partial<EnvironmentConfig>,
  ) {
    super(store, partialConfig);
  }
}

/**
 * Creates an environment query service.
 * @param store Manages the environment store.
 * @param partialConfig Optional partial configuration parameters for the Environment module.
 * @returns A basic EnvironmentQuery instance.
 */
export function createEnvironmentQuery(
  store: EnvironmentStore,
  partialConfig?: Partial<EnvironmentConfig>,
): EnvironmentQuery {
  return new EnvironmentQueryImpl(store, partialConfig);
}

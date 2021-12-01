import { AtLeastOne, deepMerge, filterNil, firstNonNil, Path } from '@kaikokeke/common';
import { get, isEqual, isString } from 'lodash-es';
import { combineLatest, firstValueFrom, MonoTypeOperatorFunction, Observable } from 'rxjs';
import { distinctUntilChanged, filter, map, shareReplay } from 'rxjs/operators';

import { environmentConfigFactory } from '../helpers';
import { EnvironmentConfig, GetOptions, Properties, Property } from '../types';
import { EnvironmentStore } from './environment-store.gateway';

/**
 * Gets the properties from the environment.
 */
export abstract class EnvironmentQuery {
  protected readonly _config: EnvironmentConfig = environmentConfigFactory(this.config);

  /**
   * Gets the properties from the environment store.
   * @param store Manages the environment store.
   * @param config Partial configuration parameters for the Environment module.
   */
  constructor(protected readonly store: EnvironmentStore, protected readonly config?: Partial<EnvironmentConfig>) {}

  /**
   * Gets all the environment properties.
   * @returns All the distinct environment properties as Observable.
   */
  getAll$(): Observable<Properties> {
    return this.store.getAll$().pipe(distinctUntilChanged(isEqual), shareReplay(1));
  }

  /**
   * Gets all the environment properties.
   * @returns The first non nil or empty set of environment properties as Promise.
   */
  async getAllAsync(): Promise<Properties> {
    const getAll$: Observable<Properties> = this.getAll$().pipe(
      filterNil(),
      filter((environment: Properties) => Object.keys(environment).length > 0),
    );

    return firstValueFrom(getAll$);
  }

  /**
   * Gets all the environment properties.
   * @returns All the environment properties.
   */
  getAll(): Properties {
    return this.store.getAll();
  }

  /**
   * Checks if all the environment property paths are available for resolution.
   * @param paths The list of property paths to resolve.
   * @returns distinct `true` as Observable if all the environment property paths exists, otherwise `false`.
   * @see Path
   */
  containsAll$(...paths: AtLeastOne<Path>): Observable<boolean> {
    const containsList$: Observable<boolean>[] = paths.map((path: Path) => this._contains$(path));

    return combineLatest(containsList$).pipe(
      map((containsList: Array<boolean>) => this._containsAll(containsList)),
      distinctUntilChanged(),
    );
  }

  /**
   * Checks if all the environment property paths are available for resolution.
   * @param paths The property path to resolve.
   * @returns The first `true` as Promise when all environment property paths exists.
   * @see Path
   */
  containsAllAsync(...paths: AtLeastOne<Path>): Promise<boolean> {
    const containsAll$: Observable<boolean> = this.containsAll$(...paths).pipe(this._containsAsync());

    return firstValueFrom(containsAll$);
  }

  /**
   * Checks if all the environment property paths are available for resolution.
   * @param paths The list of property paths to resolve.
   * @returns `true` if all the environment property paths exists, otherwise `false`.
   * @see Path
   */
  containsAll(...paths: AtLeastOne<Path>): boolean {
    const containsList: Array<boolean> = paths.map((path: Path) => this._contains(path));

    return this._containsAll(containsList);
  }

  /**
   * Checks if some environment property paths are available for resolution.
   * @param paths The list of property paths to resolve.
   * @returns distinct `true` as Observable if some environment property paths exists, otherwise `false`.
   * @see Path
   */
  containsSome$(...paths: AtLeastOne<Path>): Observable<boolean> {
    const containsList$: Observable<boolean>[] = paths.map((path: Path) => this._contains$(path));

    return combineLatest(containsList$).pipe(
      map((containsList: Array<boolean>) => this._containsSome(containsList)),
      distinctUntilChanged(),
    );
  }

  /**
   * Checks if some environment property paths are available for resolution.
   * @param paths The property path to resolve.
   * @returns The first `true` as Promise when some environment property paths exists.
   * @see Path
   */
  containsSomeAsync(...paths: AtLeastOne<Path>): Promise<boolean> {
    const containsSome$: Observable<boolean> = this.containsSome$(...paths).pipe(this._containsAsync());

    return firstValueFrom(containsSome$);
  }

  /**
   * Checks if some environment property paths are available for resolution.
   * @param paths The list of property paths to resolve.
   * @returns `true` if some environment property paths exists, otherwise `false`.
   * @see Path
   */
  containsSome(...paths: AtLeastOne<Path>): boolean {
    const containsList: Array<boolean> = paths.map((path: Path) => this._contains(path));

    return this._containsSome(containsList);
  }

  protected _containsDef(property?: Property): boolean {
    return property !== undefined;
  }

  protected _contains$(path: Path): Observable<boolean> {
    return this.get$<Property>(path).pipe(
      map((property?: Property) => this._containsDef(property)),
      distinctUntilChanged(),
    );
  }

  protected _contains(path: Path): boolean {
    const property: Property | undefined = this.get(path);

    return this._containsDef(property);
  }

  protected _containsAsync(): MonoTypeOperatorFunction<boolean> {
    return (observable: Observable<boolean>) => observable.pipe(filter((property: boolean) => property === true));
  }

  protected _containsAll(containsList: Array<boolean>): boolean {
    return containsList.every((contains: boolean) => contains);
  }

  protected _containsSome(containsList: Array<boolean>): boolean {
    return containsList.some((contains: boolean) => contains);
  }

  /**
   * Gets the environment property at path.
   * @param path The property path to resolve.
   * @param options The options to get a property.
   * @returns The distinct environment property at path as Observable.
   * @see Path
   */
  get$<T = Property>(path: Path, options?: GetOptions<T>): Observable<T | undefined> {
    return this.getAll$().pipe(
      map((environment: Properties) => this._getProperty(environment, path)),
      map((property?: Property) => this._getDefaultValue(property, options?.defaultValue)),
      map((property?: Property) => this._getTargetType(property, options?.targetType)),
      map((property?: Property | T) =>
        this._getTranspile(property, options?.transpile, options?.interpolation, options?.useEnvironmentToTranspile),
      ),
      distinctUntilChanged(isEqual),
    );
  }

  /**
   * Gets the environment property at path.
   * @param path The property path to resolve.
   * @param options The options to get a property.
   * @returns The first non nil environment property at path as Promise.
   * @see Path
   */
  getAsync<T = Property>(path: Path, options?: GetOptions<T>): Promise<T | undefined> {
    const get$: Observable<T | undefined> = this.get$<T>(path, options).pipe(firstNonNil());

    return firstValueFrom(get$);
  }

  /**
   * Gets the environment property at path.
   * @param path The property path to resolve.
   * @param options The options to get a property.
   * @returns The environment property at path.
   * @see Path
   */
  get<T = Property>(path: Path, options?: GetOptions<T>): T | undefined {
    const environment: Properties = this.getAll();

    let property: Property | T | undefined = this._getProperty(environment, path);
    property = this._getDefaultValue(property, options?.defaultValue);
    property = this._getTargetType(property, options?.targetType);
    property = this._getTranspile(
      property,
      options?.transpile,
      options?.interpolation,
      options?.useEnvironmentToTranspile,
    );

    return property as T;
  }

  protected _getProperty(environment: Properties, path: Path): Property | undefined {
    return get(environment, path);
  }

  protected _getDefaultValue(property?: Property, defaultValue?: Property): Property | undefined {
    return property === undefined && defaultValue !== undefined ? defaultValue : property;
  }

  protected _getTargetType<T>(property?: Property, targetType?: (property: Property) => T): Property | T | undefined {
    return property !== undefined && targetType !== undefined ? targetType(property) : property;
  }

  protected _getTranspile<T>(
    property?: Property | T,
    transpile?: Properties,
    interpolation?: [string, string],
    useEnvironmentToTranspile?: boolean,
  ): Property | T | undefined {
    return property !== undefined && transpile !== undefined
      ? this._transpile(transpile, property, interpolation, useEnvironmentToTranspile)
      : property;
  }

  protected _transpile<T>(
    transpile: Properties,
    property?: Property | T,
    interpolation?: [string, string],
    useEnvironmentToTranspile?: boolean,
  ): Property | T | undefined {
    const config: EnvironmentConfig = this._config;

    if (interpolation != null) {
      config.interpolation = interpolation;
    }

    if (useEnvironmentToTranspile != null) {
      config.useEnvironmentToTranspile = useEnvironmentToTranspile;
    }

    if (isString(property)) {
      const matcher: RegExp = this._getMatcher(config.interpolation);

      return property.replace(matcher, (substring: string, match: string) => {
        const transpileProperties: Properties = this._getTranspileProperties(
          transpile,
          config.useEnvironmentToTranspile,
        );

        return this._replacer(substring, match, transpileProperties);
      });
    }

    return property;
  }

  protected _getMatcher(interpolation: [string, string]): RegExp {
    const [start, end]: [string, string] = interpolation;
    const escapedStart: string = this._escapeChars(start);
    const escapedEnd: string = this._escapeChars(end);

    return new RegExp(`${escapedStart}\\s*(.*?)\\s*${escapedEnd}`, 'g');
  }

  protected _escapeChars(chars: string): string {
    return [...chars].map((char: string) => `\\${char}`).join('');
  }

  protected _getTranspileProperties(properties: Properties, useEnvironmentToTranspile: boolean): Properties {
    if (!useEnvironmentToTranspile) {
      return properties;
    }

    const environment: Properties = this.store.getAll();

    return deepMerge(environment, properties);
  }

  protected _replacer(substring: string, match: string, properties: Properties): string {
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
  constructor(protected readonly store: EnvironmentStore, protected readonly config?: Partial<EnvironmentConfig>) {
    super(store, config);
  }
}

/**
 * Creates an environment query service.
 * @param store Manages the environment store.
 * @param config Optional partial configuration parameters for the Environment module.
 * @returns A basic EnvironmentQuery instance.
 */
export function createEnvironmentQuery(store: EnvironmentStore, config?: Partial<EnvironmentConfig>): EnvironmentQuery {
  return new EnvironmentQueryImpl(store, config);
}

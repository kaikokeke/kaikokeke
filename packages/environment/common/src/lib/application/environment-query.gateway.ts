import { deepMerge, unfreeze, unfreezeAll } from '@kaikokeke/common';
import { get, isEqual, isString } from 'lodash-es';
import { Observable } from 'rxjs';
import { distinctUntilChanged, map, shareReplay } from 'rxjs/operators';

import { EnvironmentConfig, Path, Properties, Property } from '../types';
import { environmentConfigFactory } from './environment-config-factory.function';
import { EnvironmentStore } from './environment-store.gateway';

/**
 * Gets the properties from the environment store.
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
   * Gets all the distinct environment properties as mutable.
   * @returns All the environment properties as Observable.
   */
  getProperties$(): Observable<Properties> {
    return this.store.getAll$().pipe(distinctUntilChanged(isEqual), shareReplay(1), unfreezeAll());
  }

  /**
   * Gets all the environment properties as mutable.
   * @returns All the environment properties.
   */
  getProperties(): Properties {
    const environment: Properties = this.store.getAll();

    return unfreeze(environment);
  }

  /**
   * Gets the distinct environment property at path as mutable.
   * @param path The property path to resolve.
   * @returns The environment property at path as Observable or `undefined` if the path cannot be resolved.
   * @see Path
   */
  getProperty$<P extends Property>(path: Path): Observable<P | undefined> {
    return this.getProperties$().pipe(map((environment: Properties): P | undefined => get(environment, path)));
  }

  /**
   * Gets the environment property at path as mutable.
   * @param path The property path to resolve.
   * @returns The environment property at path or `undefined` if the path cannot be resolved.
   * @see Path
   */
  getProperty<P extends Property>(path: Path): P | undefined {
    const environment: Properties = this.getProperties();

    return get(environment, path);
  }

  /**
   * Checks if the distinct environment property at path is available for resolution.
   * @param path The property path to resolve.
   * @returns `true` as Observable if the environment property at path exists, otherwise `false`.
   * @see Path
   */
  containsProperty$(path: Path): Observable<boolean> {
    return this.getProperty$(path).pipe(map((property?: Property) => property !== undefined));
  }

  /**
   * Checks if the environment property at path is available for resolution.
   * @param path The property path to resolve.
   * @returns `true` if the environment property at path exists, otherwise `false`.
   * @see Path
   */
  containsProperty(path: Path): boolean {
    const property: Property | undefined = this.getProperty(path);

    return property !== undefined;
  }

  /**
   * Gets the distinct required environment property at path as mutable.
   * @param path The property path to resolve.
   * @param defaultValue The value to return if the path cannot be resolved.
   * @returns The environment property at path as Observable or the `defaultValue` if the path cannot be resolved.
   * @see Path
   */
  getRequiredProperty$<P extends Property, D extends Property>(path: Path, defaultValue: D): Observable<P | D> {
    return this.getProperties$().pipe(map((environment: Properties): P | D => get(environment, path, defaultValue)));
  }

  /**
   * Gets the required environment property at path as mutable.
   * @param path The property path to resolve.
   * @param defaultValue The value to return if the path cannot be resolved.
   * @returns The environment property at path or the `defaultValue` if the path cannot be resolved.
   * @see Path
   */
  getRequiredProperty<P extends Property, D extends Property>(path: Path, defaultValue: D): P | D {
    const environment: Properties = this.getProperties();

    return get(environment, path, defaultValue);
  }

  /**
   * Gets the distinct typed environment property at path as mutable.
   * @param path The property path to resolve.
   * @param targetType The expected type converter function.
   * @returns The environment property at path converted to the `targetType` as Observable
   * or `undefined` if the path cannot be resolved.
   * @see Path
   */
  getTypedProperty$<P extends Property, T>(path: Path, targetType: (value: P) => T): Observable<T | undefined> {
    return this.getProperty$<P>(path).pipe(
      map((property?: P) => {
        if (property === undefined) {
          return;
        }

        return targetType(property);
      }),
      distinctUntilChanged(isEqual),
    );
  }

  /**
   * Gets the typed environment property at path as mutable.
   * @param path The property path to resolve.
   * @param targetType The expected type converter function.
   * @returns The environment property at path converted to the `targetType`
   * or `undefined` if the path cannot be resolved.
   * @see Path
   */
  getTypedProperty<P extends Property, T>(path: Path, targetType: (value: P) => T): T | undefined {
    const property: P | undefined = this.getProperty<P>(path);

    if (property === undefined) {
      return;
    }

    return targetType(property);
  }

  /**
   * Gets the distinct required typed environment property at path as mutable.
   * @param path The property path to resolve.
   * @param defaultValue The value to return if the path cannot be resolved.
   * @param targetType The expected type converter function.
   * @returns The environment property at path converted to the `targetType` as Observable
   * or the converted `defaultValue` if the path cannot be resolved.
   * @see Path
   */
  getRequiredTypedProperty$<P extends Property, D extends Property, T>(
    path: Path,
    defaultValue: D,
    targetType: (value: P | D) => T,
  ): Observable<T> {
    return this.getRequiredProperty$<P, D>(path, defaultValue).pipe(
      map((property: P | D) => targetType(property)),
      distinctUntilChanged(isEqual),
    );
  }

  /**
   * Gets the required typed environment property at path as mutable.
   * @param path The property path to resolve.
   * @param defaultValue The value to return if the path cannot be resolved.
   * @param targetType The expected type converter function.
   * @returns The environment property at path converted to the `targetType`
   * or the converted `defaultValue` if the path cannot be resolved.
   * @see Path
   */
  getRequiredTypedProperty<P extends Property, D extends Property, T>(
    path: Path,
    defaultValue: D,
    targetType: (value: P | D) => T,
  ): T {
    const property: P | D = this.getRequiredProperty<P, D>(path, defaultValue);

    return targetType(property);
  }

  /**
   * Gets the distinct transpiled environment property at path as mutable.
   * @param path The property path to resolve.
   * @param properties The properties to resolve the interpolation.
   * @param config The custom environment config for the transpile.
   * @returns The transpiled environment property at path as Observable
   * or `undefined` if the path cannot be resolved.
   * @see Path
   */
  getTranspiledProperty$<P extends Property>(
    path: Path,
    properties?: Properties,
    config?: Partial<EnvironmentConfig>,
  ): Observable<P | string | undefined> {
    return this.getProperty$<P>(path).pipe(
      map((property?: P) => {
        if (property === undefined) {
          return;
        }

        return this.transpile(property, properties, config);
      }),
    );
  }

  /**
   * Gets the transpiled environment property at path as mutable.
   * @param path The property path to resolve.
   * @param properties The properties to resolve the interpolation.
   * @param config The custom environment config for the transpile.
   * @returns The transpiled environment property at path or `undefined` if the path cannot be resolved.
   * @see Path
   */
  getTranspiledProperty<P extends Property>(
    path: Path,
    properties?: Properties,
    config?: Partial<EnvironmentConfig>,
  ): P | string | undefined {
    const property: P | undefined = this.getProperty<P>(path);

    if (property === undefined) {
      return;
    }

    return this.transpile(property, properties, config);
  }

  /**
   * Gets the distinct required transpiled environment property at path as mutable.
   * @param path The property path to resolve.
   * @param defaultValue The default value to resolve if no value is found.
   * @param properties The properties to resolve the interpolation.
   * @param config The custom environment config for the transpile.
   * @returns The transpiled environment property at path as Observable
   * or the transpiled `defaultValue` if the path cannot be resolved.
   * @see Path
   */
  getRequiredTranspiledProperty$<P extends Property, D extends Property>(
    path: Path,
    defaultValue: D,
    properties?: Properties,
    config?: Partial<EnvironmentConfig>,
  ): Observable<P | D | string> {
    return this.getRequiredProperty$<P, D>(path, defaultValue).pipe(
      map((property: P | D) => this.transpile(property, properties, config)),
    );
  }

  /**
   * Gets the required transpiled environment property at path as mutable.
   * @param path The property path to resolve.
   * @param defaultValue The default value to resolve if no value is found.
   * @param properties The properties to resolve the interpolation.
   * @param config The custom environment config for the transpile.
   * @returns The transpiled environment property at path
   * or the transpiled `defaultValue` if the path cannot be resolved.
   * @see Path
   */
  getRequiredTranspiledProperty<P extends Property, D extends Property>(
    path: Path,
    defaultValue: D,
    properties?: Properties,
    config?: Partial<EnvironmentConfig>,
  ): P | D | string {
    const property: P | D = this.getRequiredProperty<P, D>(path, defaultValue);

    return this.transpile(property, properties, config);
  }

  protected transpile<T extends Property>(
    value: T,
    properties: Properties = {},
    config: Partial<EnvironmentConfig> = {},
  ): T | string {
    const transpileConfig: EnvironmentConfig = { ...this.config, ...config };

    if (isString(value)) {
      const matcher: RegExp = this.getMatcher(transpileConfig);

      return value.replace(matcher, (substring: string, match: string) => {
        const transpiledProperties: Properties = this.getTranspileProperties(properties, transpileConfig);

        return this.replacer(substring, match, transpiledProperties);
      });
    }

    return value;
  }

  protected getMatcher(config: EnvironmentConfig): RegExp {
    const [start, end]: [string, string] = config.interpolation;

    return new RegExp(`${this.escapeChars(start)}\\s*(.*?)\\s*${this.escapeChars(end)}`, 'g');
  }

  protected escapeChars(chars: string): string {
    return [...chars].map((char: string) => `\\${char}`).join('');
  }

  protected getTranspileProperties(properties: Properties, config: EnvironmentConfig): Properties {
    return config.useEnvironmentToTranspile ? (deepMerge(this.store.getAll(), properties) as Properties) : properties;
  }

  protected replacer(substring: string, match: string, properties: Properties): string {
    const value: Property | undefined = get(properties, match);

    if (value == null) {
      return substring;
    }

    return typeof value === 'object' ? JSON.stringify(value) : String(value);
  }
}

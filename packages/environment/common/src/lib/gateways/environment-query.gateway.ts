import { mergeDeep, unfreeze, unfreezeAll } from '@kaikokeke/common';
import { get, isEqual, isString } from 'lodash-es';
import { MonoTypeOperatorFunction, Observable } from 'rxjs';
import { distinctUntilChanged, map, shareReplay } from 'rxjs/operators';

import { environmentConfigFactory } from '../application';
import { EnvironmentConfig, Path, Properties, Property } from '../types';
import { EnvironmentStoreGateway } from './environment-store.gateway';

/**
 * Gets the properties from the environment store.
 */
export abstract class EnvironmentQueryGateway {
  protected readonly config: EnvironmentConfig = environmentConfigFactory(this.partialConfig);

  /**
   * Gets the properties from the environment store.
   * @param store Manages the environment store.
   * @param partialConfig Partial configuration parameters for the Environment module.
   */
  constructor(
    protected readonly store: EnvironmentStoreGateway,
    protected readonly partialConfig: Partial<EnvironmentConfig>,
  ) {}

  /**
   * Gets all the distinct environment properties as mutable.
   * @returns All the environment properties as Observable.
   */
  getProperties$(): Observable<Properties> {
    return this.store.getAll$().pipe(this.getterOperator(), unfreezeAll());
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
  getProperty$(path: Path): Observable<Property | undefined> {
    return this.getProperties$().pipe(
      map((environment: Properties) => get(environment, path)),
      this.getterOperator(),
    );
  }

  /**
   * Gets the environment property at path as mutable.
   * @param path The property path to resolve.
   * @returns The environment property at path or `undefined` if the path cannot be resolved.
   * @see Path
   */
  getProperty(path: Path): Property | undefined {
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
    return this.getProperty$(path).pipe(
      map((property?: Property) => property !== undefined),
      this.getterOperator(),
    );
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
  getRequiredProperty$(path: Path, defaultValue: Property): Observable<Property> {
    return this.getProperties$().pipe(
      map((environment: Properties) => get(environment, path, defaultValue)),
      this.getterOperator(),
    );
  }

  /**
   * Gets the required environment property at path as mutable.
   * @param path The property path to resolve.
   * @param defaultValue The value to return if the path cannot be resolved.
   * @returns The environment property at path or the `defaultValue` if the path cannot be resolved.
   * @see Path
   */
  getRequiredProperty(path: Path, defaultValue: Property): Property {
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
  getTypedProperty$<V>(path: Path, targetType: (value: Property) => V): Observable<V | undefined> {
    return this.getProperty$(path).pipe(
      map((property?: Property) => {
        if (property === undefined) {
          return;
        }

        return targetType(property);
      }),
      this.getterOperator(),
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
  getTypedProperty<V>(path: Path, targetType: (value: Property) => V): V | undefined {
    const property: Property | undefined = this.getProperty(path);

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
  getRequiredTypedProperty$<V>(path: Path, defaultValue: Property, targetType: (value: Property) => V): Observable<V> {
    return this.getRequiredProperty$(path, defaultValue).pipe(
      map((property: Property) => targetType(property)),
      this.getterOperator(),
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
  getRequiredTypedProperty<V>(path: Path, defaultValue: Property, targetType: (value: Property) => V): V {
    const property: Property = this.getRequiredProperty(path, defaultValue);

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
  getTranspiledProperty$(
    path: Path,
    properties?: Properties,
    config?: Partial<EnvironmentConfig>,
  ): Observable<Property | undefined> {
    return this.getProperty$(path).pipe(
      map((property?: Property) => {
        if (property === undefined) {
          return;
        }

        return this.transpile(property, properties, config);
      }),
      this.getterOperator(),
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
  getTranspiledProperty(
    path: Path,
    properties?: Properties,
    config?: Partial<EnvironmentConfig>,
  ): Property | undefined {
    const property: Property | undefined = this.getProperty(path);

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
  getRequiredTranspiledProperty$(
    path: Path,
    defaultValue: Property,
    properties?: Properties,
    config?: Partial<EnvironmentConfig>,
  ): Observable<Property> {
    return this.getRequiredProperty$(path, defaultValue).pipe(
      map((property: Property) => this.transpile(property, properties, config)),
      this.getterOperator(),
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
  getRequiredTranspiledProperty(
    path: Path,
    defaultValue: Property,
    properties?: Properties,
    config?: Partial<EnvironmentConfig>,
  ): Property {
    const property: Property = this.getRequiredProperty(path, defaultValue);

    return this.transpile(property, properties, config);
  }

  protected transpile(value: Property, properties: Properties = {}, config: Partial<EnvironmentConfig> = {}): Property {
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

  protected getTranspileProperties(properties: Properties, config: EnvironmentConfig): Properties {
    return config.useEnvironmentToTranspile ? (mergeDeep(this.store.getAll(), properties) as Properties) : properties;
  }

  protected replacer(substring: string, match: string, properties: Properties): string {
    const value: Property | undefined = get(properties, match);

    if (value == null) {
      return substring;
    }

    return typeof value === 'object' ? JSON.stringify(value) : String(value);
  }

  protected getMatcher(config: EnvironmentConfig): RegExp {
    const [start, end]: [string, string] = config.interpolation;

    return new RegExp(`${start} *(.*?) *${end}`, 'g');
  }

  protected getterOperator<T>(): MonoTypeOperatorFunction<T> {
    return (observable: Observable<T>) => observable.pipe(distinctUntilChanged<T>(isEqual), shareReplay<T>(1));
  }
}

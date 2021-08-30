import { mergeDeep, unfreeze, unfreezeAll } from '@kaikokeke/common';
import { get, isEqual, isString } from 'lodash-es';
import { Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

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
   * Gets all the distinct environment properties.
   * @returns All the distinct environment properties as Observable.
   */
  getProperties$(): Observable<Properties> {
    return this.store.getAll$().pipe(distinctUntilChanged(isEqual), unfreezeAll());
  }

  /**
   * Gets all the environment properties.
   * @returns All the environment properties.
   */
  getProperties(): Properties {
    const environment: Properties = this.store.getAll();

    return unfreeze(environment);
  }

  /**
   * Gets the distinct environment property at path as Observable.
   * @param path The property path to resolve.
   * @returns The distinct environment property at path as Observable or `undefined` if the path cannot be resolved.
   */
  getProperty$(path: Path): Observable<Property | undefined> {
    return this.getProperties$().pipe(
      map((environment: Properties) => get(environment, path)),
      distinctUntilChanged(isEqual),
    );
  }

  /**
   * Gets the environment property at path.
   * @param path The property path to resolve.
   * @returns The environment property at path or `undefined` if the path cannot be resolved.
   */
  getProperty(path: Path): Property | undefined {
    const environment: Properties = this.getProperties();

    return get(environment, path);
  }

  /**
   * Checks if the distinct environment property at path is available for resolution.
   * @param path The property path to resolve.
   * @returns Distinct `true` as Observable if the environment property at path exists, otherwise `false`.
   */
  containsProperty$(path: Path): Observable<boolean> {
    return this.getProperty$(path).pipe(
      map((property?: Property) => property !== undefined),
      distinctUntilChanged(),
    );
  }

  /**
   * Checks if the environment property at path is available for resolution.
   * @param path The property path to resolve.
   * @returns `true` if the environment property at path exists, otherwise `false`.
   */
  containsProperty(path: Path): boolean {
    const property: Property | undefined = this.getProperty(path);

    return property !== undefined;
  }

  /**
   * Gets the required property value associated with the given path.
   * @param path The property path to resolve.
   * @param defaultValue The default value to return if no value is found.
   * @returns The property value as Observable or `defaultValue` if the path cannot be resolved.
   */
  getRequiredProperty$(path: Path, defaultValue: Property): Observable<Property> {
    return this.getProperties$().pipe(
      map((environment: Properties) => get(environment, path, defaultValue)),
      distinctUntilChanged(isEqual),
    );
  }

  /**
   * Gets the required property value associated with the given path.
   * @param path The property path to resolve.
   * @param defaultValue The default value to return if no value is found.
   * @returns The property value or `defaultValue` if the path cannot be resolved.
   */
  getRequiredProperty(path: Path, defaultValue: Property): Property {
    const environment: Properties = this.getProperties();

    return get(environment, path, defaultValue);
  }

  /**
   * Gets the typed property value associated with the given path.
   * @param path The property path to resolve.
   * @param targetType The expected type converter function.
   * @returns The property value converted to the `targetType` as Observable
   * or `undefined` if the path cannot be resolved.
   */
  getTypedProperty$<V>(path: Path, targetType: (value: Property) => V): Observable<V | undefined> {
    return this.getProperty$(path).pipe(
      map((property?: Property) => {
        if (property === undefined) {
          return;
        }

        return targetType(property);
      }),
      distinctUntilChanged(isEqual),
    );
  }

  /**
   * Gets the typed property value associated with the given path.
   * @param path The property path to resolve.
   * @param targetType The expected type converter function.
   * @returns The property value converted to the `targetType` or `undefined` if the path cannot be resolved.
   */
  getTypedProperty<V>(path: Path, targetType: (value: Property) => V): V | undefined {
    const property: Property = this.getProperty(path);

    if (property === undefined) {
      return;
    }

    return targetType(property);
  }

  /**
   * Gets the required typed property value associated with the given path.
   * @param path The property path to resolve.
   * @param defaultValue The default value to return if no value is found.
   * @param targetType The expected type converter function.
   * @returns The property value converted to the `targetType` as Observable
   * or the converted `defaultValue` if the path cannot be resolved.
   */
  getRequiredTypedProperty$<V>(path: Path, defaultValue: Property, targetType: (value: Property) => V): Observable<V> {
    return this.getRequiredProperty$(path, defaultValue).pipe(
      map((property: Property) => targetType(property)),
      distinctUntilChanged(isEqual),
    );
  }

  /**
   * Gets the required typed property value associated with the given path.
   * @param path The property path to resolve.
   * @param defaultValue The default value to return if no value is found.
   * @param targetType The expected type converter function.
   * @returns The property value converted to the `targetType`
   * or the converted `defaultValue` if the path cannot be resolved.
   */
  getRequiredTypedProperty<V>(path: Path, defaultValue: Property, targetType: (value: Property) => V): V {
    const property: Property = this.getRequiredProperty(path, defaultValue);

    return targetType(property);
  }

  /**
   * Transpiles the interpolation placeholders in the value at path.
   * @param path The property path to resolve.
   * @param properties The properties to resolve the interpolation.
   * @param config The custom environment config for this transpile.
   * @returns The transpiled value as Observable or `undefined` if the path cannot be resolved.
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
      distinctUntilChanged(isEqual),
    );
  }

  /**
   * Transpiles the interpolation placeholders in the value at path.
   * @param path The property path to resolve.
   * @param properties The properties to resolve the interpolation.
   * @param config The custom environment config for this transpile.
   * @returns The transpiled value or `undefined` if the path cannot be resolved.
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
   * Transpiles the interpolation placeholders in the value at path.
   * @param path The property path to resolve.
   * @param defaultValue The default value to resolve if no value is found.
   * @param properties The properties to resolve the interpolation.
   * @param config The custom environment config for this transpile.
   * @returns The transpiled value as Observable or `defaultValue` if the path cannot be resolved.
   */
  getRequiredTranspiledProperty$(
    path: Path,
    defaultValue: Property,
    properties?: Properties,
    config?: Partial<EnvironmentConfig>,
  ): Observable<Property> {
    return this.getRequiredProperty$(path, defaultValue).pipe(
      map((property: Property) => this.transpile(property, properties, config)),
      distinctUntilChanged(isEqual),
    );
  }

  /**
   * Transpiles the interpolation placeholders in the value at path.
   * @param path The property path to resolve.
   * @param defaultValue The default value to resolve if no value is found.
   * @param properties The properties to resolve the interpolation.
   * @param config The custom environment config for this transpile.
   * @returns The transpiled value or `defaultValue` if the path cannot be resolved.
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

  protected transpile(value: Property, properties: Properties = {}, config?: Partial<EnvironmentConfig>): Property {
    const transpileConfig: EnvironmentConfig = this.getTranspileConfig(config);

    if (isString(value)) {
      const matcher: RegExp = this.getMatcher(transpileConfig);

      return value.replace(matcher, (substring: string, match: string) => {
        const transpiledProperties: Properties = this.getTranspileProperties(properties, transpileConfig);

        return this.replacer(substring, match, transpiledProperties);
      });
    }

    return value;
  }

  protected getTranspileConfig(config?: Partial<EnvironmentConfig>): EnvironmentConfig {
    return config ? { ...this.config, ...config } : this.config;
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
}

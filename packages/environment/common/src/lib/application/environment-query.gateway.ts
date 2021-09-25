import { deepMerge } from '@kaikokeke/common';
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
   * Gets all the distinct environment properties.
   * @returns All the environment properties as Observable.
   */
  getProperties$(): Observable<Properties> {
    return this.store.getAll$().pipe(distinctUntilChanged(isEqual), shareReplay(1));
  }

  /**
   * Gets all the environment properties.
   * @returns All the environment properties.
   */
  getProperties(): Properties {
    return this.store.getAll();
  }

  /**
   * Gets the distinct environment property at path.
   * @param path The property path to resolve.
   * @returns The environment property at path as Observable or `undefined` if the path cannot be resolved.
   * @see Path
   */
  getProperty$<P extends Property>(path: Path): Observable<P | undefined> {
    return this.getProperties$().pipe(
      map((environment: Properties): P | undefined => this._getProperty(environment, path)),
      distinctUntilChanged(isEqual),
    );
  }

  /**
   * Gets the environment property at path.
   * @param path The property path to resolve.
   * @returns The environment property at path or `undefined` if the path cannot be resolved.
   * @see Path
   */
  getProperty<P extends Property>(path: Path): P | undefined {
    const environment: Properties = this.getProperties();

    return this._getProperty(environment, path);
  }

  protected _getProperty<P extends Property>(environment: Properties, path: Path): P | undefined {
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
      map((property?: Property) => this._containsProperty(property)),
      distinctUntilChanged(),
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

    return this._containsProperty(property);
  }

  protected _containsProperty(property?: Property): boolean {
    return property !== undefined;
  }

  /**
   * Gets the distinct required environment property at path.
   * @param path The property path to resolve.
   * @param defaultValue The value to return if the path cannot be resolved.
   * @returns The environment property at path as Observable or the `defaultValue` if the path cannot be resolved.
   * @throws If the property at path is undefined and `defaultValue` is not provided.
   * @see Path
   */
  getRequiredProperty$<P extends Property, D extends Property>(path: Path, defaultValue?: D): Observable<P | D> {
    return this.getProperties$().pipe(
      map((environment: Properties) => this._getRequiredProperty(environment, path, defaultValue)),
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
  getRequiredProperty<P extends Property, D extends Property>(path: Path, defaultValue?: D): P | D {
    const environment: Properties = this.getProperties();

    return this._getRequiredProperty(environment, path, defaultValue);
  }

  protected _getRequiredProperty<P extends Property, D extends Property>(
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
  getTypedProperty$<P extends Property, T>(path: Path, targetType: (value: P) => T): Observable<T | undefined> {
    return this.getProperty$<P>(path).pipe(
      map((property?: P) => this._getTypedProperty(targetType, property)),
      distinctUntilChanged(isEqual),
    );
  }

  /**
   * Gets the typed environment property at path.
   * @param path The property path to resolve.
   * @param targetType The expected type converter function.
   * @returns The environment property at path converted to the `targetType`
   * or `undefined` if the path cannot be resolved.
   * @see Path
   */
  getTypedProperty<P extends Property, T>(path: Path, targetType: (value: P) => T): T | undefined {
    const property: P | undefined = this.getProperty<P>(path);

    return this._getTypedProperty(targetType, property);
  }

  protected _getTypedProperty<P extends Property, T>(targetType: (value: P) => T, property?: P): T | undefined {
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
  getRequiredTypedProperty$<P extends Property, D extends Property, T>(
    path: Path,
    targetType: (value: P | D) => T,
    defaultValue?: D,
  ): Observable<T> {
    return this.getRequiredProperty$<P, D>(path, defaultValue).pipe(
      map((property: P | D) => this._getRequiredTypedProperty(property, targetType)),
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
  getRequiredTypedProperty<P extends Property, D extends Property, T>(
    path: Path,
    targetType: (value: P | D) => T,
    defaultValue?: D,
  ): T {
    const property: P | D = this.getRequiredProperty<P, D>(path, defaultValue);

    return this._getRequiredTypedProperty(property, targetType);
  }

  protected _getRequiredTypedProperty<P extends Property, D extends Property, T>(
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
  getTranspiledProperty$<P extends Property>(
    path: Path,
    properties?: Properties,
    config?: Partial<EnvironmentConfig>,
  ): Observable<P | string | undefined> {
    return this.getProperty$<P>(path).pipe(
      map((property?: P) => this._getTranspiledProperty(property, properties, config)),
      distinctUntilChanged(isEqual),
    );
  }

  /**
   * Gets the transpiled environment property at path.
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

    return this._getTranspiledProperty(property, properties, config);
  }

  protected _getTranspiledProperty<P extends Property>(
    property?: P,
    properties?: Properties,
    config?: Partial<EnvironmentConfig>,
  ): P | string | undefined {
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
  getRequiredTranspiledProperty$<P extends Property, D extends Property>(
    path: Path,
    defaultValue?: D,
    properties?: Properties,
    config?: Partial<EnvironmentConfig>,
  ): Observable<P | D | string> {
    return this.getRequiredProperty$<P, D>(path, defaultValue).pipe(
      map((property: P | D) => this._getRequiredTranspiledProperty(property, properties, config)),
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
  getRequiredTranspiledProperty<P extends Property, D extends Property>(
    path: Path,
    defaultValue?: D,
    properties?: Properties,
    config?: Partial<EnvironmentConfig>,
  ): P | D | string {
    const property: P | D = this.getRequiredProperty<P, D>(path, defaultValue);

    return this._getRequiredTranspiledProperty(property, properties, config);
  }

  protected _getRequiredTranspiledProperty<P extends Property>(
    property: P,
    properties?: Properties,
    config?: Partial<EnvironmentConfig>,
  ): P | string {
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
        const transpileProperties: Properties = this.getTranspileProperties(properties, transpileConfig);

        return this.replacer(substring, match, transpileProperties);
      });
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

    return typeof value === 'object' ? JSON.stringify(value) : String(value);
  }
}

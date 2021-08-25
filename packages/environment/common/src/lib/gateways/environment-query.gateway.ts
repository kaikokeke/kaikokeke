import { mergeDeep } from '@kaikokeke/common';
import { get, isEqual, isString } from 'lodash-es';
import { Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

import { environmentConfigFactory } from '../application';
import { EnvironmentConfig, Path, Properties, Property } from '../types';
import { EnvironmentStoreGateway } from './environment-store.gateway';

export abstract class EnvironmentQueryGateway {
  protected readonly config: EnvironmentConfig = environmentConfigFactory(this.partialConfig);

  constructor(
    protected readonly store: EnvironmentStoreGateway,
    protected readonly partialConfig: Partial<EnvironmentConfig>,
  ) {}

  /**
   * Checks whether the given environment property path is available for resolution.
   * @param path The property path to resolve.
   * @returns `true` as Observable if the value for the given path exists, otherwise `false`.
   */
  containsProperty$(path: Path): Observable<boolean> {
    return this.store.getAll$().pipe(
      map((props: Properties) => get(props, path) !== undefined),
      distinctUntilChanged(),
    );
  }

  /**
   * Checks whether the given environment property path is available for resolution.
   * @param path The property path to resolve.
   * @returns `true` if the value for the given path exists, otherwise `false`.
   */
  containsProperty(path: Path): boolean {
    return get(this.store.getAll(), path) !== undefined;
  }

  /**
   * Gets all the environment properties.
   * @returns The environment properties values as Observable.
   */
  getProperties$(): Observable<Properties> {
    return this.store.getAll$().pipe(distinctUntilChanged(isEqual));
  }

  /**
   * Gets all the environment properties.
   * @returns The environment properties values.
   */
  getProperties(): Properties {
    return this.store.getAll();
  }

  /**
   * Gets the property value associated with the given path.
   * @param path The property path to resolve.
   * @returns The property value as Observable or `undefined` if the path cannot be resolved.
   */
  getProperty$<V>(path: Path): Observable<V | undefined> {
    return this.store.getAll$().pipe(
      map((props: Properties) => get(props, path)),
      distinctUntilChanged(isEqual),
    );
  }

  /**
   * Gets the property value associated with the given path.
   * @param path The property path to resolve.
   * @returns The property value or `undefined` if the path cannot be resolved.
   */
  getProperty<V>(path: Path): V | undefined {
    return get(this.store.getAll(), path);
  }

  /**
   * Gets the typed property value associated with the given path.
   * @param path The property path to resolve.
   * @param targetType The expected type converter function.
   * @returns The property value converted to the `targetType` as Observable
   * or `undefined` if the path cannot be resolved.
   */
  getTypedProperty$<T, V>(path: Path, targetType: (value: T) => V): Observable<V | undefined> {
    return this.store.getAll$().pipe(
      map((props: Properties) => get(props, path)),
      map((value?: T) => (value === undefined ? undefined : targetType(value))),
      distinctUntilChanged(isEqual),
    );
  }

  /**
   * Gets the typed property value associated with the given path.
   * @param path The property path to resolve.
   * @param targetType The expected type converter function.
   * @returns The property value converted to the `targetType` or `undefined` if the path cannot be resolved.
   */
  getTypedProperty<T, V>(path: Path, targetType: (value: T) => V): V | undefined {
    const value: T = get(this.store.getAll(), path);

    return value === undefined ? undefined : targetType(value);
  }

  /**
   * Gets the required property value associated with the given path.
   * @param path The property path to resolve.
   * @param defaultValue The default value to return if no value is found.
   * @returns The property value as Observable or `defaultValue` if the path cannot be resolved.
   */
  getRequiredProperty$<V>(path: Path, defaultValue: V): Observable<V> {
    return this.store.getAll$().pipe(
      map((props: Properties) => get(props, path, defaultValue)),
      distinctUntilChanged(isEqual),
    );
  }

  /**
   * Gets the required property value associated with the given path.
   * @param path The property path to resolve.
   * @param defaultValue The default value to return if no value is found.
   * @returns The property value or `defaultValue` if the path cannot be resolved.
   */
  getRequiredProperty<V>(path: Path, defaultValue: V): V {
    return get(this.store.getAll(), path, defaultValue);
  }

  /**
   * Gets the required typed property value associated with the given path.
   * @param path The property path to resolve.
   * @param defaultValue The default value to return if no value is found.
   * @param targetType The expected type converter function.
   * @returns The property value converted to the `targetType` as Observable
   * or the converted `defaultValue` if the path cannot be resolved.
   */
  getRequiredTypedProperty$<T, V>(path: Path, defaultValue: T, targetType: (value: T) => V): Observable<V> {
    return this.store.getAll$().pipe(
      map((props: Properties) => get(props, path, defaultValue)),
      map((value: T) => targetType(value)),
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
  getRequiredTypedProperty<T, V>(path: Path, defaultValue: T, targetType: (value: T) => V): V {
    return targetType(get(this.store.getAll(), path, defaultValue));
  }

  /**
   * Transpiles the interpolation placeholders in the value at path.
   * @param path The property path to resolve.
   * @param properties The properties to resolve the interpolation.
   * @param config The custom environment config for this transpile.
   * @returns The transpiled value as Observable or `undefined` if the path cannot be resolved.
   */
  getTranspiledProperty$<V>(
    path: Path,
    properties?: Properties,
    config?: Partial<EnvironmentConfig>,
  ): Observable<V | string | undefined> {
    return this.store.getAll$().pipe(
      map((props: Properties) => get(props, path)),
      map((value?: V) => (value === undefined ? undefined : this.transpile(value, properties, config))),
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
  getTranspiledProperty<V>(
    path: Path,
    properties?: Properties,
    config?: Partial<EnvironmentConfig>,
  ): V | string | undefined {
    const value: V | undefined = get(this.store.getAll(), path);

    return value === undefined ? undefined : this.transpile(value, properties, config);
  }

  /**
   * Transpiles the interpolation placeholders in the value at path.
   * @param path The property path to resolve.
   * @param defaultValue The default value to resolve if no value is found.
   * @param properties The properties to resolve the interpolation.
   * @param config The custom environment config for this transpile.
   * @returns The transpiled value as Observable or `defaultValue` if the path cannot be resolved.
   */
  getRequiredTranspiledProperty$<V>(
    path: Path,
    defaultValue: V,
    properties?: Properties,
    config?: Partial<EnvironmentConfig>,
  ): Observable<V | string> {
    return this.store.getAll$().pipe(
      map((props: Properties) => get(props, path, defaultValue)),
      map((value: V) => this.transpile(value, properties, config)),
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
  getRequiredTranspiledProperty<V>(
    path: Path,
    defaultValue: V,
    properties?: Properties,
    config?: Partial<EnvironmentConfig>,
  ): V | string {
    return this.transpile(get(this.store.getAll(), path, defaultValue), properties, config);
  }

  protected transpile<V>(value: V, properties: Properties = {}, config?: Partial<EnvironmentConfig>): V | string {
    const transpileConfig: EnvironmentConfig = this.getTranspileConfig(config);

    if (isString(value)) {
      return value.replace(this.getMatcher(transpileConfig), (substring: string, match: string) =>
        this.replacer(substring, match, this.getTranspileProperties(properties, transpileConfig)),
      );
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

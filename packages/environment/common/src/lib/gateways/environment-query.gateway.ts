import { get, isEqual } from 'lodash-es';
import { Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

import { Path, Properties } from '../types';
import { EnvironmentStoreGateway } from './environment-store.gateway';

export abstract class EnvironmentQueryGateway {
  constructor(protected readonly store: EnvironmentStoreGateway) {}

  /**
   * Checks whether the given environment property path is available for resolution.
   * @param path The property path to resolve.
   * @returns `true` as Observable if the value for the given path exists, otherwise `false`.
   */
  containsProperty$(path: Path): Observable<boolean> {
    return this.store.getAll$().pipe(
      map((properties: Properties) => get(properties, path) !== undefined),
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
      map((properties: Properties) => get(properties, path)),
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
      map((properties: Properties) => get(properties, path)),
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
      map((properties: Properties) => get(properties, path, defaultValue)),
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
      map((properties: Properties) => get(properties, path, defaultValue)),
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
}

import { Observable } from 'rxjs';

import { Path, Properties } from '../types';

/**
 * Gets a property value from the environment store.
 */
export interface PropertyGetter {
  /**
   * Gets all the environment properties.
   * @returns The environment properties values as Observable.
   */
  getProperties$(): Observable<Properties>;

  /**
   * Gets all the environment properties.
   * @returns The environment properties values.
   */
  getProperties(): Properties;

  /**
   * Gets the property value associated with the given path.
   * @param path The property path to resolve.
   * @returns The property value as Observable or `undefined` if the path cannot be resolved.
   */
  getProperty$<V>(path: Path): Observable<V | undefined>;

  /**
   * Gets the property value associated with the given path.
   * @param path The property path to resolve.
   * @returns The property value or `undefined` if the path cannot be resolved.
   */
  getProperty<V>(path: Path): V | undefined;

  /**
   * Gets the typed property value associated with the given path.
   * @param path The property path to resolve.
   * @param targetType The expected type converter function.
   * @returns The property value converted to the `targetType` as Observable
   * or `undefined` if the path cannot be resolved.
   */
  getTypedProperty$<T, V>(path: Path, targetType: (value: T) => V): Observable<V | undefined>;

  /**
   * Gets the typed property value associated with the given path.
   * @param path The property path to resolve.
   * @param targetType The expected type converter function.
   * @returns The property value converted to the `targetType` or `undefined` if the path cannot be resolved.
   */
  getTypedProperty<T, V>(path: Path, targetType: (value: T) => V): V | undefined;

  /**
   * Gets the required property value associated with the given path.
   * @param path The property path to resolve.
   * @param defaultValue The default value to return if no value is found.
   * @returns The property value as Observable or `defaultValue` if the path cannot be resolved.
   */
  getRequiredProperty$<V>(path: Path, defaultValue: V): Observable<V>;

  /**
   * Gets the required property value associated with the given path.
   * @param path The property path to resolve.
   * @param defaultValue The default value to return if no value is found.
   * @returns The property value or `defaultValue` if the path cannot be resolved.
   */
  getRequiredProperty<V>(path: Path, defaultValue: V): V;

  /**
   * Gets the required typed property value associated with the given path.
   * @param path The property path to resolve.
   * @param defaultValue The default value to return if no value is found.
   * @param targetType The expected type converter function.
   * @returns The property value converted to the `targetType` as Observable
   * or the converted `defaultValue` if the path cannot be resolved.
   */
  getRequiredTypedProperty$<T, V>(path: Path, defaultValue: T, targetType: (value: T) => V): Observable<V>;

  /**
   * Gets the required typed property value associated with the given path.
   * @param path The property path to resolve.
   * @param defaultValue The default value to return if no value is found.
   * @param targetType The expected type converter function.
   * @returns The property value converted to the `targetType`
   * or the converted `defaultValue` if the path cannot be resolved.
   */
  getRequiredTypedProperty<T, V>(path: Path, defaultValue: T, targetType: (value: T) => V): V;
}

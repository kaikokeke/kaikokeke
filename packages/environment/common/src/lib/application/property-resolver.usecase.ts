import { Observable } from 'rxjs';

import { Path, Properties } from '../types';

/**
 * Gets a property value with interpolated placeholders from the environment store.
 */
export interface PropertyResolver {
  /**
   * Resolves the interpolation placeholders in the value at path.
   *
   * Non-string properties will be converted to string.
   * The placeholders are replaced with the corresponding properties, defaulting to the environment values.
   * @param path The property path to resolve.
   * @param properties The properties to resolve the placeholders.
   * @returns The resolved string as Observable or `undefined` if the path cannot be resolved.
   */
  resolvePlaceholders$(path: Path, properties?: Properties): Observable<string | undefined>;

  /**
   * Resolves the interpolation placeholders in the value at path.
   *
   * Non-string properties will be converted to string.
   * The placeholders are replaced with the corresponding properties, defaulting to the environment values.
   * @param path The property path to resolve.
   * @param properties The properties to resolve the placeholders.
   * @returns The resolved string or `undefined` if the path cannot be resolved.
   */
  resolvePlaceholders(path: Path, properties?: Properties): string | undefined;

  /**
   * Resolve the interpolation placeholders in the value at path as Observable.
   *
   * Non-string properties will be converted to string.
   * The placeholders are replaced with the corresponding properties, defaulting to the environment values.
   * @param path The property path to resolve.
   * @param defaultValue The default value to resolve if no value is found.
   * @param properties The properties to resolve the placeholders.
   * @returns The resolved string as Observable or `defaultValue` if the path cannot be resolved.
   */
  resolveRequiredPlaceholders$(path: Path, defaultValue: string, properties?: Properties): Observable<string>;

  /**
   * Resolve the interpolation placeholders in the value at path.
   *
   * Non-string properties will be converted to string.
   * The placeholders are replaced with the corresponding properties, defaulting to the environment values.
   * @param path The property path to resolve.
   * @param defaultValue The default value to resolve if no value is found.
   * @param properties The properties to resolve the placeholders.
   * @returns The resolved string or `defaultValue` if the path cannot be resolved.
   */
  resolveRequiredPlaceholders(path: Path, defaultValue: string, properties?: Properties): string;
}

/**
 * Configuration parameters for the Environment module.
 */
export interface EnvironmentConfig {
  /**
   * The start and end markings for interpolation parameters.
   * Defaults to `['{{', '}}']`.
   */
  interpolation: [string, string];

  /**
   * Sets the default behavior when loading during initialization.
   *
   * If sets to `true` all sources will be loaded in order, one after another.
   * If sets to `false` all sources will be loaded at the same time and the properties will be set as they are resolved.
   * Defaults to `true`.
   */
  loadInOrder: boolean;

  /**
   * Maximum waiting time in miliseconds before loading the application.
   * Defaults to `undefined`.
   */
  maxLoadTime?: number;
}

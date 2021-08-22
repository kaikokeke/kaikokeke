/**
 * Configuration parameters for the Environment module.
 */
export interface EnvironmentConfig {
  /**
   * The start and end markings for interpolation parameters.
   * Defaults to `['{{', '}}']`.
   */
  interpolation: [string, string];
}

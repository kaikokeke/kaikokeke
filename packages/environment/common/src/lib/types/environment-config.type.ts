/**
 * Configuration parameters for the Environment module.
 */
export interface EnvironmentConfig {
  /**
   * The start and end markings for interpolation parameters.
   */
  interpolation: [string, string];
}

/**
 * Returns the initial environment configuration with all default values.
 * @param config The partial custom environment config.
 * @returns The configuration parameters for the Environment module.
 */
export function initialEnvironmentConfig(config?: Partial<EnvironmentConfig>): EnvironmentConfig {
  return {
    interpolation: config?.interpolation ?? ['{{', '}}'],
  };
}

import { EnvironmentConfig } from '../types';

/**
 * Returns the environment configuration with all default values for the Environment module.
 * @param config The partial environment config.
 * @returns The environment configuration with all default values.
 */
export function environmentConfigFactory(config?: Partial<EnvironmentConfig>): EnvironmentConfig {
  return {
    interpolation: config?.interpolation ?? ['{{', '}}'],
    useEnvironmentToTranspile: config?.useEnvironmentToTranspile ?? false,
  };
}

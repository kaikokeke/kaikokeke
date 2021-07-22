import { EnvironmentConfig } from '../types';

/**
 * Returns the environment configuration with all default values.
 * @param config The partial custom environment config.
 * @returns The partial configuration parameters for the Environment module.
 */
export function environmentConfigFactory(config?: Partial<EnvironmentConfig>): EnvironmentConfig {
  return {
    interpolation: config?.interpolation ?? ['{{', '}}'],
    loadInOrder: config?.loadInOrder ?? true,
    maxLoadTime: config?.maxLoadTime != null && config.maxLoadTime >= 0 ? config.maxLoadTime : undefined,
  };
}

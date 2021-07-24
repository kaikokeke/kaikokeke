import { Properties } from '../types';

/**
 * Manages the environment store.
 */
export abstract class EnvironmentStoreGateway {
  /**
   * Gets all properties from the environment store.
   * @returns The environment properties.
   */
  abstract getAll(): Properties;

  /**
   * Update the properties in the environment store.
   * @param properties The new properties set.
   */
  abstract update(properties: Properties): void;

  /**
   * Resets the environment store to the initial state.
   */
  abstract reset(): void;
}

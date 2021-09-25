import { Observable } from 'rxjs';

import { Properties } from '../types';

/**
 * Manages the environment store.
 */
export abstract class EnvironmentStore {
  /**
   * Gets all properties from the environment store.
   * @returns The environment properties as Observable that emits on every environment change.
   */
  abstract getAll$(): Observable<Properties>;

  /**
   * Gets all properties from the environment store.
   * @returns The environment properties.
   */
  abstract getAll(): Properties;

  /**
   * Updates the properties in the environment store.
   * @param properties The new properties set.
   */
  abstract update(properties: Properties): void;

  /**
   * Resets the environment store to the initial state.
   */
  abstract reset(): void;
}

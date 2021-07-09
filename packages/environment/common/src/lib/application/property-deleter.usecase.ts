import { Path } from '../types';

/**
 * Removes properties from the environment store.
 */
export interface PropertyDeleter {
  /**
   * Deletes a property from the environment store.
   * @param path The path of the property to delete.
   */
  delete(path: Path): void;
}

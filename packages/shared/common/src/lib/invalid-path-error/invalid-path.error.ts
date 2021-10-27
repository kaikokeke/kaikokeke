import { pathAsString } from '../path-as-string';
import { Path } from '../types';

/**
 * Throws an invalid path error.
 * @see Path
 */
export class InvalidPathError extends Error {
  /**
   * Creates an invalid path error.
   * @param path The invalid path.
   */
  constructor(path: Path) {
    super(`The path "${pathAsString(path)}" is invalid`);
    this.name = 'InvalidPathError';
  }
}

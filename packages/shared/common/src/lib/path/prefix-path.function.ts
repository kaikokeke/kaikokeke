import { Path } from '../types';
import { pathAsArray } from './path-as-array.function';
import { pathAsString } from './path-as-string.function';

/**
 * Adds a prefix to a path.
 * @param path The original path.
 * @param prefix The prefix to add.
 * @returns The prefixed path in the same format of the original path.
 */
export function prefixPath(path: Path, prefix: Path): Path {
  return Array.isArray(path) ? [...pathAsArray(prefix), ...path] : `${pathAsString(prefix)}.${path}`;
}

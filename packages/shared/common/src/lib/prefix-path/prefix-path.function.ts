import { pathAsArray } from '../path-as-array';
import { pathAsString } from '../path-as-string';
import { Path } from '../types';

/**
 * Adds a prefix to a path.
 * @param path The original path.
 * @param prefix The prefix to add.
 * @returns The prefixed path in the same format of the original path.
 */
export function prefixPath(path: Path, prefix: Path): Path {
  return Array.isArray(path) ? [...pathAsArray(prefix), ...path] : `${pathAsString(prefix)}.${path}`;
}

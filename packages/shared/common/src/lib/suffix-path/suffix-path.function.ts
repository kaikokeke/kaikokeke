import { pathAsArray } from '../path-as-array';
import { pathAsString } from '../path-as-string';
import { Path } from '../types';

/**
 * Adds a suffix to a path.
 * @param path The original path.
 * @param suffix The suffix to add.
 * @returns The suffixed path in the same format of the original path.
 */
export function suffixPath(path: Path, suffix: Path): Path {
  return Array.isArray(path) ? [...path, ...pathAsArray(suffix)] : `${path}.${pathAsString(suffix)}`;
}

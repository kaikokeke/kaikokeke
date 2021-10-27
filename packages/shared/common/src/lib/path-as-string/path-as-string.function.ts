import { Path } from '../types';

/**
 * Converts a Path to string format.
 * @param path The path to convert.
 * @returns The path as string.
 */
export function pathAsString(path: Path): string {
  return Array.isArray(path) ? path.join('.') : path;
}

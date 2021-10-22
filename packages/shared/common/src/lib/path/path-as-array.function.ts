import { Path } from './path.type';

/**
 * Converts a Path to Array format.
 * @param path The path to convert.
 * @returns The path as Array.
 */
export function pathAsArray(path: Path): Path {
  return Array.isArray(path) ? path : path.split('.');
}

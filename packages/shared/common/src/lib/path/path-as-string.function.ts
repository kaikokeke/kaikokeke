import { Path } from './path.type';

/**
 * Converts a Path to string format.
 * @param path The path to convert.
 * @returns The path as string.
 */
export function pathAsString(path: Path): Path {
  return Array.isArray(path) ? path.join('.') : path;
}

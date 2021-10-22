import { Path } from './path.type';

/**
 * Checks if the value is a valid path.
 * @param value The value to check.
 * @returns `true` if the value is a valid path, `false` otherwise.
 */
export function isPath(value: unknown): value is Path {
  return isValidStringPath(value) || isValidArrayPath(value);
}

function isValidStringPath(value: unknown): boolean {
  return typeof value == 'string' && value.trim().length > 0;
}

function isValidArrayPath(value: unknown): boolean {
  return Array.isArray(value) && value.length > 0 && value.every((_value: unknown) => isValidStringPath(_value));
}

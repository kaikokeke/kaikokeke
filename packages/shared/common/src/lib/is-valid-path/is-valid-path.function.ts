import { Path } from '../types';

/**
 * Checks if the value is a valid path.
 *
 * A valid path is a simple string key `'a'`, a complex string key `'a.a'`
 * or an array of simple keys to create a complex key `['a', 'a']`.
 * @param value The value to check.
 * @returns `true` if the value is a valid path, `false` otherwise.
 */
export function isValidPath(value: unknown): value is Path {
  return isValidComplexKey(value) || isValidArrayKey(value);
}

function isValidComplexKey(value: unknown): boolean {
  return isValidKey(value) && value.split('.').every((key: string) => isValidKey(key));
}

function isValidArrayKey(value: unknown): boolean {
  return (
    Array.isArray(value) && value.length > 0 && value.every((key: unknown) => isValidKey(key) && !key.includes('.'))
  );
}

function isValidKey(value: unknown): value is string {
  return typeof value == 'string' && value.length > 0;
}

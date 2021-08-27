/**
 * Represents the property path of an object.
 */
export type Path = string | string[];

/**
 * Checks if the value is a valid path.
 * @param value The value to check.
 * @returns `true` if the value is a valid path, `false` otherwise.
 */
export function isPath(value: unknown): value is Path {
  return (
    value != null &&
    (typeof value == 'string' || (Array.isArray(value) && value.every((v: unknown) => typeof v === 'string'))) &&
    value.length > 0
  );
}

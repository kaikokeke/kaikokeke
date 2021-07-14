/**
 * Represents the property path of an object.
 */
export type Path = string | string[];

/**
 * Checks if the value is a valid path.
 * @param value The value to check.
 * @returns `true` if the value is a valid path, `false` otherwise.
 */
export function isPath(value: any): value is Path {
  return (
    value != null &&
    (typeof value == 'string' || (Array.isArray(value) && value.every((v: any) => typeof v === 'string'))) &&
    value.length > 0
  );
}

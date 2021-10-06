/**
 * Executes an object method if it exists.
 * @param obj The source object.
 * @param method The method to execute.
 * @param args The arguments for the method to execute.
 * @returns The method's return value if exists, `undefined` otherwise.
 */
export function executeIfExists<T, R>(obj: T, method: string, ...args: unknown[]): R {
  if (typeof obj[method] === 'function') {
    return obj[method](...args);
  }
}

import { cloneDeep, isEqual } from 'lodash-es';

/**
 * Unfreezes the frozen or sealed object values.
 *
 * This method is loosely based on the structured clone algorithm and supports cloning arrays, array buffers, booleans,
 * date objects, maps, numbers, Object objects, regexes, sets, strings, symbols, and typed arrays.
 * The own enumerable properties of arguments objects are cloned as plain objects.
 * The object is returned as is for uncloneable values such as error objects, functions, DOM nodes, JSON object,
 * Atomics object, Math object, WeakSets, WeakMaps, BigInt64Array, BigUint64Array and SharedArrayBuffers.
 * @param value The value to unfreeze.
 * @returns An unfreezed copy of the value.
 */
export function unfreeze<T>(value: T): T {
  if (typeof value !== 'object') {
    return value;
  }

  const unfreezed = cloneDeep<T>(value);

  return isEqual(value, unfreezed) ? unfreezed : value;
}

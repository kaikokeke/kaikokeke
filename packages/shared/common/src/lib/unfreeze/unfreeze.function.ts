import { cloneDeep } from 'lodash-es';

/**
 * Unfreezes the frozen object value. Non-frozen objects are returned as is.
 *
 * This method is loosely based on the structured clone algorithm and supports cloning arrays, array buffers, booleans,
 * date objects, maps, numbers, Object objects, regexes, sets, strings, symbols, and typed arrays.
 * The own enumerable properties of arguments objects are cloned as plain objects.
 * An empty object is returned for uncloneable values such as error objects, functions, DOM nodes, JSON object,
 * Atomics object, Math object, WeakSets, WeakMaps and SharedArrayBuffers.
 * BigInt64Array and BigUint64Array are cloned as plain objects due to limitations of Lodash.
 * @param value The value to unfreeze.
 * @returns An unfreezed copy of the value.
 */
export function unfreeze<T>(value: T): T {
  return typeof value === 'object' && value !== null && Object.isFrozen(value) ? cloneDeep<T>(value) : value;
}

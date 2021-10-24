import { mergeWith } from 'lodash-es';

import { AtLeastOne } from '../types';

/**
 * Recursively merges own and inherited enumerable string keyed properties of source objects.
 *
 * Source properties that resolve to undefined are skipped if a destination value exists.
 * Other objects and value types are overridden by assignment.
 * Source objects are applied from left to right.
 * Iterable sources, except strings, are merged with previous sources.
 * @param sources The source objects.
 * @returns An object with merged own and inherited enumerable string keyed properties.
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export function deepMerge<T extends Record<string, unknown>>(...sources: AtLeastOne<object>): T {
  return mergeWith({}, ...sources, customizer);
}

function customizer(obj: unknown, source: unknown): unknown {
  if (Array.isArray(obj) && Array.isArray(source)) {
    return obj.concat(source);
  }

  if (obj instanceof Set && source instanceof Set) {
    return new Set([...obj, ...source]);
  }

  if (obj instanceof Map && source instanceof Map) {
    return new Map([...obj, ...source]);
  }

  if (obj instanceof Int8Array && source instanceof Int8Array) {
    return Int8Array.from([...obj, ...source]);
  }

  if (obj instanceof Int16Array && source instanceof Int16Array) {
    return Int16Array.from([...obj, ...source]);
  }

  if (obj instanceof Int32Array && source instanceof Int32Array) {
    return Int32Array.from([...obj, ...source]);
  }

  if (obj instanceof Uint8Array && source instanceof Uint8Array) {
    return Uint8Array.from([...obj, ...source]);
  }

  if (obj instanceof Uint8ClampedArray && source instanceof Uint8ClampedArray) {
    return Uint8ClampedArray.from([...obj, ...source]);
  }

  if (obj instanceof Uint16Array && source instanceof Uint16Array) {
    return Uint16Array.from([...obj, ...source]);
  }

  if (obj instanceof Uint32Array && source instanceof Uint32Array) {
    return Uint32Array.from([...obj, ...source]);
  }

  if (obj instanceof Float32Array && source instanceof Float32Array) {
    return Float32Array.from([...obj, ...source]);
  }

  if (obj instanceof Float64Array && source instanceof Float64Array) {
    return Float64Array.from([...obj, ...source]);
  }

  if (obj instanceof BigInt64Array && source instanceof BigInt64Array) {
    return BigInt64Array.from([...obj, ...source]);
  }

  if (obj instanceof BigUint64Array && source instanceof BigUint64Array) {
    return BigUint64Array.from([...obj, ...source]);
  }
}

import { mergeWith } from 'lodash-es';

/**
 * Recursively merges own and inherited enumerable string keyed properties of source objects.
 *
 * Source properties that resolve to undefined are skipped if a destination value exists.
 * Other objects and value types are overridden by assignment.
 * Source objects are applied from left to right.
 * Ierable sources, except strings, are merged with previous sources.
 * @param source1 The first required source objects.
 * @param source2 The second required source objects.
 * @param otherSources The optional source objects.
 * @returns An object with merged own and inherited enumerable string keyed properties.
 */
export function mergeDeep(
  source1: Record<string, unknown>,
  source2: Record<string, unknown>,
  ...otherSources: Record<string, unknown>[]
): Record<string, unknown> {
  return mergeWith({}, ...[source1, source2, ...otherSources], customizer);
}

function customizer(obj: any, source: any): any {
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

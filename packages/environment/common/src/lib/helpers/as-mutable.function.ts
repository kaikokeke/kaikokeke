import { cloneDeep } from 'lodash-es';
import { Writable } from 'ts-essentials';

/**
 * Converts the property to mutable if is an object.
 * @param property The property to convert
 * @returns The property as mutable.
 */
export function asMutable<T>(property: T): Writable<T> {
  return typeof property === 'object' && property != null ? cloneDeep(property) : property;
}

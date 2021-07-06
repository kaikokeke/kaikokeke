import { uniqWith } from 'lodash-es';

import { AnyMapValue } from './any-map-value.type';

/**
 * Returns a sorted and duplicate-free by key version of an AnyMapValue array.
 * @param anyMapValues The AnyMapValue array to sort.
 * @returns A sorted and duplicate-free by key version of an AnyMapValue array.
 */
export function sortAnyMapValue(anyMapValues: AnyMapValue[]): AnyMapValue[] {
  return uniqWith(
    [...anyMapValues].sort((a: AnyMapValue, b: AnyMapValue): number =>
      a.key.localeCompare(b.key, undefined, { sensitivity: 'base' })
    ),
    (a: AnyMapValue, b: AnyMapValue) => a.key === b.key
  );
}

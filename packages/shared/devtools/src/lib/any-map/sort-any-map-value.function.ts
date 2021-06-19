import { uniqWith } from 'lodash-es';

import { AnyMapValue } from './any-map-value.type';

/**
 * Returns a sorted and duplicate-free by key version of an AnyMapValue array.
 * @param anyMap The AnyMapValue array to sort.
 * @returns A sorted and duplicate-free by key version of an AnyMapValue array.
 */
export function sortAnyMapValue(anyMap: AnyMapValue[]): AnyMapValue[] {
  return uniqWith(
    [...anyMap].sort((a: AnyMapValue, b: AnyMapValue): number =>
      a[0].localeCompare(b[0], undefined, { sensitivity: 'base' })
    ),
    (a: AnyMapValue, b: AnyMapValue) => a[0] === b[0]
  );
}

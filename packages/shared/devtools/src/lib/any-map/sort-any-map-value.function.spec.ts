import { AnyMapValue } from './any-map-value.type';
import { sortAnyMapValue } from './sort-any-map-value.function';

const anyMap: AnyMapValue[] = [
  ['a', 'a', 'a'],
  ['c', 'c', 'c'],
  ['a', 'b', 'c'],
  ['a', 'a', 'a'],
  ['b', 'b', 'b'],
  ['c', 'c', 'c'],
];

const sorted: AnyMapValue[] = [
  ['a', 'a', 'a'],
  ['b', 'b', 'b'],
  ['c', 'c', 'c'],
];

describe('sortAnyMapValue(anyMap)', () => {
  it(`returns a sorted by key duplicate-free version of an AnyMapValue array.`, () => {
    expect(sortAnyMapValue(anyMap)).toEqual(sorted);
  });
});

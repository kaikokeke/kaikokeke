import { AnyMapValue } from './any-map-value.type';
import { sortAnyMapValue } from './sort-any-map-value.function';

const anyMapValues: AnyMapValue[] = [
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

describe('sortAnyMapValue(anyMapValues)', () => {
  it(`returns a sorted by key duplicate-free version of an AnyMapValue array.`, () => {
    expect(sortAnyMapValue(anyMapValues)).toEqual(sorted);
  });
});

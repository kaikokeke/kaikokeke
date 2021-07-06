import { AnyMapValue } from './any-map-value.type';
import { sortAnyMapValue } from './sort-any-map-value.function';

const anyMapValues: AnyMapValue[] = [
  { key: 'a', value: 'a', description: 'a' },
  { key: 'c', value: 'c', description: 'c' },
  { key: 'a', value: 'b', description: 'c' },
  { key: 'a', value: 'a', description: 'a' },
  { key: 'b', value: 'b', description: 'b' },
  { key: 'c', value: 'c', description: 'c' },
];

const sorted: AnyMapValue[] = [
  { key: 'a', value: 'a', description: 'a' },
  { key: 'b', value: 'b', description: 'b' },
  { key: 'c', value: 'c', description: 'c' },
];

describe('sortAnyMapValue(anyMapValues)', () => {
  it(`returns a sorted by key duplicate-free version of an AnyMapValue array.`, () => {
    expect(sortAnyMapValue(anyMapValues)).toEqual(sorted);
  });
});

import { AnyMapValue } from './any-map-value.type';
import { AnyMap } from './any-map.class';
import { ANY_MAP } from './any-map.constant';

/**
 * All ANY_MAP values except [false, true].
 */
const values: any[] = ANY_MAP.filter((value: AnyMapValue) => value[1] !== true && value[1] !== false).map(
  (value: AnyMapValue) => value[1]
);

describe('AnyMap', () => {
  let anyMap: AnyMap;

  beforeEach(() => {
    anyMap = new AnyMap();
  });

  it(`constructor() uses the original ANY_MAP`, () => {
    expect(anyMap.entries()).toEqual(ANY_MAP);
  });

  it(`constructor(extraValues) adds keys to existing ANY_MAP entries`, () => {
    anyMap = new AnyMap([['_string_empty_', '']]);
    expect(anyMap.includes('empty').keys()).toEqual(['_primitive_string_falsy_iterable_empty_']);
  });

  it(`constructor(extraValues) adds new entries to non existing ANY_MAP entries`, () => {
    anyMap = new AnyMap([['_string_empty_', 'ccc']]);
    expect(anyMap.includes('empty').entries()).toEqual([['_string_empty_', 'ccc']]);
  });

  it(`constructor(extraValues) works with repeated values, like "0" or "-0"`, () => {
    const zeroKeys = ANY_MAP.filter((value) => value[1] === 0).map((value) => `${value[0]}zero_`);
    anyMap = new AnyMap([['_zero_', 0]]);
    expect(anyMap.includes('zero').keys()).toEqual(zeroKeys);
  });

  it(`values() returns the ANY_MAP values`, () => {
    expect(anyMap.includes('null').values()).toEqual([null]);
  });

  it(`keys() returns the ANY_MAP keys`, () => {
    expect(anyMap.includes('null').keys()).toEqual(['_primitive_object_null_falsy_nullish_']);
  });

  it(`entries() returns the ANY_MAP entries`, () => {
    expect(anyMap.includes('null').entries()).toEqual([['_primitive_object_null_falsy_nullish_', null]]);
  });

  it(`includes(string) returns an AnyMap instance with all entries that match the full string`, () => {
    expect(anyMap.includes('boolean').values()).toEqual([false, true]);
    expect(anyMap.includes('bool').values()).toEqual([]);
  });

  it(`includes(RegExp) returns an AnyMap instance with all entries that match the regular expression`, () => {
    expect(anyMap.includes(RegExp('bool')).values()).toEqual([false, true]);
  });

  it(`includes((string) => boolean) returns an AnyMap instance with all entries that match the callback`, () => {
    expect(anyMap.includes((value) => value.includes('_boolean_')).values()).toEqual([false, true]);
  });

  it(`includes(filter[]) returns an AnyMap instance with all entries that match any of the the filters as OR, without duplicates`, () => {
    expect(anyMap.includes(['boolean', 'null']).values()).toEqual([false, true, null]);
  });

  it(`includes(filter).includes(filter) returns an AnyMap instance with all entries that match all the the filters as AND`, () => {
    expect(anyMap.includes('boolean').includes('falsy').values()).toEqual([false]);
  });

  it(`excludes(string) returns an AnyMap instance without all entries that match the full string`, () => {
    expect(anyMap.excludes('boolean').values()).toEqual(values);
  });

  it(`excludes(RegExp) returns an AnyMap instance without all entries that match the regular expression`, () => {
    expect(anyMap.excludes(RegExp('bool')).values()).toEqual(values);
  });

  it(`excludes((string) => boolean) returns an AnyMap instance without all entries that match the callback`, () => {
    expect(anyMap.excludes((value) => value.includes('_boolean_')).values()).toEqual(values);
  });

  it(`excludes(filter[]) returns an AnyMap instance without all entries that match all filters as AND`, () => {
    const valuesWithTrue: any = [true, ...values];
    expect(anyMap.excludes(['boolean', 'falsy']).values()).toEqual(valuesWithTrue);
  });

  it(`excludes(filter).excludes(filter) returns an AnyMap instance without all entries that match any of the the filters as OR`, () => {
    const valuesWithoutNull: any = values.filter((value: AnyMapValue) => value !== null);
    expect(anyMap.excludes('boolean').excludes('null').values()).toEqual(valuesWithoutNull);
  });
});

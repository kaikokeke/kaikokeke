import { AnyMap } from './any-map';

describe('AnyMap', () => {
  let test: AnyMap;

  beforeEach(() => {
    test = new AnyMap();
  });

  it(`includes(string) returns AnyMap with the full match entries`, () => {
    expect(test.includes('boolean').includes('falsy').values()).toEqual([false]);
    expect(test.includes('bool').values()).toEqual([]);
  });

  it(`includes(RegExp) returns AnyMap with the RegExp match entries`, () => {
    expect(test.includes(RegExp('bool')).includes(RegExp('pri')).values()).toEqual([false, true]);
  });

  it(`includes((string) => boolean) returns AnyMap with the function match entries`, () => {
    expect(
      test
        .includes((value) => value.includes('boolean'))
        .includes((value) => value.includes('falsy'))
        .values()
    ).toEqual([false]);
  });

  it(`includes(match[]) returns AnyMap with the full match entries as OR, without duplicates`, () => {
    expect(
      test
        .includes(['boolean', RegExp('falsy')])
        .excludes('number')
        .excludes('object')
        .values()
    ).toEqual([false, true, '', undefined]);
  });

  it(`excludes(string) returns AnyMap without the full match entries`, () => {
    expect(test.includes('boolean').excludes('object').values()).toEqual([false, true]);
  });

  it(`excludes(RegExp) returns AnyMap without the RegExp match entries`, () => {
    expect(test.includes(RegExp('bool')).excludes(RegExp('obj')).values()).toEqual([false, true]);
  });

  it(`excludes((string) => boolean) returns AnyMap without the function match entries`, () => {
    expect(
      test
        .includes((value) => value.includes('boolean'))
        .excludes((value) => value.includes('object'))
        .values()
    ).toEqual([false, true]);
  });

  it(`excludes(match[]) returns AnyMap with the full match entries as AND`, () => {
    expect(
      test
        .includes('boolean')
        .excludes(['boolean', RegExp('falsy')])
        .values()
    ).toEqual([true, new Boolean(false), new Boolean(true)]);
  });

  it(`values() returns AnyMap values`, () => {
    expect(test.includes('boolean').includes('falsy').values()).toEqual([false]);
  });

  it(`keys() returns AnyMap keys`, () => {
    expect(test.includes('boolean').includes('falsy').keys()).toEqual(['_primitive_boolean_falsy_']);
  });

  it(`entries() returns AnyMap entries`, () => {
    expect(test.includes('boolean').includes('falsy').entries()).toEqual([['_primitive_boolean_falsy_', false]]);
  });

  it(`any falsy values is falsy`, () => {
    test
      .includes('falsy')
      .values()
      .forEach((value: any) => {
        expect(value).toBeFalsy();
      });
    test
      .excludes('falsy')
      .values()
      .forEach((value: any) => {
        expect(value).toBeTruthy();
      });
  });
});

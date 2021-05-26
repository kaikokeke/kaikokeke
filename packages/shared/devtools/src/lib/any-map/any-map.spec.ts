import { AnyMap } from './any-map';

describe('AnyMap', () => {
  let test: AnyMap;

  beforeEach(() => {
    test = new AnyMap();
  });

  it(`includes(string) returns an AnyMap instance with all entries that match the full string`, () => {
    expect(test.includes('boolean').includes('falsy').values()).toEqual([false]);
    expect(test.includes('bool').values()).toEqual([]);
  });

  it(`includes(RegExp) returns an AnyMap instance with all entries that match the regular expression`, () => {
    expect(test.includes(RegExp('bool')).includes(RegExp('pri')).values()).toEqual([false, true]);
  });

  it(`includes((string) => boolean) returns an AnyMap instance with all entries that match the callback`, () => {
    expect(
      test
        .includes((value) => value.includes('boolean'))
        .includes((value) => value.includes('falsy'))
        .values()
    ).toEqual([false]);
  });

  it(`includes(match[]) returns an AnyMap instance with all entries that match any of the the filters as OR, without duplicates`, () => {
    expect(
      test
        .includes(['boolean', RegExp('falsy')])
        .excludes('number')
        .excludes('object')
        .values()
    ).toEqual([false, true, '', BigInt(0), BigInt(-0), undefined]);
  });

  it(`excludes(string) returns an AnyMap instance without all entries that match the full string`, () => {
    expect(test.includes('boolean').excludes('object').values()).toEqual([false, true]);
  });

  it(`excludes(RegExp) returns an AnyMap instance without all entries that match the regular expression`, () => {
    expect(test.includes(RegExp('bool')).excludes(RegExp('obj')).values()).toEqual([false, true]);
  });

  it(`excludes((string) => boolean) returns an AnyMap instance without all entries that match the callback`, () => {
    expect(
      test
        .includes((value) => value.includes('boolean'))
        .excludes((value) => value.includes('object'))
        .values()
    ).toEqual([false, true]);
  });

  it(`excludes(match[]) returns an AnyMap instance with all entries that match all filters as AND`, () => {
    expect(
      test
        .includes('boolean')
        .excludes(['boolean', RegExp('falsy')])
        .values()
    ).toEqual([true]);
  });

  it(`values() returns the AnyMap values`, () => {
    expect(test.includes('boolean').includes('falsy').values()).toEqual([false]);
  });

  it(`keys() returns the AnyMap keys`, () => {
    expect(test.includes('boolean').includes('falsy').keys()).toEqual(['_primitive_boolean_falsy_']);
  });

  it(`entries() returns the AnyMap entries`, () => {
    expect(test.includes('boolean').includes('falsy').entries()).toEqual([['_primitive_boolean_falsy_', false]]);
  });

  it(`all falsy values are falsy`, () => {
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

  it(`all primitive values are not objects`, () => {
    test
      .includes('primitive')
      .excludes('null')
      .values()
      .forEach((value: any) => {
        expect(typeof value).not.toEqual('object');
      });
  });

  it(`all object values are objects`, () => {
    test
      .includes('object')
      .values()
      .forEach((value: any) => {
        expect(typeof value).toEqual('object');
      });
  });

  it(`all object values are objects`, () => {
    expect(test.includes(['boolean', 'null']).values()).toEqual([false, true, null]);
  });
});

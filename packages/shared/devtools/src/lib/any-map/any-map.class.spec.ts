import { isElement, isPlainObject, isTypedArray } from 'lodash-es';

import { AnyMapValue } from './any-map-value.type';
import { AnyMap } from './any-map.class';
import { ANY_MAP } from './any-map.constant';

/**
 * All ANY_MAP values except [false, true].
 */
const valuesWithoutBoolean: any[] = ANY_MAP.filter(
  (value: AnyMapValue) => value.value !== true && value.value !== false,
).map((value: AnyMapValue) => value.value);

describe('AnyMap', () => {
  let anyMap: AnyMap;

  beforeEach(() => {
    anyMap = new AnyMap();
  });

  it(`constructor() uses the original ANY_MAP`, () => {
    expect(anyMap.entries()).toEqual(ANY_MAP);
  });

  it(`constructor(extraValues) adds keys to existing ANY_MAP entries`, () => {
    anyMap = new AnyMap([{ key: '_string_empty_', value: '', description: 'string empty' }]);
    expect(anyMap.includes('empty').keys()).toEqual(['_primitive_string_falsy_iterable_empty_']);
  });

  it(`constructor(extraValues) adds new entries to non existing ANY_MAP entries`, () => {
    const value: any = [{ key: '_string_empty_', value: 'ccc', description: 'string empty' }];
    anyMap = new AnyMap(value);
    expect(anyMap.includes('empty').entries()).toEqual(value);
  });

  it(`constructor(extraValues) works with repeated values, like "0" or "-0"`, () => {
    const zeroKeys = ANY_MAP.filter((value) => value.value === 0).map((value) => `${value.key}zero_`);
    anyMap = new AnyMap([{ key: '_zero_', value: 0, description: 'zero' }]);
    expect(anyMap.includes('zero').keys()).toEqual(zeroKeys);
  });

  it(`keys() returns the ANY_MAP keys`, () => {
    expect(anyMap.includes('null').keys()).toEqual(['_primitive_object_null_falsy_nullish_']);
  });

  it(`values() returns the ANY_MAP values`, () => {
    expect(anyMap.includes('null').values()).toEqual([null]);
  });

  it(`descriptions() returns the ANY_MAP descriptions`, () => {
    expect(anyMap.includes('null').descriptions()).toEqual(['null']);
  });

  it(`entries() returns the ANY_MAP entries`, () => {
    expect(anyMap.includes('null').entries()).toEqual([
      { key: '_primitive_object_null_falsy_nullish_', value: null, description: 'null' },
    ]);
  });

  it(`includes(string) returns an AnyMap instance with all entries that match the full string`, () => {
    expect(anyMap.includes('boolean').values()).toEqual([true, false]);
    expect(anyMap.includes('bool').values()).toEqual([]);
  });

  it(`includes(RegExp) returns an AnyMap instance with all entries that match the regular expression`, () => {
    expect(anyMap.includes(RegExp('bool')).values()).toEqual([true, false]);
  });

  it(`includes((string) => boolean) returns an AnyMap instance with all entries that match the callback`, () => {
    expect(anyMap.includes((value) => value.includes('_boolean_')).values()).toEqual([true, false]);
  });

  it(`includes(filter[]) returns an AnyMap instance with all entries that match any of the the filters as OR, without duplicates`, () => {
    expect(anyMap.includes(['boolean', 'null']).values()).toEqual([true, false, null]);
  });

  it(`includes(filter).includes(filter) returns an AnyMap instance with all entries that match all the the filters as AND`, () => {
    expect(anyMap.includes('boolean').includes('falsy').values()).toEqual([false]);
  });

  it(`excludes(string) returns an AnyMap instance without all entries that match the full string`, () => {
    expect(anyMap.excludes('boolean').values()).toEqual(valuesWithoutBoolean);
  });

  it(`excludes(RegExp) returns an AnyMap instance without all entries that match the regular expression`, () => {
    expect(anyMap.excludes(RegExp('bool')).values()).toEqual(valuesWithoutBoolean);
  });

  it(`excludes((string) => boolean) returns an AnyMap instance without all entries that match the callback`, () => {
    expect(anyMap.excludes((value) => value.includes('_boolean_')).values()).toEqual(valuesWithoutBoolean);
  });

  it(`excludes(filter[]) returns an AnyMap instance without all entries that match all filters as AND`, () => {
    const valuesWithoutFalse = ANY_MAP.filter((value) => value.value !== false).map((value) => value.value);
    expect(anyMap.excludes(['boolean', 'falsy']).values()).toEqual(valuesWithoutFalse);
  });

  it(`excludes(filter).excludes(filter) returns an AnyMap instance without all entries that match any of the the filters as OR`, () => {
    const valuesWithoutNull = valuesWithoutBoolean.filter((value) => value !== null);
    expect(anyMap.excludes('boolean').excludes('null').values()).toEqual(valuesWithoutNull);
  });

  it(`join(anyMap) returns the entries of this object joined with the entries in the provided AnyMap object`, () => {
    const anyMap2 = new AnyMap().includes('null');
    expect(anyMap.includes('boolean').join(anyMap2).values()).toEqual([true, false, null]);
  });

  it(`join(anyMap) returns the entries without duplicated keys`, () => {
    const anyMap2 = new AnyMap().includes(['null', 'boolean']);
    expect(anyMap.includes(['boolean', 'undefined']).join(anyMap2).values()).toEqual([true, false, null, undefined]);
  });

  it(`not(anyMap) returns the entries of 'any' that are not in the provided AnyMap object`, () => {
    const anyMap2 = new AnyMap().includes(['boolean', 'null']);
    const valuesWithoutNull = valuesWithoutBoolean.filter((value) => value !== null);
    expect(anyMap.not(anyMap2).values()).toEqual(valuesWithoutNull);
  });

  describe('check keywords', () => {
    function isAnonymousFunction(value: any): any {
      return typeof value === 'function' && (value.name === '' || value.name === 'value');
    }

    it(`anonymousFunction`, () => {
      anyMap
        .includes('anonymousFunction')
        .values()
        .forEach((value) => {
          expect(isAnonymousFunction(value)).toBeTrue();
        });
    });

    it(`no anonymousFunction`, () => {
      anyMap
        .excludes('anonymousFunction')
        .values()
        .forEach((value) => {
          expect(isAnonymousFunction(value)).toBeFalse();
        });
    });

    it(`Array`, () => {
      anyMap
        .includes('Array')
        .values()
        .forEach((value) => {
          expect(Array.isArray(value)).toBeTrue();
        });
    });

    it(`no Array`, () => {
      anyMap
        .excludes('Array')
        .values()
        .forEach((value) => {
          expect(Array.isArray(value)).toBeFalse();
        });
    });

    it(`ArrayBuffer`, () => {
      anyMap
        .includes('ArrayBuffer')
        .values()
        .forEach((value) => {
          expect(value instanceof ArrayBuffer).toBeTrue();
        });
    });

    it(`no ArrayBuffer`, () => {
      anyMap
        .excludes('ArrayBuffer')
        .values()
        .forEach((value) => {
          expect(value instanceof ArrayBuffer).toBeFalse();
        });
    });

    it(`Atomics`, () => {
      anyMap
        .includes('Atomics')
        .values()
        .forEach((value) => {
          expect(value?.compareExchange).toBeDefined();
        });
    });

    it(`no Atomics`, () => {
      anyMap
        .excludes('Atomics')
        .values()
        .forEach((value) => {
          expect(value?.compareExchange).toBeUndefined();
        });
    });

    it(`bigint`, () => {
      anyMap
        .includes('bigint')
        .values()
        .forEach((value) => {
          expect(typeof value === 'bigint').toBeTrue();
        });
    });

    it(`no bigint`, () => {
      anyMap
        .excludes('bigint')
        .values()
        .forEach((value) => {
          expect(typeof value === 'bigint').toBeFalse();
        });
    });

    it(`BigInt64Array`, () => {
      anyMap
        .includes('BigInt64Array')
        .values()
        .forEach((value) => {
          expect(value instanceof BigInt64Array).toBeTrue();
        });
    });

    it(`no BigInt64Array`, () => {
      anyMap
        .excludes('BigInt64Array')
        .values()
        .forEach((value) => {
          expect(value instanceof BigInt64Array).toBeFalse();
        });
    });

    it(`BigUint64Array`, () => {
      anyMap
        .includes('BigUint64Array')
        .values()
        .forEach((value) => {
          expect(value instanceof BigUint64Array).toBeTrue();
        });
    });

    it(`no BigUint64Array`, () => {
      anyMap
        .excludes('BigUint64Array')
        .values()
        .forEach((value) => {
          expect(value instanceof BigUint64Array).toBeFalse();
        });
    });

    // binary

    it(`boolean`, () => {
      anyMap
        .includes('boolean')
        .values()
        .forEach((value) => {
          expect(typeof value === 'boolean').toBeTrue();
        });
    });

    it(`no boolean`, () => {
      anyMap
        .excludes('boolean')
        .values()
        .forEach((value) => {
          expect(typeof value === 'boolean').toBeFalse();
        });
    });

    it(`Boolean`, () => {
      anyMap
        .includes('Boolean')
        .values()
        .forEach((value) => {
          expect(value instanceof Boolean).toBeTrue();
        });
    });

    it(`no Boolean`, () => {
      anyMap
        .excludes('Boolean')
        .values()
        .forEach((value) => {
          expect(value instanceof Boolean).toBeFalse();
        });
    });

    it(`DataView`, () => {
      anyMap
        .includes('DataView')
        .values()
        .forEach((value) => {
          expect(value instanceof DataView).toBeTrue();
        });
    });

    it(`no DataView`, () => {
      anyMap
        .excludes('DataView')
        .values()
        .forEach((value) => {
          expect(value instanceof DataView).toBeFalse();
        });
    });

    it(`Date`, () => {
      anyMap
        .includes('Date')
        .values()
        .forEach((value) => {
          expect(value instanceof Date).toBeTrue();
        });
    });

    it(`no Date`, () => {
      anyMap
        .excludes('Date')
        .values()
        .forEach((value) => {
          expect(value instanceof Date).toBeFalse();
        });
    });

    // decimal

    it(`Element`, () => {
      anyMap
        .includes('Element')
        .values()
        .forEach((value) => {
          expect(isElement(value)).toBeTrue();
        });
    });

    it(`no Element`, () => {
      anyMap
        .excludes('Element')
        .values()
        .forEach((value) => {
          expect(isElement(value)).toBeFalse();
        });
    });

    it(`Error`, () => {
      anyMap
        .includes('Error')
        .values()
        .forEach((value) => {
          expect(value instanceof Error).toBeTrue();
        });
    });

    it(`no Error`, () => {
      anyMap
        .excludes('Error')
        .values()
        .forEach((value) => {
          expect(value instanceof Error).toBeFalse();
        });
    });

    it(`EvalError`, () => {
      anyMap
        .includes('EvalError')
        .values()
        .forEach((value) => {
          expect(value instanceof EvalError).toBeTrue();
        });
    });

    it(`no EvalError`, () => {
      anyMap
        .excludes('EvalError')
        .values()
        .forEach((value) => {
          expect(value instanceof EvalError).toBeFalse();
        });
    });

    // exponent

    it(`falsy`, () => {
      anyMap
        .includes('falsy')
        .values()
        .forEach((value) => {
          expect(Boolean(value)).toBeFalse();
        });
    });

    it(`no falsy`, () => {
      anyMap
        .excludes('falsy')
        .values()
        .forEach((value) => {
          expect(Boolean(value)).toBeTrue();
        });
    });

    it(`Float32Array`, () => {
      anyMap
        .includes('Float32Array')
        .values()
        .forEach((value) => {
          expect(value instanceof Float32Array).toBeTrue();
        });
    });

    it(`no Float32Array`, () => {
      anyMap
        .excludes('Float32Array')
        .values()
        .forEach((value) => {
          expect(value instanceof Float32Array).toBeFalse();
        });
    });

    it(`Float64Array`, () => {
      anyMap
        .includes('Float64Array')
        .values()
        .forEach((value) => {
          expect(value instanceof Float64Array).toBeTrue();
        });
    });

    it(`no Float64Array`, () => {
      anyMap
        .excludes('Float64Array')
        .values()
        .forEach((value) => {
          expect(value instanceof Float64Array).toBeFalse();
        });
    });

    it(`function`, () => {
      anyMap
        .includes('function')
        .values()
        .forEach((value) => {
          expect(typeof value === 'function').toBeTrue();
        });
    });

    it(`no function`, () => {
      anyMap
        .excludes('function')
        .values()
        .forEach((value) => {
          expect(typeof value === 'function').toBeFalse();
        });
    });

    // hexadecimal

    function isInfinity(value: any): boolean {
      if (typeof value !== 'number' || Number.isNaN(value)) {
        return false;
      }
      return !Number.isFinite(value);
    }

    it(`infinity`, () => {
      anyMap
        .includes('infinity')
        .values()
        .forEach((value) => {
          expect(isInfinity(value)).toBeTrue();
        });
    });

    it(`no infinity`, () => {
      anyMap
        .excludes('infinity')
        .values()
        .forEach((value) => {
          expect(isInfinity(value)).toBeFalse();
        });
    });

    it(`Int16Array`, () => {
      anyMap
        .includes('Int16Array')
        .values()
        .forEach((value) => {
          expect(value instanceof Int16Array).toBeTrue();
        });
    });

    it(`no Int16Array`, () => {
      anyMap
        .excludes('Int16Array')
        .values()
        .forEach((value) => {
          expect(value instanceof Int16Array).toBeFalse();
        });
    });

    it(`Int32Array`, () => {
      anyMap
        .includes('Int32Array')
        .values()
        .forEach((value) => {
          expect(value instanceof Int32Array).toBeTrue();
        });
    });

    it(`no Int32Array`, () => {
      anyMap
        .excludes('Int32Array')
        .values()
        .forEach((value) => {
          expect(value instanceof Int32Array).toBeFalse();
        });
    });

    it(`Int8Array`, () => {
      anyMap
        .includes('Int8Array')
        .values()
        .forEach((value) => {
          expect(value instanceof Int8Array).toBeTrue();
        });
    });

    it(`no Int8Array`, () => {
      anyMap
        .excludes('Int8Array')
        .values()
        .forEach((value) => {
          expect(value instanceof Int8Array).toBeFalse();
        });
    });

    // integer

    function isIterable(value: any): boolean {
      return value != null && typeof value[Symbol.iterator] === 'function';
    }

    it(`iterable`, () => {
      anyMap
        .includes('iterable')
        .values()
        .forEach((value) => {
          expect(isIterable(value)).toBeTrue();
        });
    });

    it(`no iterable`, () => {
      anyMap
        .excludes('iterable')
        .values()
        .forEach((value) => {
          expect(isIterable(value)).toBeFalse();
        });
    });

    it(`JSON`, () => {
      anyMap
        .includes('JSON')
        .values()
        .forEach((value) => {
          expect(value?.stringify).toBeDefined();
        });
    });

    it(`no JSON`, () => {
      anyMap
        .excludes('JSON')
        .values()
        .forEach((value) => {
          expect(value?.stringify).toBeUndefined();
        });
    });

    it(`Map`, () => {
      anyMap
        .includes('Map')
        .values()
        .forEach((value) => {
          expect(value instanceof Map).toBeTrue();
        });
    });

    it(`no Map`, () => {
      anyMap
        .excludes('Map')
        .values()
        .forEach((value) => {
          expect(value instanceof Map).toBeFalse();
        });
    });

    it(`Math`, () => {
      anyMap
        .includes('Math')
        .values()
        .forEach((value) => {
          expect(value?.PI).toBeDefined();
        });
    });

    it(`no Math`, () => {
      anyMap
        .excludes('Math')
        .values()
        .forEach((value) => {
          expect(value?.PI).toBeUndefined();
        });
    });

    function isNamedFunction(value: any): any {
      return typeof value === 'function' && value.name !== '' && value.name !== 'value';
    }

    it(`namedFunction`, () => {
      anyMap
        .includes('namedFunction')
        .values()
        .forEach((value) => {
          expect(isNamedFunction(value)).toBeTrue();
        });
    });

    it(`no namedFunction`, () => {
      anyMap
        .excludes('namedFunction')
        .values()
        .forEach((value) => {
          expect(isNamedFunction(value)).toBeFalse();
        });
    });

    function isNamedObject(value: any): boolean {
      return value != null && typeof value === 'object' && !isPlainObject(value);
    }

    it(`namedObject`, () => {
      anyMap
        .includes('namedObject')
        .values()
        .forEach((value) => {
          expect(isNamedObject(value)).toBeTrue();
        });
    });

    it(`no namedObject`, () => {
      anyMap
        .excludes('namedObject')
        .values()
        .forEach((value) => {
          expect(isNamedObject(value)).toBeFalse();
        });
    });

    it(`NaN`, () => {
      anyMap
        .includes('NaN')
        .values()
        .forEach((value) => {
          expect(Number.isNaN(value)).toBeTrue();
        });
    });

    it(`no NaN`, () => {
      anyMap
        .excludes('NaN')
        .values()
        .forEach((value) => {
          expect(Number.isNaN(value)).toBeFalse();
        });
    });

    function isNegative(value: any): boolean {
      if (typeof value !== 'number' && typeof value !== 'bigint') {
        return false;
      }
      return value === Number.MIN_VALUE || value < 0;
    }

    it(`negative`, () => {
      anyMap
        .includes('negative')
        .values()
        .forEach((value) => {
          expect(isNegative(value)).toBeTrue();
        });
    });

    it(`no negative`, () => {
      anyMap
        .excludes('negative')
        .values()
        .forEach((value) => {
          expect(isNegative(value)).toBeFalse();
        });
    });

    it(`null`, () => {
      anyMap
        .includes('null')
        .values()
        .forEach((value) => {
          expect(value === null).toBeTrue();
        });
    });

    it(`no null`, () => {
      anyMap
        .excludes('null')
        .values()
        .forEach((value) => {
          expect(value === null).toBeFalse();
        });
    });

    it(`nullish`, () => {
      anyMap
        .includes('nullish')
        .values()
        .forEach((value) => {
          expect(value ?? 'nullishValue').toEqual('nullishValue');
        });
    });

    it(`no nullish`, () => {
      anyMap
        .excludes('nullish')
        .values()
        .forEach((value) => {
          expect(value ?? 'nullishValue').toEqual(value);
        });
    });

    it(`number`, () => {
      anyMap
        .includes('number')
        .values()
        .forEach((value) => {
          expect(typeof value === 'number').toBeTrue();
        });
    });

    it(`no number`, () => {
      anyMap
        .excludes('number')
        .values()
        .forEach((value) => {
          expect(typeof value === 'number').toBeFalse();
        });
    });

    it(`Number`, () => {
      anyMap
        .includes('Number')
        .values()
        .forEach((value) => {
          expect(value instanceof Number).toBeTrue();
        });
    });

    it(`no Number`, () => {
      anyMap
        .excludes('Number')
        .values()
        .forEach((value) => {
          expect(value instanceof Number).toBeFalse();
        });
    });

    it(`object`, () => {
      anyMap
        .includes('object')
        .values()
        .forEach((value) => {
          expect(typeof value === 'object').toBeTrue();
        });
    });

    it(`no object`, () => {
      anyMap
        .excludes('object')
        .values()
        .forEach((value) => {
          expect(typeof value === 'object').toBeFalse();
        });
    });

    // octal

    it(`plainObject`, () => {
      anyMap
        .includes('plainObject')
        .values()
        .forEach((value) => {
          expect(isPlainObject(value)).toBeTrue();
        });
    });

    it(`no plainObject`, () => {
      anyMap
        .excludes('plainObject')
        .values()
        .forEach((value) => {
          expect(isPlainObject(value)).toBeFalse();
        });
    });

    function isPrimitive(value: any): boolean {
      return value == null || (typeof value !== 'function' && typeof value !== 'object');
    }

    it(`primitive`, () => {
      anyMap
        .includes('primitive')
        .values()
        .forEach((value) => {
          expect(isPrimitive(value)).toBeTrue();
        });
    });

    it(`no primitive`, () => {
      anyMap
        .excludes('primitive')
        .excludes('null')
        .values()
        .forEach((value) => {
          expect(isPrimitive(value)).toBeFalse();
        });
    });

    it(`RangeError`, () => {
      anyMap
        .includes('RangeError')
        .values()
        .forEach((value) => {
          expect(value instanceof RangeError).toBeTrue();
        });
    });

    it(`no RangeError`, () => {
      anyMap
        .excludes('RangeError')
        .values()
        .forEach((value) => {
          expect(value instanceof RangeError).toBeFalse();
        });
    });

    it(`ReferenceError`, () => {
      anyMap
        .includes('ReferenceError')
        .values()
        .forEach((value) => {
          expect(value instanceof ReferenceError).toBeTrue();
        });
    });

    it(`no ReferenceError`, () => {
      anyMap
        .excludes('ReferenceError')
        .values()
        .forEach((value) => {
          expect(value instanceof ReferenceError).toBeFalse();
        });
    });

    it(`RegExp`, () => {
      anyMap
        .includes('RegExp')
        .values()
        .forEach((value) => {
          expect(value instanceof RegExp).toBeTrue();
        });
    });

    it(`no RegExp`, () => {
      anyMap
        .excludes('RegExp')
        .values()
        .forEach((value) => {
          expect(value instanceof RegExp).toBeFalse();
        });
    });

    it(`Set`, () => {
      anyMap
        .includes('Set')
        .values()
        .forEach((value) => {
          expect(value instanceof Set).toBeTrue();
        });
    });

    it(`no Set`, () => {
      anyMap
        .excludes('Set')
        .values()
        .forEach((value) => {
          expect(value instanceof Set).toBeFalse();
        });
    });

    it(`SharedArrayBuffer`, () => {
      anyMap
        .includes('SharedArrayBuffer')
        .values()
        .forEach((value) => {
          expect(value instanceof SharedArrayBuffer).toBeTrue();
        });
    });

    it(`no SharedArrayBuffer`, () => {
      anyMap
        .excludes('SharedArrayBuffer')
        .values()
        .forEach((value) => {
          expect(value instanceof SharedArrayBuffer).toBeFalse();
        });
    });

    it(`string`, () => {
      anyMap
        .includes('string')
        .values()
        .forEach((value) => {
          expect(typeof value === 'string').toBeTrue();
        });
    });

    it(`no string`, () => {
      anyMap
        .excludes('string')
        .values()
        .forEach((value) => {
          expect(typeof value === 'string').toBeFalse();
        });
    });

    it(`String`, () => {
      anyMap
        .includes('String')
        .values()
        .forEach((value) => {
          expect(value instanceof String).toBeTrue();
        });
    });

    it(`no String`, () => {
      anyMap
        .excludes('String')
        .values()
        .forEach((value) => {
          expect(value instanceof String).toBeFalse();
        });
    });

    it(`symbol`, () => {
      anyMap
        .includes('symbol')
        .values()
        .forEach((value) => {
          expect(typeof value === 'symbol').toBeTrue();
        });
    });

    it(`no symbol`, () => {
      anyMap
        .excludes('symbol')
        .values()
        .forEach((value) => {
          expect(typeof value === 'symbol').toBeFalse();
        });
    });

    it(`SyntaxError`, () => {
      anyMap
        .includes('SyntaxError')
        .values()
        .forEach((value) => {
          expect(value instanceof SyntaxError).toBeTrue();
        });
    });

    it(`no SyntaxError`, () => {
      anyMap
        .excludes('SyntaxError')
        .values()
        .forEach((value) => {
          expect(value instanceof SyntaxError).toBeFalse();
        });
    });

    it(`TypedArray`, () => {
      anyMap
        .includes('TypedArray')
        .values()
        .forEach((value) => {
          expect(isTypedArray(value)).toBeTrue();
        });
    });

    it(`no TypedArray`, () => {
      anyMap
        .excludes('TypedArray')
        .values()
        .forEach((value) => {
          expect(isTypedArray(value)).toBeFalse();
        });
    });

    it(`TypeError`, () => {
      anyMap
        .includes('TypeError')
        .values()
        .forEach((value) => {
          expect(value instanceof TypeError).toBeTrue();
        });
    });

    it(`no TypeError`, () => {
      anyMap
        .excludes('TypeError')
        .values()
        .forEach((value) => {
          expect(value instanceof TypeError).toBeFalse();
        });
    });

    it(`Uint16Array`, () => {
      anyMap
        .includes('Uint16Array')
        .values()
        .forEach((value) => {
          expect(value instanceof Uint16Array).toBeTrue();
        });
    });

    it(`no Uint16Array`, () => {
      anyMap
        .excludes('Uint16Array')
        .values()
        .forEach((value) => {
          expect(value instanceof Uint16Array).toBeFalse();
        });
    });

    it(`Uint32Array`, () => {
      anyMap
        .includes('Uint32Array')
        .values()
        .forEach((value) => {
          expect(value instanceof Uint32Array).toBeTrue();
        });
    });

    it(`no Uint32Array`, () => {
      anyMap
        .excludes('Uint32Array')
        .values()
        .forEach((value) => {
          expect(value instanceof Uint32Array).toBeFalse();
        });
    });

    it(`Uint8Array`, () => {
      anyMap
        .includes('Uint8Array')
        .values()
        .forEach((value) => {
          expect(value instanceof Uint8Array).toBeTrue();
        });
    });

    it(`no Uint8Array`, () => {
      anyMap
        .excludes('Uint8Array')
        .values()
        .forEach((value) => {
          expect(value instanceof Uint8Array).toBeFalse();
        });
    });

    it(`Uint8ClampedArray`, () => {
      anyMap
        .includes('Uint8ClampedArray')
        .values()
        .forEach((value) => {
          expect(value instanceof Uint8ClampedArray).toBeTrue();
        });
    });

    it(`no Uint8ClampedArray`, () => {
      anyMap
        .excludes('Uint8ClampedArray')
        .values()
        .forEach((value) => {
          expect(value instanceof Uint8ClampedArray).toBeFalse();
        });
    });

    it(`undefined`, () => {
      anyMap
        .includes('undefined')
        .values()
        .forEach((value) => {
          expect(value).toBeUndefined();
        });
    });

    it(`no undefined`, () => {
      anyMap
        .excludes('undefined')
        .values()
        .forEach((value) => {
          expect(value).not.toBeUndefined();
        });
    });

    it(`URIError`, () => {
      anyMap
        .includes('URIError')
        .values()
        .forEach((value) => {
          expect(value instanceof URIError).toBeTrue();
        });
    });

    it(`no URIError`, () => {
      anyMap
        .excludes('URIError')
        .values()
        .forEach((value) => {
          expect(value instanceof URIError).toBeFalse();
        });
    });

    it(`WeakMap`, () => {
      anyMap
        .includes('WeakMap')
        .values()
        .forEach((value) => {
          expect(value instanceof WeakMap).toBeTrue();
        });
    });

    it(`no WeakMap`, () => {
      anyMap
        .excludes('WeakMap')
        .values()
        .forEach((value) => {
          expect(value instanceof WeakMap).toBeFalse();
        });
    });

    it(`WeakSet`, () => {
      anyMap
        .includes('WeakSet')
        .values()
        .forEach((value) => {
          expect(value instanceof WeakSet).toBeTrue();
        });
    });

    it(`no WeakSet`, () => {
      anyMap
        .excludes('WeakSet')
        .values()
        .forEach((value) => {
          expect(value instanceof WeakSet).toBeFalse();
        });
    });
  });

  /** 
   * USED TO CREATE THE LIST OF KEYWORDS
   * 
      it(`print keywords`, () => {
        const keywords = [...new Set(anyMap.keys().join('_').split('_'))]
          .filter((v) => v !== '')
          .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
          .map((v) => '`' + v + '`')
          .join(', ');
        console.log(keywords);
        expect(true).toBeTrue();
      });
  */
});

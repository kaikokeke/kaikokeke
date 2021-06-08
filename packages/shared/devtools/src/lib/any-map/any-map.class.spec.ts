import { isPlainObject, isTypedArray } from 'lodash-es';

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

  describe('check keywords', () => {
    function isAnonymousFunction(value: any): any {
      return typeof value === 'function' && value.name === '';
    }

    it(`anonymousFunction`, () => {
      anyMap
        .includes('anonymousFunction')
        .values()
        .forEach((value) => {
          expect(isAnonymousFunction(value)).toEqual(true);
        });
    });

    it(`no anonymousFunction`, () => {
      anyMap
        .excludes('anonymousFunction')
        .values()
        .forEach((value) => {
          expect(isAnonymousFunction(value)).toEqual(false);
        });
    });

    it(`Array`, () => {
      anyMap
        .includes('Array')
        .values()
        .forEach((value) => {
          expect(Array.isArray(value)).toEqual(true);
        });
    });

    it(`no Array`, () => {
      anyMap
        .excludes('Array')
        .values()
        .forEach((value) => {
          expect(Array.isArray(value)).toEqual(false);
        });
    });

    it(`ArrayBuffer`, () => {
      anyMap
        .includes('ArrayBuffer')
        .values()
        .forEach((value) => {
          expect(value instanceof ArrayBuffer).toEqual(true);
        });
    });

    it(`no ArrayBuffer`, () => {
      anyMap
        .excludes('ArrayBuffer')
        .values()
        .forEach((value) => {
          expect(value instanceof ArrayBuffer).toEqual(false);
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
          expect(typeof value === 'bigint').toEqual(true);
        });
    });

    it(`no bigint`, () => {
      anyMap
        .excludes('bigint')
        .values()
        .forEach((value) => {
          expect(typeof value === 'bigint').toEqual(false);
        });
    });

    it(`BigInt64Array`, () => {
      anyMap
        .includes('BigInt64Array')
        .values()
        .forEach((value) => {
          expect(value instanceof BigInt64Array).toEqual(true);
        });
    });

    it(`no BigInt64Array`, () => {
      anyMap
        .excludes('BigInt64Array')
        .values()
        .forEach((value) => {
          expect(value instanceof BigInt64Array).toEqual(false);
        });
    });

    it(`BigUint64Array`, () => {
      anyMap
        .includes('BigUint64Array')
        .values()
        .forEach((value) => {
          expect(value instanceof BigUint64Array).toEqual(true);
        });
    });

    it(`no BigUint64Array`, () => {
      anyMap
        .excludes('BigUint64Array')
        .values()
        .forEach((value) => {
          expect(value instanceof BigUint64Array).toEqual(false);
        });
    });

    // binary

    it(`boolean`, () => {
      anyMap
        .includes('boolean')
        .values()
        .forEach((value) => {
          expect(typeof value === 'boolean').toEqual(true);
        });
    });

    it(`no boolean`, () => {
      anyMap
        .excludes('boolean')
        .values()
        .forEach((value) => {
          expect(typeof value === 'boolean').toEqual(false);
        });
    });

    it(`Boolean`, () => {
      anyMap
        .includes('Boolean')
        .values()
        .forEach((value) => {
          expect(value instanceof Boolean).toEqual(true);
        });
    });

    it(`no Boolean`, () => {
      anyMap
        .excludes('Boolean')
        .values()
        .forEach((value) => {
          expect(value instanceof Boolean).toEqual(false);
        });
    });

    it(`DataView`, () => {
      anyMap
        .includes('DataView')
        .values()
        .forEach((value) => {
          expect(value instanceof DataView).toEqual(true);
        });
    });

    it(`no DataView`, () => {
      anyMap
        .excludes('DataView')
        .values()
        .forEach((value) => {
          expect(value instanceof DataView).toEqual(false);
        });
    });

    it(`Date`, () => {
      anyMap
        .includes('Date')
        .values()
        .forEach((value) => {
          expect(value instanceof Date).toEqual(true);
        });
    });

    it(`no Date`, () => {
      anyMap
        .excludes('Date')
        .values()
        .forEach((value) => {
          expect(value instanceof Date).toEqual(false);
        });
    });

    // decimal

    it(`Error`, () => {
      anyMap
        .includes('Error')
        .values()
        .forEach((value) => {
          expect(value instanceof Error).toEqual(true);
        });
    });

    it(`no Error`, () => {
      anyMap
        .excludes('Error')
        .values()
        .forEach((value) => {
          expect(value instanceof Error).toEqual(false);
        });
    });

    it(`EvalError`, () => {
      anyMap
        .includes('EvalError')
        .values()
        .forEach((value) => {
          expect(value instanceof EvalError).toEqual(true);
        });
    });

    it(`no EvalError`, () => {
      anyMap
        .excludes('EvalError')
        .values()
        .forEach((value) => {
          expect(value instanceof EvalError).toEqual(false);
        });
    });

    // exponent

    it(`falsy`, () => {
      anyMap
        .includes('falsy')
        .values()
        .forEach((value) => {
          expect(Boolean(value)).toEqual(false);
        });
    });

    it(`no falsy`, () => {
      anyMap
        .excludes('falsy')
        .values()
        .forEach((value) => {
          expect(Boolean(value)).toEqual(true);
        });
    });

    it(`Float32Array`, () => {
      anyMap
        .includes('Float32Array')
        .values()
        .forEach((value) => {
          expect(value instanceof Float32Array).toEqual(true);
        });
    });

    it(`no Float32Array`, () => {
      anyMap
        .excludes('Float32Array')
        .values()
        .forEach((value) => {
          expect(value instanceof Float32Array).toEqual(false);
        });
    });

    it(`Float64Array`, () => {
      anyMap
        .includes('Float64Array')
        .values()
        .forEach((value) => {
          expect(value instanceof Float64Array).toEqual(true);
        });
    });

    it(`no Float64Array`, () => {
      anyMap
        .excludes('Float64Array')
        .values()
        .forEach((value) => {
          expect(value instanceof Float64Array).toEqual(false);
        });
    });

    it(`function`, () => {
      anyMap
        .includes('function')
        .values()
        .forEach((value) => {
          expect(typeof value === 'function').toEqual(true);
        });
    });

    it(`no function`, () => {
      anyMap
        .excludes('function')
        .values()
        .forEach((value) => {
          expect(typeof value === 'function').toEqual(false);
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
          expect(isInfinity(value)).toEqual(true);
        });
    });

    it(`no infinity`, () => {
      anyMap
        .excludes('infinity')
        .values()
        .forEach((value) => {
          expect(isInfinity(value)).toEqual(false);
        });
    });

    it(`Int16Array`, () => {
      anyMap
        .includes('Int16Array')
        .values()
        .forEach((value) => {
          expect(value instanceof Int16Array).toEqual(true);
        });
    });

    it(`no Int16Array`, () => {
      anyMap
        .excludes('Int16Array')
        .values()
        .forEach((value) => {
          expect(value instanceof Int16Array).toEqual(false);
        });
    });

    it(`Int32Array`, () => {
      anyMap
        .includes('Int32Array')
        .values()
        .forEach((value) => {
          expect(value instanceof Int32Array).toEqual(true);
        });
    });

    it(`no Int32Array`, () => {
      anyMap
        .excludes('Int32Array')
        .values()
        .forEach((value) => {
          expect(value instanceof Int32Array).toEqual(false);
        });
    });

    it(`Int8Array`, () => {
      anyMap
        .includes('Int8Array')
        .values()
        .forEach((value) => {
          expect(value instanceof Int8Array).toEqual(true);
        });
    });

    it(`no Int8Array`, () => {
      anyMap
        .excludes('Int8Array')
        .values()
        .forEach((value) => {
          expect(value instanceof Int8Array).toEqual(false);
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
          expect(isIterable(value)).toEqual(true);
        });
    });

    it(`no iterable`, () => {
      anyMap
        .excludes('iterable')
        .values()
        .forEach((value) => {
          expect(isIterable(value)).toEqual(false);
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
          expect(value instanceof Map).toEqual(true);
        });
    });

    it(`no Map`, () => {
      anyMap
        .excludes('Map')
        .values()
        .forEach((value) => {
          expect(value instanceof Map).toEqual(false);
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
      return typeof value === 'function' && value.name !== '';
    }

    it(`namedFunction`, () => {
      anyMap
        .includes('namedFunction')
        .values()
        .forEach((value) => {
          expect(isNamedFunction(value)).toEqual(true);
        });
    });

    it(`no namedFunction`, () => {
      anyMap
        .excludes('namedFunction')
        .values()
        .forEach((value) => {
          expect(isNamedFunction(value)).toEqual(false);
        });
    });

    function isNamedObject(value: any): boolean {
      return value != null && typeof value === 'object' && value[1]?.constructor.name != null;
    }

    it(`namedObject`, () => {
      anyMap
        .includes('namedObject')
        .values()
        .forEach((value) => {
          expect(isNamedObject(value)).toEqual(true);
        });
    });

    it(`no namedObject`, () => {
      anyMap
        .excludes('namedObject')
        .values()
        .forEach((value) => {
          expect(isNamedObject(value)).toEqual(false);
        });
    });

    it(`NaN`, () => {
      anyMap
        .includes('NaN')
        .values()
        .forEach((value) => {
          expect(Number.isNaN(value)).toEqual(true);
        });
    });

    it(`no NaN`, () => {
      anyMap
        .excludes('NaN')
        .values()
        .forEach((value) => {
          expect(Number.isNaN(value)).toEqual(false);
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
          expect(isNegative(value)).toEqual(true);
        });
    });

    it(`no negative`, () => {
      anyMap
        .excludes('negative')
        .values()
        .forEach((value) => {
          expect(isNegative(value)).toEqual(false);
        });
    });

    it(`null`, () => {
      anyMap
        .includes('null')
        .values()
        .forEach((value) => {
          expect(value === null).toEqual(true);
        });
    });

    it(`no null`, () => {
      anyMap
        .excludes('null')
        .values()
        .forEach((value) => {
          expect(value === null).toEqual(false);
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
          expect(typeof value === 'number').toEqual(true);
        });
    });

    it(`no number`, () => {
      anyMap
        .excludes('number')
        .values()
        .forEach((value) => {
          expect(typeof value === 'number').toEqual(false);
        });
    });

    it(`Number`, () => {
      anyMap
        .includes('Number')
        .values()
        .forEach((value) => {
          expect(value instanceof Number).toEqual(true);
        });
    });

    it(`no Number`, () => {
      anyMap
        .excludes('Number')
        .values()
        .forEach((value) => {
          expect(value instanceof Number).toEqual(false);
        });
    });

    it(`object`, () => {
      anyMap
        .includes('object')
        .values()
        .forEach((value) => {
          expect(typeof value === 'object').toEqual(true);
        });
    });

    it(`no object`, () => {
      anyMap
        .excludes('object')
        .values()
        .forEach((value) => {
          expect(typeof value === 'object').toEqual(false);
        });
    });

    // octal

    it(`plainObject`, () => {
      anyMap
        .includes('plainObject')
        .values()
        .forEach((value) => {
          expect(isPlainObject(value)).toEqual(true);
        });
    });

    it(`no plainObject`, () => {
      anyMap
        .excludes('plainObject')
        .values()
        .forEach((value) => {
          expect(isPlainObject(value)).toEqual(false);
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
          expect(isPrimitive(value)).toEqual(true);
        });
    });

    it(`no primitive`, () => {
      anyMap
        .excludes('primitive')
        .excludes('null')
        .values()
        .forEach((value) => {
          expect(isPrimitive(value)).toEqual(false);
        });
    });

    it(`RangeError`, () => {
      anyMap
        .includes('RangeError')
        .values()
        .forEach((value) => {
          expect(value instanceof RangeError).toEqual(true);
        });
    });

    it(`no RangeError`, () => {
      anyMap
        .excludes('RangeError')
        .values()
        .forEach((value) => {
          expect(value instanceof RangeError).toEqual(false);
        });
    });

    it(`ReferenceError`, () => {
      anyMap
        .includes('ReferenceError')
        .values()
        .forEach((value) => {
          expect(value instanceof ReferenceError).toEqual(true);
        });
    });

    it(`no ReferenceError`, () => {
      anyMap
        .excludes('ReferenceError')
        .values()
        .forEach((value) => {
          expect(value instanceof ReferenceError).toEqual(false);
        });
    });

    it(`RegExp`, () => {
      anyMap
        .includes('RegExp')
        .values()
        .forEach((value) => {
          expect(value instanceof RegExp).toEqual(true);
        });
    });

    it(`no RegExp`, () => {
      anyMap
        .excludes('RegExp')
        .values()
        .forEach((value) => {
          expect(value instanceof RegExp).toEqual(false);
        });
    });

    it(`Set`, () => {
      anyMap
        .includes('Set')
        .values()
        .forEach((value) => {
          expect(value instanceof Set).toEqual(true);
        });
    });

    it(`no Set`, () => {
      anyMap
        .excludes('Set')
        .values()
        .forEach((value) => {
          expect(value instanceof Set).toEqual(false);
        });
    });

    it(`SharedArrayBuffer`, () => {
      anyMap
        .includes('SharedArrayBuffer')
        .values()
        .forEach((value) => {
          expect(value instanceof SharedArrayBuffer).toEqual(true);
        });
    });

    it(`no SharedArrayBuffer`, () => {
      anyMap
        .excludes('SharedArrayBuffer')
        .values()
        .forEach((value) => {
          expect(value instanceof SharedArrayBuffer).toEqual(false);
        });
    });

    it(`string`, () => {
      anyMap
        .includes('string')
        .values()
        .forEach((value) => {
          expect(typeof value === 'string').toEqual(true);
        });
    });

    it(`no string`, () => {
      anyMap
        .excludes('string')
        .values()
        .forEach((value) => {
          expect(typeof value === 'string').toEqual(false);
        });
    });

    it(`String`, () => {
      anyMap
        .includes('String')
        .values()
        .forEach((value) => {
          expect(value instanceof String).toEqual(true);
        });
    });

    it(`no String`, () => {
      anyMap
        .excludes('String')
        .values()
        .forEach((value) => {
          expect(value instanceof String).toEqual(false);
        });
    });

    it(`symbol`, () => {
      anyMap
        .includes('symbol')
        .values()
        .forEach((value) => {
          expect(typeof value === 'symbol').toEqual(true);
        });
    });

    it(`no symbol`, () => {
      anyMap
        .excludes('symbol')
        .values()
        .forEach((value) => {
          expect(typeof value === 'symbol').toEqual(false);
        });
    });

    it(`SyntaxError`, () => {
      anyMap
        .includes('SyntaxError')
        .values()
        .forEach((value) => {
          expect(value instanceof SyntaxError).toEqual(true);
        });
    });

    it(`no SyntaxError`, () => {
      anyMap
        .excludes('SyntaxError')
        .values()
        .forEach((value) => {
          expect(value instanceof SyntaxError).toEqual(false);
        });
    });

    it(`TypedArray`, () => {
      anyMap
        .includes('TypedArray')
        .values()
        .forEach((value) => {
          expect(isTypedArray(value)).toEqual(true);
        });
    });

    it(`no TypedArray`, () => {
      anyMap
        .excludes('TypedArray')
        .values()
        .forEach((value) => {
          expect(isTypedArray(value)).toEqual(false);
        });
    });

    it(`TypeError`, () => {
      anyMap
        .includes('TypeError')
        .values()
        .forEach((value) => {
          expect(value instanceof TypeError).toEqual(true);
        });
    });

    it(`no TypeError`, () => {
      anyMap
        .excludes('TypeError')
        .values()
        .forEach((value) => {
          expect(value instanceof TypeError).toEqual(false);
        });
    });

    it(`Uint16Array`, () => {
      anyMap
        .includes('Uint16Array')
        .values()
        .forEach((value) => {
          expect(value instanceof Uint16Array).toEqual(true);
        });
    });

    it(`no Uint16Array`, () => {
      anyMap
        .excludes('Uint16Array')
        .values()
        .forEach((value) => {
          expect(value instanceof Uint16Array).toEqual(false);
        });
    });

    it(`Uint32Array`, () => {
      anyMap
        .includes('Uint32Array')
        .values()
        .forEach((value) => {
          expect(value instanceof Uint32Array).toEqual(true);
        });
    });

    it(`no Uint32Array`, () => {
      anyMap
        .excludes('Uint32Array')
        .values()
        .forEach((value) => {
          expect(value instanceof Uint32Array).toEqual(false);
        });
    });

    it(`Uint8Array`, () => {
      anyMap
        .includes('Uint8Array')
        .values()
        .forEach((value) => {
          expect(value instanceof Uint8Array).toEqual(true);
        });
    });

    it(`no Uint8Array`, () => {
      anyMap
        .excludes('Uint8Array')
        .values()
        .forEach((value) => {
          expect(value instanceof Uint8Array).toEqual(false);
        });
    });

    it(`Uint8ClampedArray`, () => {
      anyMap
        .includes('Uint8ClampedArray')
        .values()
        .forEach((value) => {
          expect(value instanceof Uint8ClampedArray).toEqual(true);
        });
    });

    it(`no Uint8ClampedArray`, () => {
      anyMap
        .excludes('Uint8ClampedArray')
        .values()
        .forEach((value) => {
          expect(value instanceof Uint8ClampedArray).toEqual(false);
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
          expect(value instanceof URIError).toEqual(true);
        });
    });

    it(`no URIError`, () => {
      anyMap
        .excludes('URIError')
        .values()
        .forEach((value) => {
          expect(value instanceof URIError).toEqual(false);
        });
    });

    it(`WeakMap`, () => {
      anyMap
        .includes('WeakMap')
        .values()
        .forEach((value) => {
          expect(value instanceof WeakMap).toEqual(true);
        });
    });

    it(`no WeakMap`, () => {
      anyMap
        .excludes('WeakMap')
        .values()
        .forEach((value) => {
          expect(value instanceof WeakMap).toEqual(false);
        });
    });

    it(`WeakSet`, () => {
      anyMap
        .includes('WeakSet')
        .values()
        .forEach((value) => {
          expect(value instanceof WeakSet).toEqual(true);
        });
    });

    it(`no WeakSet`, () => {
      anyMap
        .excludes('WeakSet')
        .values()
        .forEach((value) => {
          expect(value instanceof WeakSet).toEqual(false);
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
      expect(true).toEqual(true);
    });
  */
});

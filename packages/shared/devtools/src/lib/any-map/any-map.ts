import { isEqual, uniqWith } from 'lodash-es';

class TestClass {}

const anyValues: [string, any][] = [];

// boolean
anyValues.push(['_primitive_boolean_falsy_', false]);
anyValues.push(['_primitive_boolean_', true]);
anyValues.push(['_object_Boolean_', new Boolean(false)]);
anyValues.push(['_object_Boolean_', new Boolean(true)]);

// string
anyValues.push(['_primitive_string_falsy_iterable_', '']);
anyValues.push(['_primitive_string_iterable_', 'a']);
anyValues.push(['_object_String_iterable_', new String('')]);

// number
anyValues.push(['_primitive_number_infinity_', Number.POSITIVE_INFINITY]);
anyValues.push(['_primitive_number_infinity_negative_', Number.NEGATIVE_INFINITY]);
anyValues.push(['_primitive_number_NaN_falsy_', Number.NaN]);
anyValues.push(['_primitive_number_integer_', Number.MAX_SAFE_INTEGER]);
anyValues.push(['_primitive_number_integer_negative_', Number.MIN_SAFE_INTEGER]);
anyValues.push(['_primitive_number_integer_falsy_', 0]);
anyValues.push(['_primitive_number_integer_falsy_negative_', -0]);
anyValues.push(['_primitive_number_decimal_', Number.MAX_VALUE]);
anyValues.push(['_primitive_number_decimal_negative_', Number.MIN_VALUE]);
anyValues.push(['_primitive_number_decimal_falsy_', 0.0]);
anyValues.push(['_primitive_number_binary_', 0b1]);
anyValues.push(['_primitive_number_binary_falsy_', 0b0]);
anyValues.push(['_primitive_number_binary_falsy_negative_', -0b0]);
anyValues.push(['_primitive_number_octal_', 0o1]);
anyValues.push(['_primitive_number_octal_falsy_', 0o0]);
anyValues.push(['_primitive_number_octal_falsy_negative_', -0o0]);
anyValues.push(['_primitive_number_hexadecimal_', 0x1]);
anyValues.push(['_primitive_number_hexadecimal_falsy_', 0x0]);
anyValues.push(['_primitive_number_hexadecimal_falsy_negative_', -0x0]);
anyValues.push(['_primitive_number_exponent_', 1e1]);
anyValues.push(['_primitive_number_exponent_falsy_', 0e1]);
anyValues.push(['_primitive_number_exponent_falsy_negative_', -0e1]);
anyValues.push(['_object_Number_', new Number(0)]);

// bigint
anyValues.push(['_primitive_bigint_falsy_', BigInt(0)]);
anyValues.push(['_primitive_bigint_falsy_negative_', BigInt(-0)]);
anyValues.push(['_primitive_bigint_', BigInt(1)]);
anyValues.push(['_primitive_bigint_negative_', BigInt(-1)]);

// symbol
anyValues.push(['_primitive_symbol_', Symbol()]);

// void
anyValues.push(['_primitive_object_null_falsy_nullish_', null]);
anyValues.push(['_primitive_undefined_falsy_nullish_', undefined]);

// function
anyValues.push(['_function_', () => null]);

// object
anyValues.push(['_object_plainobject_', {}]);
anyValues.push(['_object_plainobject_', Object.create(null)]);
anyValues.push(['_object_', new TestClass()]);

// array
anyValues.push(['_object_Array_iterable_', []]);

// TypedArray
anyValues.push(['_object_TypedArray_Int8Array_iterable_', new Int8Array(0)]);
anyValues.push(['_object_TypedArray_Int16Array_iterable_', new Int16Array(0)]);
anyValues.push(['_object_TypedArray_Int32Array_iterable_', new Int32Array(0)]);
anyValues.push(['_object_TypedArray_Uint8Array_iterable_', new Uint8Array(0)]);
anyValues.push(['_object_TypedArray_Uint8ClampedArray_iterable_', new Uint8ClampedArray(0)]);
anyValues.push(['_object_TypedArray_Uint16Array_iterable_', new Uint16Array(0)]);
anyValues.push(['_object_TypedArray_Uint32Array_iterable_', new Uint32Array(0)]);
anyValues.push(['_object_TypedArray_Float32Array_iterable_', new Float32Array(0)]);
anyValues.push(['_object_TypedArray_Float64Array_iterable_', new Float64Array(0)]);
anyValues.push(['_object_TypedArray_BigInt64Array_iterable_', new BigInt64Array(0)]);
anyValues.push(['_object_TypedArray_BigUint64Array_iterable_', new BigUint64Array(0)]);

// ArrayBuffer
anyValues.push(['_object_ArrayBuffer_', new ArrayBuffer(0)]);
anyValues.push(['_object_DataView_', new DataView(new ArrayBuffer(0))]);

// collections
anyValues.push(['_object_Map_iterable_', new Map()]);
anyValues.push(['_object_Set_iterable_', new Set()]);
anyValues.push(['_object_WeakMap_', new WeakMap()]);
anyValues.push(['_object_WeakSet_', new WeakSet()]);

// date
anyValues.push(['_object_Date_', new Date()]);

// regexp
anyValues.push(['_object_RegExp_', new RegExp('')]);

// error
anyValues.push(['_object_Error_', new Error()]);
anyValues.push(['_object_Error_EvalError_', new EvalError()]);
anyValues.push(['_object_Error_RangeError_', new RangeError()]);
anyValues.push(['_object_Error_ReferenceError_', new ReferenceError()]);
anyValues.push(['_object_Error_SyntaxError_', new SyntaxError()]);
anyValues.push(['_object_Error_TypeError_', new TypeError()]);
anyValues.push(['_object_Error_URIError_', new URIError()]);

/**
 * A filter to match a value of type `any` using a full string, a regular expresion or a predicate.
 */
export type FilterAny = string | RegExp | ((key: string) => boolean);

/**
 * AnyMap is a helper class for testing use cases where the value is of type `any`.
 */
export class AnyMap {
  private _anyValues: [string, any][] = anyValues;

  /**
   * Returns a new array that contains the values for each element.
   * @returns An array of values.
   */
  values(): any[] {
    return this._anyValues.map((value: [string, any]) => value[1]);
  }

  /**
   * Returns a new array that contains the keys for each element.
   * @returns An array of keys.
   */
  keys(): string[] {
    return this._anyValues.map((value: [string, any]) => value[0]);
  }

  /**
   * Returns a new array of entries for each element.
   * @returns An array of entries.
   */
  entries(): [string, any][] {
    return this._anyValues;
  }

  /**
   * Returns the values of `any` that meet the inclusions of the filter.
   *
   * If an array of filters is specified, it will be resolved as an OR.
   * All sets that meet any of the conditions will be included, without duplicates.
   * @param filter The filter or array of filters used to include the values.
   * @returns An AnyMap instance with the included values.
   */
  includes(filter: FilterAny | FilterAny[]): AnyMap {
    this._anyValues = Array.isArray(filter) ? this._includesMultiple(filter) : this._includesSingle(filter);
    return this;
  }

  private _includesMultiple(filters: FilterAny[]): [string, any][] {
    let value: [string, any][] = [];

    filters.forEach((match: FilterAny) => {
      value = [...value, ...this._includesSingle(match)];
    });

    return uniqWith(value, isEqual);
  }

  private _includesSingle(filter: FilterAny, base: [string, any][] = this._anyValues): [string, any][] {
    if (typeof filter === 'string') {
      return this._includesString(filter, base);
    }

    return typeof filter === 'function' ? this._includesFunction(filter, base) : this._includesRegexp(filter, base);
  }

  private _includesString(searchString: string, base: [string, any][]): [string, any][] {
    return base.filter((value: [string, any]): boolean => value[0].includes(`_${searchString}_`));
  }

  private _includesRegexp(regexp: RegExp, base: [string, any][]): [string, any][] {
    return base.filter((value: [string, any]): boolean => regexp.test(value[0]));
  }

  private _includesFunction(callback: (key: string) => boolean, base: [string, any][]): [string, any][] {
    return base.filter((value: [string, any]): boolean => callback(value[0]));
  }

  /**
   * Returns the values of `any` that meet the exclusions of the filter.
   *
   * If an array of filters is specified, it will be resolved as an AND.
   * Sets that meet all the conditions will be excluded.
   * @param filter The filter or array of filters used to exlude the values.
   * @returns An AnyMap instance without the excluded values.
   */
  excludes(filter: FilterAny | FilterAny[]): AnyMap {
    this._anyValues = Array.isArray(filter) ? this._excludesMultiple(filter) : this._excludesSingle(filter);
    return this;
  }

  private _excludesMultiple(filters: FilterAny[]): [string, any][] {
    let values: [string, any][] = this._anyValues;

    filters.forEach((match: FilterAny) => {
      values = this._includesSingle(match, values);
    });

    const keys: string[] = values.map((entry: [string, any]): string => entry[0]);

    return this._anyValues.filter((entry: [string, any]): boolean => !keys.includes(entry[0]));
  }

  private _excludesSingle(filter: FilterAny): [string, any][] {
    if (typeof filter === 'string') {
      return this._excludesString(filter);
    }

    return typeof filter === 'function' ? this._excludesFunction(filter) : this._excludesRegexp(filter);
  }

  private _excludesString(searchString: string): [string, any][] {
    return this._anyValues.filter((value: [string, any]): boolean => !value[0].includes(`_${searchString}_`));
  }

  private _excludesRegexp(regexp: RegExp): [string, any][] {
    return this._anyValues.filter((value: [string, any]): boolean => !regexp.test(value[0]));
  }

  private _excludesFunction(callback: (key: string) => boolean): [string, any][] {
    return this._anyValues.filter((value: [string, any]): boolean => !callback(value[0]));
  }
}

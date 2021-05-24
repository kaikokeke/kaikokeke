import { isEqual, uniqWith } from 'lodash-es';

const anyValues: [string, any][] = [];

// boolean
anyValues.push(['_primitive_boolean_falsy_', false]);
anyValues.push(['_primitive_boolean_', true]);
anyValues.push(['_object_boolean_', new Boolean(false)]);
anyValues.push(['_object_boolean_', new Boolean(true)]);

// string
anyValues.push(['_primitive_string_falsy_empty_', '']);
anyValues.push(['_primitive_string_', 'a']);
anyValues.push(['_object_string_', new String('')]);

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
anyValues.push(['_object_number_', new Number(0)]);

// bigint

// symbol
anyValues.push(['_primitive_symbol_', Symbol()]);

// void
anyValues.push(['_primitive_object_null_falsy_nullish_', null]);
anyValues.push(['_primitive_undefined_falsy_nullish_', undefined]);

export type FilterAny = string | RegExp | ((key: string) => boolean);

/**
 * AnyMap is a helper class to test use cases where the value can be an `any` type value.
 */
export class AnyMap {
  private _anyValues: [string, any][] = anyValues;

  /**
   * Returns the any values that includes the match value in the key.
   * @param match A string, RegExp or function to filter by key.
   * @returns The AnyMap instance with the included values.
   */
  includes(match: FilterAny): AnyMap;
  /**
   * Returns the any values that includes the match value in the key.
   * @param match An array of strings, RegExps or functions to filter by key, as OR.
   * @returns The AnyMap instance with the included values.
   */
  includes(match: FilterAny[]): AnyMap;
  includes(match: FilterAny | FilterAny[]): AnyMap {
    this._anyValues = Array.isArray(match) ? this._includesMultiple(match) : this._includesSingle(match);
    return this;
  }

  private _includesMultiple(matchs: FilterAny[]): [string, any][] {
    let value: [string, any][] = [];

    matchs.forEach((match: FilterAny) => {
      value = [...value, ...this._includesSingle(match)];
    });

    return uniqWith(value, isEqual);
  }

  private _includesSingle(match: FilterAny, base: [string, any][] = this._anyValues): [string, any][] {
    if (typeof match === 'string') {
      return this._includesString(match, base);
    }

    return typeof match === 'function' ? this._includesFunction(match, base) : this._includesRegexp(match, base);
  }

  private _includesString(match: string, base: [string, any][]): [string, any][] {
    return base.filter((value: [string, any]): boolean => value[0].includes(`_${match}_`));
  }

  private _includesRegexp(match: RegExp, base: [string, any][]): [string, any][] {
    return base.filter((value: [string, any]): boolean => match.test(value[0]));
  }

  private _includesFunction(match: (key: string) => boolean, base: [string, any][]): [string, any][] {
    return base.filter((value: [string, any]): boolean => match(value[0]));
  }

  /**
   * Returns the any values that does not includes the match value in the key.
   * @param match A string, RegExp or function to filter by key.
   * @returns The AnyMap instance without the included values.
   */
  excludes(match: FilterAny): AnyMap;
  /**
   * Returns the any values that does not includes the match value in the key.
   * @param match An array of strings, RegExps or functions to filter by key, as AND.
   * @returns The AnyMap instance without the included values.
   */
  excludes(match: FilterAny[]): AnyMap;
  excludes(match: FilterAny | FilterAny[]): AnyMap {
    this._anyValues = Array.isArray(match) ? this._excludesMultiple(match) : this._excludesSingle(match);
    return this;
  }

  private _excludesMultiple(matchs: FilterAny[]): [string, any][] {
    let values: [string, any][] = this._anyValues;

    matchs.forEach((match: FilterAny) => {
      values = this._includesSingle(match, values);
    });

    const keys: string[] = values.map((entry: [string, any]): string => entry[0]);

    return this._anyValues.filter((entry: [string, any]): boolean => !keys.includes(entry[0]));
  }

  private _excludesSingle(match: FilterAny): [string, any][] {
    if (typeof match === 'string') {
      return this._excludesString(match);
    }

    return typeof match === 'function' ? this._excludesFunction(match) : this._excludesRegexp(match);
  }

  private _excludesString(match: string): [string, any][] {
    return this._anyValues.filter((value: [string, any]): boolean => !value[0].includes(`_${match}_`));
  }

  private _excludesRegexp(match: RegExp): [string, any][] {
    return this._anyValues.filter((value: [string, any]): boolean => !match.test(value[0]));
  }

  private _excludesFunction(match: (key: string) => boolean): [string, any][] {
    return this._anyValues.filter((value: [string, any]): boolean => !match(value[0]));
  }

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
   * Returns a new array of [key, value] for each element.
   * @returns An array of [key, value].
   */
  entries(): [string, any][] {
    return this._anyValues;
  }
}

import { isEqual, uniqWith } from 'lodash-es';

import { AnyMapFilter } from './any-map-filter.type';
import { ANY_MAP } from './any-map.constant';

/**
 * AnyMap is a helper class for testing use cases where the value is of type `any`.
 */
export class AnyMap {
  private _anyValues: [string, any][] = [...ANY_MAP];

  constructor(extraValues?: [string, any][]) {
    if (extraValues?.length > 0) {
      this._addExtraValues(extraValues);
    }
  }

  private _addExtraValues(extraValues: [string, any][]): void {
    extraValues.forEach((value: [string, any]) => {
      const index: number | undefined = this._getValueIndex(value[1]);

      if (index > -1) {
        this._anyValues[index] = [this._mergeKeys(this._anyValues[index][0], value[0]), this._anyValues[index][1]];
      } else {
        this._anyValues.push([this._mergeKeys(value[0]), value[1]]);
      }
    });
  }

  private _getValueIndex(value: any): number | undefined {
    return this._anyValues.findIndex((_value: [string, any]) => isEqual(_value[1], value));
  }

  private _mergeKeys(key1: string, key2 = ''): string {
    return `_${key1}_${key2}_`.replace(new RegExp('__', 'g'), '_');
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
  includes(filter: AnyMapFilter | AnyMapFilter[]): AnyMap {
    this._anyValues = Array.isArray(filter) ? this._includesMultiple(filter) : this._includesSingle(filter);
    return this;
  }

  private _includesMultiple(filters: AnyMapFilter[]): [string, any][] {
    let value: [string, any][] = [];

    filters.forEach((match: AnyMapFilter) => {
      value = [...value, ...this._includesSingle(match)];
    });

    return uniqWith(value, isEqual);
  }

  private _includesSingle(filter: AnyMapFilter, base: [string, any][] = this._anyValues): [string, any][] {
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
  excludes(filter: AnyMapFilter | AnyMapFilter[]): AnyMap {
    this._anyValues = Array.isArray(filter) ? this._excludesMultiple(filter) : this._excludesSingle(filter);
    return this;
  }

  private _excludesMultiple(filters: AnyMapFilter[]): [string, any][] {
    let values: [string, any][] = this._anyValues;

    filters.forEach((match: AnyMapFilter) => {
      values = this._includesSingle(match, values);
    });

    const keys: string[] = values.map((entry: [string, any]): string => entry[0]);

    return this._anyValues.filter((entry: [string, any]): boolean => !keys.includes(entry[0]));
  }

  private _excludesSingle(filter: AnyMapFilter): [string, any][] {
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

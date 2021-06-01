import { isEqual, uniqWith } from 'lodash-es';

import { AnyMapFilter } from './any-map-filter.type';
import { AnyMapValue } from './any-map-value.type';
import { ANY_MAP } from './any-map.constant';

/**
 * AnyMap is a helper class for testing use cases where the value is of type `any`.
 */
export class AnyMap {
  private _anyValues: AnyMapValue[] = [...ANY_MAP];

  /**
   * AnyMap is a helper class for testing use cases where the value is of type `any`.
   * @param extraValues Additional AnyMapValue array to merge with `ANY_MAP`.
   */
  constructor(extraValues?: AnyMapValue[]) {
    if (extraValues?.length > 0) {
      this._addExtraValues(extraValues);
    }
  }

  private _addExtraValues(extraValues: AnyMapValue[]): void {
    extraValues.forEach((anyMapValue: AnyMapValue) => {
      const index: number = this._findValueIndex(anyMapValue[1]);

      if (index > -1) {
        this._anyValues[index] = [this._mergeUniqueKeys(this._anyValues[index][0], anyMapValue[0]), anyMapValue[1]];
      } else {
        this._anyValues.push([this._mergeUniqueKeys(anyMapValue[0]), anyMapValue[1]]);
      }
    });
  }

  private _findValueIndex(value: any): number {
    return this._anyValues.findIndex((anyMapValue: AnyMapValue): boolean => isEqual(anyMapValue[1], value));
  }

  private _mergeUniqueKeys(...keys: any[]): string {
    return `_${[
      ...new Set(
        keys
          .join('_')
          .split('_')
          .filter((key: string): boolean => key !== '')
      ),
    ].join('_')}_`;
  }

  /**
   * Returns a new array that contains the values for each element.
   * @returns An array of values.
   */
  values(): any[] {
    return this._anyValues.map((value: AnyMapValue): any => value[1]);
  }

  /**
   * Returns a new array that contains the keys for each element.
   * @returns An array of keys.
   */
  keys(): string[] {
    return this._anyValues.map((value: AnyMapValue): string => value[0]);
  }

  /**
   * Returns a new array of entries for each element.
   * @returns An array of entries.
   */
  entries(): AnyMapValue[] {
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

  private _includesMultiple(filters: AnyMapFilter[]): AnyMapValue[] {
    let value: AnyMapValue[] = [];

    filters.forEach((match: AnyMapFilter) => {
      value = [...value, ...this._includesSingle(match)];
    });

    return uniqWith(value, isEqual);
  }

  private _includesSingle(filter: AnyMapFilter, base: AnyMapValue[] = this._anyValues): AnyMapValue[] {
    if (typeof filter === 'string') {
      return this._includesString(filter, base);
    }

    return typeof filter === 'function' ? this._includesFunction(filter, base) : this._includesRegexp(filter, base);
  }

  private _includesString(searchString: string, base: AnyMapValue[]): AnyMapValue[] {
    return base.filter((value: AnyMapValue): boolean => value[0].includes(`_${searchString}_`));
  }

  private _includesRegexp(regexp: RegExp, base: AnyMapValue[]): AnyMapValue[] {
    return base.filter((value: AnyMapValue): boolean => regexp.test(value[0]));
  }

  private _includesFunction(callback: (key: string) => boolean, base: AnyMapValue[]): AnyMapValue[] {
    return base.filter((value: AnyMapValue): boolean => callback(value[0]));
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

  private _excludesMultiple(filters: AnyMapFilter[]): AnyMapValue[] {
    let values: AnyMapValue[] = this._anyValues;

    filters.forEach((match: AnyMapFilter) => {
      values = this._includesSingle(match, values);
    });

    const keys: string[] = values.map((entry: AnyMapValue): string => entry[0]);

    return this._anyValues.filter((entry: AnyMapValue): boolean => !keys.includes(entry[0]));
  }

  private _excludesSingle(filter: AnyMapFilter): AnyMapValue[] {
    if (typeof filter === 'string') {
      return this._excludesString(filter);
    }

    return typeof filter === 'function' ? this._excludesFunction(filter) : this._excludesRegexp(filter);
  }

  private _excludesString(searchString: string): AnyMapValue[] {
    return this._anyValues.filter((value: AnyMapValue): boolean => !value[0].includes(`_${searchString}_`));
  }

  private _excludesRegexp(regexp: RegExp): AnyMapValue[] {
    return this._anyValues.filter((value: AnyMapValue): boolean => !regexp.test(value[0]));
  }

  private _excludesFunction(callback: (key: string) => boolean): AnyMapValue[] {
    return this._anyValues.filter((value: AnyMapValue): boolean => !callback(value[0]));
  }
}

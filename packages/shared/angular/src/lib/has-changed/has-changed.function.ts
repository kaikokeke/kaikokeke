import { SimpleChange } from '@angular/core';
import { isEqual } from 'lodash-es';

/**
 * Checks if a SimpleChange has a new value using deep comparison.
 * @param simpleChange The SimpleChange object.
 * @returns True if the values are different, otherwise false.
 */
export function hasChanged(simpleChange: SimpleChange): boolean {
  return !isEqual(simpleChange.currentValue, simpleChange.previousValue);
}

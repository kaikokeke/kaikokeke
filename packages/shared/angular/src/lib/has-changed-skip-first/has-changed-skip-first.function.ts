import { SimpleChange } from '@angular/core';
import { isEqual } from 'lodash-es';

/**
 * Checks if a SimpleChange has a new value using deep comparison and it's not the first change.
 * @param simpleChange The SimpleChange object.
 * @returns True if the values are different and isn't the first change, otherwise false.
 */
export function hasChangedSkipFirst(simpleChange: SimpleChange): boolean {
  return !simpleChange.isFirstChange() && !isEqual(simpleChange.currentValue, simpleChange.previousValue);
}

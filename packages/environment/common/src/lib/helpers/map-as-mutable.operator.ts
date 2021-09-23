import { OperatorFunction } from 'rxjs';
import { map } from 'rxjs/operators';
import { Writable } from 'ts-essentials';

import { Property } from '../types';
import { asMutable } from './as-mutable.function';

/**
 * Converts to mutable each object value emitted by the source Observable, and emits the resulting values as an Observable.
 * @returns An Observable that emits the values from the source Observable as mutable.
 */
export function mapAsMutable<T extends Property>(): OperatorFunction<T, Writable<T>> {
  return map((value: T): Writable<T> => asMutable(value));
}

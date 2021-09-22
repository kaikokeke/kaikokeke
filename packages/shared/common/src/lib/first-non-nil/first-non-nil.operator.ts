import { Observable, OperatorFunction } from 'rxjs';
import { take, timeout } from 'rxjs/operators';

import { filterNil } from '../filter-nil';

/**
 * Emits only the first not null or undefined value emitted by the source Observable.
 * @param due Number specifying period within which Observable must emit the value or Date specifying before when Observable should complete.
 * @returns The first not null or undefined value emitted by the source Observable.
 * @throws If `due` is setted and the Observable does not emit a value in given time span.
 * @see Observable
 */
export function firstNonNil<T>(due?: number | Date): OperatorFunction<T, NonNullable<T>> {
  return (observable: Observable<T>) => {
    const obs: Observable<NonNullable<T>> = observable.pipe(filterNil(), take(1));

    return due == null ? obs : obs.pipe(timeout(due));
  };
}

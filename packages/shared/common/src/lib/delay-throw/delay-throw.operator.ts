import { MonoTypeOperatorFunction, throwError, timer } from 'rxjs';
import { catchError, mergeMap } from 'rxjs/operators';

/**
 * Delays the emission of errors from the source Observable.
 * @param due The delay duration in milliseconds (a number) or a Date until which the emission of the source items is delayed.
 * @returns A delayed RxJS error Observable.
 */
export function delayThrow<T>(due: number | Date): MonoTypeOperatorFunction<T> {
  return catchError(<E>(error: E) => timer(due).pipe(mergeMap(() => throwError(() => error))));
}

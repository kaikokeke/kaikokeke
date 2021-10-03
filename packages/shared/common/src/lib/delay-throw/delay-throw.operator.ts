import { MonoTypeOperatorFunction, throwError, timer } from 'rxjs';
import { catchError, mergeMap } from 'rxjs/operators';

/**
 * Delays the emission of errors from the source Observable by a given timeout or until a given Date.
 * @param dueTime The delay duration in milliseconds (a number) or a Date until which the emission of the source items is delayed.
 * @returns An delayed error Observable.
 */
export function delayThrow<T>(dueTime: number | Date): MonoTypeOperatorFunction<T> {
  return catchError((error: any) => timer(dueTime).pipe(mergeMap(() => throwError(error))));
}

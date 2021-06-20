import { MonoTypeOperatorFunction, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { SafeSubscription } from '../safe-subscription';

/**
 * Manages safe RxJS subscriptions.
 *
 * This class is intended to avoid memory leaks and race conditions when using Observable subscriptions.
 */
export class SafeRxJS {
  /**
   * A Subject to be emitted on `onDestroy()` to complete subscriptions.
   */
  readonly destroy$: Subject<void> = new Subject();

  /**
   * Safely store disposable resources, such as the execution of an Observable.
   * @see SafeSubscription
   */
  readonly safeSubscription: SafeSubscription = new SafeSubscription();

  /**
   * Emits the values emitted by the source Observable until the `onDestroy()` method is executed.
   * @return An Observable that emits the values from the source Observable until the `onDestroy()` method is executed.
   * @see Observable
   */
  takeUntilDestroy<T>(): MonoTypeOperatorFunction<T> {
    return (source: Observable<T>): Observable<T> => source.pipe<T>(takeUntil<T>(this.destroy$));
  }

  /**
   * Disposes the resource held by Observable subscriptions.
   */
  onDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.safeSubscription.unsubscribe();
  }
}

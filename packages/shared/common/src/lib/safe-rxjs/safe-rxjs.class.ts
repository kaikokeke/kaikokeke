import { MonoTypeOperatorFunction, Observable, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';

import { SafeSubscription } from '../safe-subscription';

/**
 * Manages safe RxJS subscriptions.
 *
 * This class is intended to avoid memory leaks and race conditions when using Observable subscriptions.
 */
export class SafeRxJS {
  private readonly _onDestroy$: Subject<void> = new Subject();

  /**
   * Safely store disposable resources, such as the execution of an Observable.
   * @see SafeSubscription
   */
  readonly safeSubscription: SafeSubscription = new SafeSubscription();

  /**
   * Emits only the first value emitted by the source Observable or until the `onDestroy` method is executed.
   * @return An Observable that emits only the first value emitted by the source Observable
   * or until the `onDestroy` method is executed.
   * @see Observable
   */
  takeOne<T>(): MonoTypeOperatorFunction<T> {
    return this.takeCount<T>(1);
  }

  /**
   * Emits only the first `count` values emitted by the source Observable or until the `onDestroy` method is executed.
   * @param count The maximum number of `next` values to emit.
   * @return An Observable that emits only the first `count` values emitted by the source Observable
   * or until the `onDestroy` method is executed.
   * @see Observable
   */
  takeCount<T>(count: number): MonoTypeOperatorFunction<T> {
    return (source: Observable<T>): Observable<T> => source.pipe<T, T>(take<T>(count), takeUntil<T>(this._onDestroy$));
  }

  /**
   * Emits the values emitted by the source Observable until the `onDestroy` method is executed.
   * @return An Observable that emits until the `onDestroy` method is executed.
   * @see Observable
   */
  takeUntilDestroy<T>(): MonoTypeOperatorFunction<T> {
    return (source: Observable<T>): Observable<T> => source.pipe<T>(takeUntil<T>(this._onDestroy$));
  }

  /**
   * Disposes the resource held by Observable subscriptions.
   */
  onDestroy(): void {
    this._onDestroy$.next();
    this._onDestroy$.complete();
    this.safeSubscription.unsubscribe();
  }
}

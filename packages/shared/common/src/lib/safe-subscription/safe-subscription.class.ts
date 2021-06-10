import { isEqual } from 'lodash-es';
import { Subscription } from 'rxjs';

import { SafeSubscriber } from './safe-subscriber.type';
import { SubscriptionFn } from './subscription-fn.type';

/**
 * Safely store disposable resources, such as the execution of an Observable.
 */
export class SafeSubscription {
  private readonly _safeSubscriptions: Map<string, SafeSubscriber> = new Map();

  /**
   * Creates a safe disposable resource, such as the execution of an Observable, associated with a `key`.
   *
   * Creates the Subscription if the key doesn't exist or the existing Subscription is closed.
   * Will unsubscribe before subscribe again if the added key exists and the `args` aren't equal.
   * @param key The unique key associated with the Subscription.
   * @param subscriptionFn A function that returns a Subscription.
   * @param [args] The arguments associated with the Subscription.
   */
  add(key: string, subscriptionFn: SubscriptionFn, ...args: any[]): void {
    const safeSubscriber: SafeSubscriber | undefined = this._safeSubscriptions.get(key);

    if (safeSubscriber == null || safeSubscriber.subscription.closed) {
      this._safeSubscriptions.set(key, { subscription: subscriptionFn(), args });
    } else if (!isEqual(safeSubscriber.args, args)) {
      safeSubscriber.subscription.unsubscribe();
      this._safeSubscriptions.set(key, { subscription: subscriptionFn(), args });
    }
  }

  /**
   * Gets the Subscription associated with the `key` or undefined if the key doesn't exist.
   * @param key The unique key associated with the Subscription.
   * @returns A Subscription or undefined if the key doesn't exist.
   */
  get(key: string): Subscription | undefined {
    return this._safeSubscriptions.get(key)?.subscription;
  }

  /**
   * Disposes the resource held by the safe subscriptions associated with the `keys`
   * or all the resources if a key is not provided.
   * @param [keys] The list of keys to unsubscribe.
   */
  unsubscribe(...keys: string[]): void {
    if (keys.length === 0) {
      this._unsubscribeAll();
    } else {
      keys.forEach((key: string) => {
        this._unsubscribeKey(key);
      });
    }
  }

  private _unsubscribeAll(): void {
    this._safeSubscriptions.forEach((safeSubscriber: SafeSubscriber, key: string) => {
      safeSubscriber.subscription.unsubscribe();
      this._safeSubscriptions.delete(key);
    });
  }

  private _unsubscribeKey(key: string): void {
    const subscription: Subscription | undefined = this.get(key);

    if (subscription != null) {
      subscription.unsubscribe();
      this._safeSubscriptions.delete(key);
    }
  }
}

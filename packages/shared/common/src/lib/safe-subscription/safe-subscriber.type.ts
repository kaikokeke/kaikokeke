import { Subscription } from 'rxjs';

/**
 * Represents a disposable resource, such as the execution of an Observable, and the associated arguments.
 */
export interface SafeSubscriber {
  /**
   * Represents a disposable resource, such as the execution of an Observable.
   */
  readonly subscription: Subscription;
  /**
   * The arguments associated with the Subscription.
   */
  readonly args?: any[];
}

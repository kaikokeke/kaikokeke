import { Subscription } from 'rxjs';

/**
 * A function that returns a Subscription.
 */
export type SubscriptionFn = () => Subscription;

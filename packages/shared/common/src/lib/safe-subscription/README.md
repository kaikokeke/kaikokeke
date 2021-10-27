# SafeSubscription

Safely store disposable resources, such as the execution of an Observable.

## Getting started

Import from `@kaikokeke/common` and use as described in the API.

```ts
import { SafeSubscription } from '@kaikokeke/common';

const safeSubscription: SafeSubscription = new SafeSubscription();
```

## API

```ts
class SafeSubscription {
  add(key: string, subscriptionFn: SubscriptionFn, ...args: any[]): void;
  get(key: string): Subscription | undefined;
  unsubscribe(...keys: string[]): void;
}
```

### Exposed Types

#### `SubscriptionFn`

A function that returns a Subscription.

```ts
type SubscriptionFn = () => Subscription;
```

### Exposed Methods

#### `add(key: string, subscriptionFn: SubscriptionFn, ...args: any[]): void`

Creates a safe disposable resource, such as the execution of an Observable, associated with a `key`.

```ts
import { httpService } from '...';
import { Entity } from '...';
import { params } from '...';

const httpFn: SubscriptionFn = () =>
  httpService
    .get<Entity[]>('path', { params })
    .pipe(take(1))
    .subscribe({
      next: (entities: Entity[]) => {
        console.log('entities', entities);
      },
    });

safeSubscription.add('httpFn', httpFn, params);
```

Creates the Subscription if the key doesn't exist or the existing Subscription is closed.
Will unsubscribe before subscribe again if the added key exists and the `args` aren't equal.

#### `get(key: string): Subscription | undefined`

Gets the Subscription associated with the `key` or undefined if the key doesn't exist.

```ts
safeSubscription.get('load'); // 'load' Subscription
safeSubscription.get('noKey'); // undefined
```

#### `unsubscribe(...keys: string[]): void`

Disposes the resource held by the safe subscriptions associated with the `keys` or all the resources if a key is not provided.

```ts
safeSubscription.unsubscribe('load'); // unsubscribes 'load' Subscription
safeSubscription.unsubscribe(); // unsubscribes all subscriptions
```

## Example of use

This method is very useful when calling functions or methods that calls an Observable with arguments, avoiding memory leaks and race conditions due to slow loads.

```ts
import { httpService } from '...';
import { Entity } from '...';

function noSafeLoad(params: { [key: string]: string }): void {
  httpService
    .get<Entity[]>('path', { params })
    .pipe(take(1))
    .subscribe({
      next: (entities: Entity[]) => {
        console.log('entities', entities);
      },
    });
}
```

```ts
noSafeLoad({ a: '0' }); // ----------(a|)
noSafeLoad({ a: '1' }); //   ^--(a|)
```

In this example, the user wants to display the data filtering by `{ a: 0 }`, but right after filter again by using `{ a: 1 }`. The second call resolves faster, so it is displayed first, but when the first call resolves it replaces the values ​​that were displayed with its own, and obviously these are not the results that the user expected to get.

Using this class we solve this problem through the following behavior:

```ts
import { httpService } from '...';
import { Entity } from '...';

function load(params: { [key: string]: string }): void {
  const httpFn: SubscriptionFn = () =>
    httpService
      .get<Entity[]>('path', { params })
      .pipe(take(1))
      .subscribe({
        next: (entities: Entity[]) => {
          console.log('entities', entities);
        },
      });

  safeSubscription.add('load', httpFn, params);
}
```

```ts
load({ a: '0' }); // -----(a|)
load({ a: '0' }); //   ^
load({ a: '0' }); //            ^--|
load({ a: '1' }); //               ^----(a|)
```

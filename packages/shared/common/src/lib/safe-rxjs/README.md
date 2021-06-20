# SafeRxJS

Manages safe RxJS subscriptions.

```ts
const safeRxJS: SafeRxJS = new SafeRxJS();
```

This class is intended to avoid memory leaks and race conditions when using Observable subscriptions.

## API

### Exposed Properties

#### `readonly destroy$: Subject<void>`

A Subject to be emitted on `onDestroy()` to complete subscriptions.

#### `readonly safeSubscription: SafeSubscription`

Safely store disposable resources, such as the execution of an Observable.

See [SafeSubscription](../safe-subscription/README.md).

### Exposed Methods

#### `takeUntilDestroy<T>(): MonoTypeOperatorFunction<T>`

Emits the values emitted by the source Observable until the `onDestroy` method is executed.

```ts
const destroy$: Observable<any> = observable$.pipe(safeRxJS.takeUntilDestroy()).subscribe();
```

```ts
onDestroy()  '---------(x|)'
destroy$     '-x-x-x-x-x-x-'
subscribe    '-x-x-x-x-|   '
```

#### `onDestroy(): void`

Disposes the resource held by Observable subscriptions.

```ts
safeRxJS.onDestroy();
```

## Example of use

```ts
import { HttpClient } from '@angular/common/http';
import { OnDestroy, OnInit } from '@angular/core';
import { SafeRxJS, SubscriptionFn } from '@kaikokeke/common';
import { fromEvent, Observable } from 'rxjs';
import { take } from 'rxjs/operators';

class TestClass implements OnInit, OnDestroy {
  readonly safeRxJS: SafeRxJS = new SafeRxJS();

  constructor(protected readonly http: HttpClient) {}

  ngOnInit(): void {
    fromEvent(document, 'click')
      .pipe(take(5), safeRxJS.takeUntilDestroy())
      .subscribe({
        next: (value: Event) => {
          // do something
        },
      });
  }

  load(options: any): void {
    const loadFn: SubscriptionFn = () =>
      this.http
        .get('https://test.com', options)
        .pipe(take(1))
        .subscription({
          next: (value: any) => {
            // do something
          },
        });

    safeRxJS.safeSubscription.add('loadFn', loadFn, options);
  }

  ngOnDestroy(): void {
    safeRxJS.onDestroy();
  }
}
```

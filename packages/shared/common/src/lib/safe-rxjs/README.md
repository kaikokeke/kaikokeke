# SafeRxJS

Manages safe RxJS subscriptions.

```ts
const safeRxJS: SafeRxJS = new SafeRxJS();
```

This class is intended to avoid memory leaks and race conditions when using Observable subscriptions.

## API

### Exposed Properties

#### `readonly safeSubscription: SafeSubscription`

Safely store disposable resources, such as the execution of an Observable.

See [SafeSubscription](../safe-subscription/README.md).

### Exposed Methods

#### `takeOne<T>(): MonoTypeOperatorFunction<T>`

Emits only the first value emitted by the source Observable or until the `onDestroy` method is executed.

```ts
const first$: Observable<any> = observable$.pipe(safeRxJS.takeOne()).subscribe();
```

```ts
onDestroy()  '-----(x|)'
first$       '---x---x-'
subscribe    '---(x|)  '
```

```ts
onDestroy()  '-----(x|)'
first$       '-------x-'
subscribe    '-----|   '
```

#### `takeCount<T>(count: number): MonoTypeOperatorFunction<T>`

Emits only the first `count` values emitted by the source Observable or until the `onDestroy` method is executed.

```ts
const two$: Observable<any> = observable$.pipe(safeRxJS.takeCount(2)).subscribe();
```

```ts
onDestroy()  '-------(x|)'
two$         '-x-x----x--'
subscribe    '-x-(x|)    '
```

```ts
onDestroy()  '-------(x|)'
two$         '--x------x-'
subscribe    '--x----|   '
```

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

class TestClass implements OnInit, OnDestroy {
  readonly safeRxJS: SafeRxJS = new SafeRxJS();

  constructor(protected readonly http: HttpClient) {}

  ngOnInit(): void {
    fromEvent(document, 'click')
      .pipe(safeRxJS.takeUntilDestroy())
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
        .pipe(safeRxJS.takeOne())
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

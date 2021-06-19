# SafeRxJS

Manages safe RxJS subscriptions.

```ts
const safeRxJS: SafeRxJS = new SafeRxJS();
```

## API

### Exposed Properties

#### `readonly safeSubscription: SafeSubscription`

Safely store disposable resources, such as the execution of an Observable.

See [SafeSubscription](../safe-subscription/README.md).

### Exposed Methods

#### `takeOne<T>(): MonoTypeOperatorFunction<T>`

Emits only the first value emitted by the source Observable or until the `onDestroy` method is executed.

```ts
const first$: Observable<any> = observable$.pipe(safeRxJS.takeOne());
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
const three$: Observable<any> = observable$.pipe(safeRxJS.takeCount(3)).subscribe();
```

```ts
onDestroy()  '-------(x|)'
three$       '-x-x-x-----'
subscribe    '-x-(x|)    '
```

```ts
onDestroy()  '-------(x|)'
three$       '--x------x-'
subscribe    '--x----|   '
```

#### `takeUntilDestroy<T>(): MonoTypeOperatorFunction<T>`

Emits the values emitted by the source Observable until the `onDestroy` method is executed.

```ts
const destroy$: Observable<any> = observable$.pipe(safeRxJS.takeUntilDestroy());
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
import { SafeRxJS, SubscriptionFn } from '@kaikokeke/common';
import { fromEvent, Observable } from 'rxjs';

class TestClass implements OnDestroy {
  readonly safeRxJS: SafeRxJS = new SafeRxJS();
  readonly click$: Observable<Event> = fromEvent(document, 'click').pipe(safeRxJS.takeUntilDestroy());

  constructor(protected readonly http: HttpClient) {}

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

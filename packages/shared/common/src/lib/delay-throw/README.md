# Delay Throw

Delays the emission of errors from the source Observable.

## Getting started

Import from `@kaikokeke/common` and use as described in the API.

```ts
import { delayThrow } from '@kaikokeke/common';
import { throwError } from 'rxjs';

throwError(new Error()).pipe(delayThrow(5));
```

## API

### Function

#### `delayThrow<T>(dueTime: number | Date): MonoTypeOperatorFunction<T>`

Delays the emission of errors from the source Observable.

```ts
throwError(new Error()).pipe(delayThrow(5));
```

Returns a delayed RxJS error Observable.

```ts
throwError(new Error())
  .pipe(delayThrow(5))
  .subscribe({
    error: <E>(error: E) => console.log(error),
    // logs after 5 ms
  });
```

```
// See in https://swirly.dev/

-#

> delayThrow(5)

------#
```

## Examples of use

### Differences between RxJS delay() and delayThrow()

The rxjs `delay(dueTime)` operator doesn't work with RxJS errors because a RxJS error is an exception, so it stop immediately the stream to catch it and react to something unexpected. If an error occurs before a delayed value emit, although the error is delayed, the value will not be emitted.

```ts
// See in https://swirly.dev/

-a-#
a := 0

> delay(5)

---#

> delayThrow(5)

-a------#
a := 0

> delay(1), delayThrow(5)

--a-----#
a := 0

> delay(5), delayThrow(5)

--------#
```

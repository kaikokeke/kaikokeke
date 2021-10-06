# Delay Throw

Delays the emission of errors from the source Observable by a given timeout or until a given Date.

```ts
export function delayThrow<T>(dueTime: number | Date): MonoTypeOperatorFunction<T>;
```

Returns a delayed error Observable.

The rxjs `delay(dueTime)` operator doesn't work because RxJS error is exception, so it stop immediately the stream and let you catch it to react to something un expected.

```
// See in https://swirly.dev/

-a-#
a := 0

> delayThrow(5)

-a------#
a := 0
```

## Examples of use

```ts
import { delayThrow } from '@kaikokeke/common';
import { throwError } from 'rxjs';

throwError(new Error())
  .pipe(delayThrow(5))
  .subscribe({
    error: <E>(error: E) => {
      console.log(error); // logs after 5 ms
    },
  });
```

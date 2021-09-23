# First Non Nil

Emits only the first not null or undefined value emitted by the source Observable.

```ts
export function firstNonNil<T>(due?: number | Date): OperatorFunction<T, NonNullable<T>>;
```

Param `due` ia a number specifying period within which Observable must emit the value or Date specifying before when Observable should complete.

Returns the first not null or undefined value emitted by the source Observable.

Throws if `due` is setted and the Observable does not emit a value in given time span.

```
// See in https://swirly.dev/

-a-b-c-d-e-
title = source
a := null
b := und
c := 0
d := 1
e := 2

> firstNonNil(due?)

-----(c|)
title = ()
c := 0

-----(c|)
title = (10)
c := 0

---#
title = (3)
```

## Examples of use

```ts
import { firstNonNil } from '@kaikokeke/common';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';

of(null, undefined, 0, 1, 2)
  .pipe(firstNonNil())
  .subscribe({
    next: (value) => console.log(value), // 0
    error: (error) => console.error(error), // never
  });

of(0, 1, 2)
  .pipe(delay(50), firstNonNil(10))
  .subscribe({
    next: (value) => console.log(value), // never
    error: (error) => console.error(error), // TimeoutError
  });

of(0, 1, 2)
  .pipe(delay(10), firstNonNil(50))
  .subscribe({
    next: (value) => console.log(value), // 0
    error: (error) => console.error(error), // never
  });
```

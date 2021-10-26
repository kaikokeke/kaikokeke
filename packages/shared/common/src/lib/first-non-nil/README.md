# First Non Nil

Emits only the first not null or undefined value emitted by the source Observable.

## Getting started

Import from `@kaikokeke/common` and use as described in the API.

```ts
import { firstNonNil } from '@kaikokeke/common';
import { of } from 'rxjs';

of(null, undefined, 0, 1, 2).pipe(firstNonNil());
```

## API

### Function

#### `firstNonNil<T>(due?: number | Date): OperatorFunction<T, NonNullable<T>>`

Emits only the first not null or undefined value emitted by the source Observable.

```ts
of(null, undefined, 0, 1, 2).pipe(firstNonNil());
```

Due is a number specifying period in miliseconds within which Observable must emit the value or Date specifying before when Observable should complete.

```ts
of(null, undefined, 0, 1, 2).pipe(firstNonNil(10));
```

Returns the first not null or undefined value emitted by the source Observable.

```ts
of(null, undefined, 0, 1, 2).pipe(firstNonNil()); // --(0|)
```

Throws `TimeoutError` if `due` is setted and the Observable does not emit a value in given time span.

```ts
of(null, undefined, 0, 1, 2).pipe(firstNonNil(1)); // throws TimeoutError
```

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

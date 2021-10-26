# Filter Nil

Filter items emitted by the source Observable by only emitting those that are not null or undefined.

## Getting started

Import from `@kaikokeke/common` and use as described in the API.

```ts
import { filterNil } from '@kaikokeke/common';
import { of } from 'rxjs';

of(null, undefined, 0).pipe(filterNil());
```

## API

### Function

#### `filterNil<T>(): OperatorFunction<T, NonNullable<T>>`

Filter items emitted by the source Observable by only emitting those that are not null or undefined.

```ts
of(null, undefined, 0).pipe(filterNil());
```

Returns an Observable that emits items from the source Observable that are not null or undefined.

```ts
of(0, null, undefined, 1).pipe(filterNil()); // 0--(1|)
```

```
// See in https://swirly.dev/

-a-b-c-d-
a := 0
b := null
c := und
d := 1

> filterNil()

-a-----d-
a := 0
d := 1
```

# Filter Nil

Filter items emitted by the source Observable by only emitting those that are not null or undefined.

```ts
export function filterNil<T>(): OperatorFunction<T, NonNullable<T>>;
```

Returns an Observable that emits items from the source Observable that are not null or undefined.

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

## Examples of use

```ts
import { filterNil } from '@kaikokeke/common';
import { of } from 'rxjs';

of(0, null, undefined, 1)
  .pipe(filterNil())
  .subscribe({
    next: (value) => {
      console.log(value); // 0, 1
    },
  });
```

# Filter Nil

Filter items emitted by the source Observable by only emitting those that are not null or undefined.

```ts
export function filterNil<T>(): OperatorFunction<T, NonNullable<T>>;
```

Returns an Observable that emits items from the source Observable that are not null or undefined.

## Examples of use

```ts
import { filterNil } from '@kaikokeke/common';
import { of } from 'rxjs';

of('a', null, undefined, 0)
  .pipe(filterNil())
  .subscribe({
    next: (value) => {
      console.log(value); // 'a', 0
    },
  });
```

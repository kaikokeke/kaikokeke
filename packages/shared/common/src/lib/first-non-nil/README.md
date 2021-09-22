# First Non Nil

Emits only the first not null or undefined value emitted by the source Observable.

```ts
export function firstNonNil<T>(due?: number | Date): OperatorFunction<T, NonNullable<T>>;
```

Param `due` ia a number specifying period within which Observable must emit the value or Date specifying before when Observable should complete.

Returns the first not null or undefined value emitted by the source Observable.

Throws if `due` is setted and the Observable does not emit a value in given time span.

## Examples of use

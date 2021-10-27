# Common

[![Quality Gate Status](https://img.shields.io/sonar/quality_gate/kaikokeke:common?logo=SonarCloud&server=https%3A%2F%2Fsonarcloud.io&style=flat-square)](https://sonarcloud.io/dashboard?id=kaikokeke%3Acommon)

Provides common Kaikokeke framework functionality.

## Install

```bash
yarn add @kaikokeke/common
```

## API

- [deepMerge](./src/lib/deep-merge/README.md): Recursively merges own and inherited enumerable string keyed properties of source objects.
- [delayThrow](./src/lib/delay-throw/README.md): Delays the emission of errors from the source Observable by a given timeout or until a given Date.
- [executeIfExists](./src/lib/execute-if-exists/README.md): Executes an object method if it exists.
- [filterNil](./src/lib/filter-nil/README.md): Filter items emitted by the source Observable by only emitting those that are not null or undefined.
- [firstNonNil](./src/lib/first-non-nil/README.md): Emits only the first not null or undefined value emitted by the source Observable.
- [InvalidPathError](./src/lib/invalid-path-error/README.md): Throws an invalid path error.
- [isValidPath](./src/lib/is-valid-path/README.md): Checks if the value is a valid path.
- [pathAsArray](./src/lib/path-as-array/README.md): Converts a Path to Array format.
- [pathAsString](./src/lib/path-as-string/README.md): Converts a Path to string format.
- [prefixPath](./src/lib/prefix-path/README.md): Adds a prefix to a path.
- [SafeRxJS](./src/lib/safe-rxjs/README.md): Manages safe RxJS subscriptions.
- [SafeSubscription](./src/lib/safe-subscription/README.md): Safely store disposable resources, such as the execution of an Observable.
- [suffixPath](./src/lib/suffix-path/README.md): Adds a suffix to a path.
- [Types](./src/lib/types/README.md): Common types used in the library.
  - [AtLeastOne](./src/lib/types/at-least-one.type.ts): Type to ensure that an array has at least one element.
  - [JSONValue](./src/lib/types/json-value.type.ts): A valid JavaScript Object Notation (JSON) value type.
  - [ParsedJSON](./src/lib/types/parsed-json.type.ts): A native JavaScript object literal resulting from the parse of a JavaScript Object Notation (JSON).
  - [Path](./src/lib/types/path.type.ts): Represents the property path of an object.

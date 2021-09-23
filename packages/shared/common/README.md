# Common

[![Quality Gate Status](https://img.shields.io/sonar/quality_gate/kaikokeke:common?logo=SonarCloud&server=https%3A%2F%2Fsonarcloud.io&style=flat-square)](https://sonarcloud.io/dashboard?id=kaikokeke%3Acommon)

Provides common Kaikokeke framework functionality.

## Install

```bash
yarn add @kaikokeke/common
```

## API

- [deepMerge](./src/lib/deep-merge/README.md): Recursively merges own and inherited enumerable string keyed properties of source objects.
- [filterNil](./src/lib/filter-nil/README.md): Filter items emitted by the source Observable by only emitting those that are not null or undefined.
- [firstNonNil](./src/lib/first-non-nil/README.md): Emits only the first not null or undefined value emitted by the source Observable.
- [SafeRxJS](./src/lib/safe-rxjs/README.md): Manages safe RxJS subscriptions.
- [SafeSubscription](./src/lib/safe-subscription/README.md): Safely store disposable resources, such as the execution of an Observable.

## Types

- [JSONValue](./src/lib/types/json-value.type.ts): A valid JavaScript Object Notation (JSON) value type.
- [ParsedJSON](./src/lib/types/parsed-json.type.ts): A native JavaScript object literal resulting from the parse of a JavaScript Object Notation (JSON).

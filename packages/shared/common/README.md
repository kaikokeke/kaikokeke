# Common

[![Quality Gate Status](https://img.shields.io/sonar/quality_gate/kaikokeke:common?logo=SonarCloud&server=https%3A%2F%2Fsonarcloud.io&style=flat-square)](https://sonarcloud.io/dashboard?id=kaikokeke%3Acommon)

The Common library provides fundamental Kaikokeke framework functionality.

## Install

```bash
yarn add @kaikokeke/common
```

## API

- [Deep Merge](./src/lib/deep-merge/README.md): Recursively merges own and inherited enumerable string keyed properties of source objects.
- [SafeRxJS](./src/lib/safe-rxjs/README.md): Manages safe RxJS subscriptions.
- [SafeSubscription](./src/lib/safe-subscription/README.md): Safely store disposable resources, such as the execution of an Observable.
- [Unfreeze](./src/lib/unfreeze/README.md): Unfreezes the frozen values creating a recursive shallow clone of each value emitted by the source Observable, and emitting the resulting deep cloned values as an Observable.

## Types

- [JSONValue](./src/lib/types/json-value.type.ts): A valid JavaScript Object Notation (JSON) value type.
- [ParsedJSON](./src/lib/types/parsed-json.type.ts): A native JavaScript object literal resulting from the parse of a JavaScript Object Notation (JSON).

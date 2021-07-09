# Common

[![Quality Gate Status](https://img.shields.io/sonar/quality_gate/kaikokeke:common?logo=SonarCloud&server=https%3A%2F%2Fsonarcloud.io&style=flat-square)](https://sonarcloud.io/dashboard?id=kaikokeke%3Acommon)

The Common library provides fundamental Kaikokeke framework functionality.

## Install

```bash
yarn add @kaikokeke/common
```

## API

- [Merge Deep](./src/lib/merge-deep/README.md): Recursively merges own and inherited enumerable string keyed properties of source objects.
- [SafeRxJS](./src/lib/safe-rxjs/README.md): Manages safe RxJS subscriptions.
- [SafeSubscription](./src/lib/safe-subscription/README.md): Safely store disposable resources, such as the execution of an Observable.
- [Unfreeze](./src/lib/unfreeze/README.md): Unfreezes the frozen values creating a recursive shallow clone of each value emitted by the source Observable, and emitting the resulting deep cloned values as an Observable.

## Types

- [HashMap](./src/lib/types/hash-map.type.ts): A native JavaScript object literal that implements an associative structure that can map keys to values.
- [JSONValue](./src/lib/types/json-value.type.ts): A valid JavaScript Object Notation (JSON) value type.
- [DeserializedJSON](./src/lib/types/deserialized-json.type.ts): A native JavaScript object literal resulting from the deserialization of a JavaScript Object Notation (JSON).

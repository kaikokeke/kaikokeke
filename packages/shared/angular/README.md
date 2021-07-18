# Common Angular

[![Quality Gate Status](https://img.shields.io/sonar/quality_gate/kaikokeke:common-angular?logo=SonarCloud&server=https%3A%2F%2Fsonarcloud.io&style=flat-square)](https://sonarcloud.io/dashboard?id=kaikokeke%3Acommon-angular)

The Common Angular library provides fundamental Kaikokeke Angular framework functionality.

## Install

```bash
yarn add @kaikokeke/common-angular
```

## API

- [hasChanged](./src/lib/has-changed/README.md): Checks if a SimpleChange has a new value using deep comparison.
- [hasChangedSkipFirst](./src/lib/has-changed-skip-first/README.md): Checks if a SimpleChange has a new value using deep comparison.
- [ServiceInjector](./src/lib/service-injector/README.md): Creates a `serviceInjector()` function that is able to statically inject any service available in the application.

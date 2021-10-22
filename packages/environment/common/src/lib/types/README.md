# Environment Types

The types used in the environment library.

- [Property](./property.type.ts): An environment property value.
- [Properties](./properties.type.ts): A set of environment properties required to run the application.
- [EnvironmentConfig](./environment-config.interface.ts): Configuration parameters for the Environment module.
- [LoaderPropertiesSource](./loader-properties-source.type.ts): A properties source with all the default values to be used by the EnvironmentLoader.

The Loader Lifecycle Hooks.

- [OnBeforeLoad](./on-before-load.interface.ts): A lifecycle hook that is called before start the properties sources load.
- [OnAfterComplete](./on-after-complete.interface.ts): A lifecycle hook that is called after all properties sources complete.
- [OnAfterLoad](./on-after-load.interface.ts): A lifecycle hook that is called after the load is resolved.
- [OnAfterError](./on-after-error.interface.ts): A lifecycle hook that is called after the load is rejected.

The Loader Properties Sources Lifecycle Hooks.

- [OnBeforeSourceLoad](./on-before-source-load.interface.ts): A lifecycle hook that is called before a source starts to load the properties.
- [OnBeforeSourceAdd](./on-before-source-add.interface.ts): A lifecycle hook that is called before a source properties are added to the environment.
- [OnAfterSourceAdd](./on-after-source-add.interface.ts): A lifecycle hook that is called after a source properties are added to the environment.
- [OnAfterSourceComplete](./on-after-source-complete.interface.ts): A lifecycle hook that is called after a source complete.
- [OnAfterSourceError](./on-after-source-error.interface.ts): A lifecycle hook that is called after a source is rejected.

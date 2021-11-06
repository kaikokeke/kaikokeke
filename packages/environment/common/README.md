# Environment

This library creates an environment properties store that is populated by asyncronous property sources and exposes a query to get the values, as well a service to modify them at runtime.

The common way to manage properties in JavaScript frameworks is to define environment values in a constant or env file an load them at build stage. This strategy is not suitable for developments where, for example, the final build is deployed in a repositoy manager such as Nexus or Artifactory and reused in diferent environments, or in a microservices architecture where the properties are loaded from a config manager service. This library addresses this and other gaps by allowing, among others, the following behaviors:

- Get properties from constants
- Get properties from local sources, such as files
- Get properties from remote HTTP sources, such as a REST API
- Get properties from remote streaming sources, such as a WebSocket server
- Get properties from multiple sources in order, unordered or by mixing strategies
- Define if the properties from a source should overwrite the existing ones or to merge with them
- Get properties from sources with interdependencies
- Stop source or application loading after a trigger
- Manage the loading lifecycle with hooks
- Implement a middleware to intercept the added properties

## Getting Started

To make this library work, there are some gateways to implement. Each gateway documentation will further describe the API and examples for the most common use cases.

- [EnvironmentStore](./src/lib/application/environment-store.gateway.md): The store that manages the environment properties.
- [EnvironmentService](./src/lib/application/environment-service.gateway.md): A service to manage the environment properties. It can be used simply by extending from the abstract class.
- [EnvironmentQuery](./src/lib/application/environment-query.gateway.md): Gets the properties from the environment. It can be used simply by extending from the abstract class.
- [PropertiesSource](./src/lib/application/properties-source.gateway.md): Definition of the source from which to get environment properties asynchronously.
- [EnvironmentLoader](./src/lib/application/environment-loader.gateway.md): Loads the environment properties from the provided asynchronous sources. It can be used simply by extending from the abstract class.

A simple implementation and use in JavaScript could be something like the following code.

```js
import { createEnvironmentLoader, createEnvironmentQuery, createEnvironmentService } from '@kaikokeke/environment';
import { BehaviorSubject } from 'rxjs';

const _environment = new BehaviorSubject({});

const source1 = {
  requiredToLoad: true,
  load: () => [{ name: 'John Doe' }],
};

const source2 = {
  requiredToLoad: true,
  load: async () => fetch('env.json'), // { userName: 'JohnDoe01' }
};

const environmentStore = {
  getAll$: () => _environment.asObservable(),
  getAll: () => _environment.getValue(),
  update: (properties) => {
    _environment.next(properties);
  },
  reset: () => {
    _environment.next({});
  },
};

const environmentService = createEnvironmentService(environmentStore);
const environmentQuery = createEnvironmentQuery(environmentStore);
const environmentLoader = createEnvironmentLoader(environmentService, [source1, source2]);

environmentLoader.load().then(() => {
  console.log(environmentQuery.getAll()); // LOG { name: 'John Doe', userName: 'JohnDoe01' }
});
```

## Library structure

To facilitate the management of the different components of the library, the following structure has been created:

- [Application](./src/lib/application/README.md): The application gateways to manage the environment.
- [Helpers](./src/lib/helpers/README.md): Helper functions to manage environment properties.
- [Types](./src/lib/types/README.md): The types used in the environment library.

# Environment

Creates an environment properties store that is populated by asyncronous property sources and exposes an `EnvironmentQuery` to get the values, as well an `EnvironmentService` to modify them at run time.

The common way to manage properties in JavaScript frameworks is to define environment values in a constant or env file an load them at build stage. This strategy is not suitable for developments where, for example, the final build is deployed in a repositoy manager such as Nexus or Artifactory and reused in diferent environments, or in a microservices architecture where the properties are loaded from a config manager service.

This module addresses this gap by allowing the loading of properties from multiple asynchronous providers during the initialization phase of the application or submodule or at any point in the application life cycle.

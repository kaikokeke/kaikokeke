# Environment Service

Sets properties in the environment.

This service manages how to add, update or delete properties in the environment.

## Getting Started

You can create an environment service class by extending from `EnvironmentService`.

```ts
import { EnvironmentService, EnvironmentStore } from '@kaikokeke/environment';
import { store } from './simple-environment.store';

class SimpleEnvironmentService extends EnvironmentService {
  constructor(protected store: EnvironmentStore) {
    super(store);
  }
}

export const service: EnvironmentService = new SimpleEnvironmentService(store);
```

## API

### Exposed Methods

#### `reset(): void`

Resets the environment to the initial state.

```ts
service.reset();
```

```ts
store.getAll(); // {a:0,b:1}
service.reset();
store.getAll(); // {}
```

#### `create(path: Path, value: Property): boolean`

Creates a new property in the environment and sets the value.

```ts
service.create('a', 0);
```

Returns `true` if the property is created.

```ts
store.getAll(); // {a:0}
service.create('b', 1); // true
store.getAll(); // {a:0,b:1}
```

Returns `false` and ignores the action if the property exists.

```ts
store.getAll(); // {a:0}
service.create('a', 1); // false
store.getAll(); // {a:0}
```

Throws if the path is invalid.

#### `update(path: Path, value: Property): boolean`

Updates the value of a property in the environment.

```ts
service.update('a', 0);
```

Returns `true` if the property is updated.

```ts
store.getAll(); // {a:0}
service.update('a', 1); // true
store.getAll(); // {a:1}
```

Returns `false` and ignores the action if the property doesn't exist.

```ts
store.getAll(); // {a:0}
service.update('b', 1); // false
store.getAll(); // {a:0}
```

Throws if the path is invalid.

#### `upsert(path: Path, value: Property): void`

Updates or creates the value of a property in the environment.

```ts
service.upsert('a', 0);
```

```ts
store.getAll(); // {a:0}
service.upsert('b', 1);
store.getAll(); // {a:0,b:1}
service.upsert('b', 0);
store.getAll(); // {a:0,b:0}
```

Throws if the path is invalid.

#### `delete(path: Path): boolean`

```ts
service.delete('a');
```

Returns `true` if the property is deleted.

```ts
store.getAll(); // {a:0,b:1}
service.delete('b'); // true
store.getAll(); // {a:0}
```

Returns `false` and ignores the action if the property doesn't exist.

```ts
store.getAll(); // {a:0}
service.delete('b'); // false
store.getAll(); // {a:0}
```

Throws if the path is invalid.

#### `add(properties: Properties, path?: Path): void`

Adds properties to the environment.

```ts
service.add({ a: 0 });
```

If a path is not provided, the properties will be added at the root by overwriting the existing properties.

```ts
store.getAll(); // {a:{b:1}}
service.add({ a: { a: 0 } });
store.getAll(); // {a:{a:0}}
```

If a path is provided will be used to overwrite the existing properties.

```ts
store.getAll(); // {a:{b:1}}
service.add({ a: 0 }, 'a');
store.getAll(); // {a:{a:0}}
```

Throws if the path is invalid.

#### `merge(properties: Properties, path?: Path): void`

Adds properties to the environment using the deep merge strategy.

```ts
service.merge({ a: 0 });
```

If a path is not provided, the properties will be added at the root by merging the existing properties.

```ts
store.getAll(); // {a:{b:1}}
service.merge({ a: { a: 0 } });
store.getAll(); // {a:{a:0,b:1}}
```

If a path is provided will be used to merge the existing properties.

```ts
store.getAll(); // {a:{b:1}}
service.merge({ a: 0 }, 'a');
store.getAll(); // {a:{a:0,b:1}}
```

The deepMerge strategy also merges Array values.
See `deepMerge()` from `@kaikokeke/common`.

```ts
store.getAll(); // {a:[0]}
service.merge({ a: [1] });
store.getAll(); // {a:[0,1]}
```

Throws if the path is invalid.

## Examples of use

### Add all properties under an specific path

You can overwrite all methods to add a default value for a module or subapplication.

```ts
import { EnvironmentService, EnvironmentStore } from '@kaikokeke/environment';

class SubmoduleEnvironmentService extends EnvironmentService {
  provate readonly _pathPrefix = 'submodule';

  constructor(protected store: EnvironmentStore) {
    super(store);
  }
}
```

### Add logs if an operation fails

```ts

```

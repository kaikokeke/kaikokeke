# Environment Service

Sets properties in the environment.

This service manages how to add, update or delete properties in the environment.

## Getting Started

You can create an environment service with `TypeScript` by extending from `EnvironmentService`. This option is ideal to change or extends the service behavior, as described in the API and examples.

```ts
import { EnvironmentService, EnvironmentStore } from '@kaikokeke/environment';
import { environmentStore } from './environment.store';

class SimpleEnvironmentService extends EnvironmentService {
  constructor(protected readonly store: EnvironmentStore) {
    super(store);
  }
}

const environmentService: EnvironmentService = new SimpleEnvironmentService(environmentStore);
```

If you want to create a pure `JavaScript` implementation you can use the `createEnvironmentService(store)` function.

```js
import { createEnvironmentService } from '@kaikokeke/environment';
import { environmentStore } from './environment.store';

const environmentService = createEnvironmentService(environmentStore);
```

## API

```ts
function createEnvironmentService(store: EnvironmentStore): EnvironmentService;
```

```ts
abstract class EnvironmentService {
  constructor(protected readonly store: EnvironmentStore);
  reset(): void;
  create(path: Path, value: Property): boolean;
  update(path: Path, value: Property): boolean;
  upsert(path: Path, value: Property): void;
  delete(path: Path): boolean;
  add(properties: Properties, path?: Path): void;
  merge(properties: Properties, path?: Path): void;
}
```

### Function

#### `createEnvironmentService(store: EnvironmentStore): EnvironmentService`

Creates an environment environmentService.

```ts
createEnvironmentService(environmentStore);
```

Returns a basic EnvironmentService instance.

```ts
const environmentService: EnvironmentService = createEnvironmentService(environmentStore);
```

### Exposed Methods

#### `reset(): void`

Resets the environment to the initial state.

```ts
environmentService.reset();
```

```ts
environmentStore.getAll(); // {a:0,b:1}
environmentService.reset();
environmentStore.getAll(); // {}
```

#### `create(path: Path, value: Property): boolean`

Creates a new property in the environment and sets the value.

```ts
environmentService.create('a', 0);
```

Returns `true` if the property is created.

```ts
environmentStore.getAll(); // {a:0}
environmentService.create('b', 1); // true
environmentStore.getAll(); // {a:0,b:1}
```

Returns `false` and ignores the action if the property exists.

```ts
environmentStore.getAll(); // {a:0}
environmentService.create('a', 1); // false
environmentStore.getAll(); // {a:0}
```

Throws `InvalidPathError` if the path is invalid.

#### `update(path: Path, value: Property): boolean`

Updates the value of a property in the environment.

```ts
environmentService.update('a', 0);
```

Returns `true` if the property is updated.

```ts
environmentStore.getAll(); // {a:0}
environmentService.update('a', 1); // true
environmentStore.getAll(); // {a:1}
```

Returns `false` and ignores the action if the property doesn't exist.

```ts
environmentStore.getAll(); // {a:0}
environmentService.update('b', 1); // false
environmentStore.getAll(); // {a:0}
```

Throws `InvalidPathError` if the path is invalid.

#### `upsert(path: Path, value: Property): void`

Updates or creates the value of a property in the environment.

```ts
environmentService.upsert('a', 0);
```

```ts
environmentStore.getAll(); // {a:0}
environmentService.upsert('b', 1);
environmentStore.getAll(); // {a:0,b:1}
environmentService.upsert('b', 0);
environmentStore.getAll(); // {a:0,b:0}
```

Throws `InvalidPathError` if the path is invalid.

#### `delete(path: Path): boolean`

```ts
environmentService.delete('a');
```

Returns `true` if the property is deleted.

```ts
environmentStore.getAll(); // {a:0,b:1}
environmentService.delete('b'); // true
environmentStore.getAll(); // {a:0}
```

Returns `false` and ignores the action if the property doesn't exist.

```ts
environmentStore.getAll(); // {a:0}
environmentService.delete('b'); // false
environmentStore.getAll(); // {a:0}
```

Throws `InvalidPathError` if the path is invalid.

#### `add(properties: Properties, path?: Path): void`

Adds properties to the environment.

```ts
environmentService.add({ a: 0 });
```

If a path is not provided, the properties will be added at the root by overwriting the existing properties.

```ts
environmentStore.getAll(); // {a:{b:1}}
environmentService.add({ a: { a: 0 } });
environmentStore.getAll(); // {a:{a:0}}
```

If a path is provided will be used to overwrite the existing properties.

```ts
environmentStore.getAll(); // {a:{b:1}}
environmentService.add({ a: 0 }, 'a');
environmentStore.getAll(); // {a:{a:0}}
```

Throws `InvalidPathError` if the path is invalid.

#### `merge(properties: Properties, path?: Path): void`

Adds properties to the environment using the deep merge strategy.

```ts
environmentService.merge({ a: 0 });
```

If a path is not provided, the properties will be added at the root by merging the existing properties.

```ts
environmentStore.getAll(); // {a:{b:1}}
environmentService.merge({ a: { a: 0 } });
environmentStore.getAll(); // {a:{a:0,b:1}}
```

If a path is provided will be used to merge the existing properties.

```ts
environmentStore.getAll(); // {a:{b:1}}
environmentService.merge({ a: 0 }, 'a');
environmentStore.getAll(); // {a:{a:0,b:1}}
```

The deepMerge strategy also merges Array values.
See `deepMerge()` from `@kaikokeke/common`.

```ts
environmentStore.getAll(); // {a:[0]}
environmentService.merge({ a: [1] });
environmentStore.getAll(); // {a:[0,1]}
```

Throws `InvalidPathError` if the path is invalid.

## Examples of use

### Add all properties under an specific path

You can overwrite all methods to add a default base path for a module or subapplication.

```ts
import { Path, prefixPath } from '@environment/common';
import { EnvironmentService, EnvironmentStore, Properties, Property } from '@kaikokeke/environment';
import { environmentStore } from './environment.store';

class SubmoduleEnvironmentService extends EnvironmentService {
  private readonly _pathPrefix = 'submodule';

  constructor(protected readonly store: EnvironmentStore) {
    super(store);
  }

  create(path: Path, value: Property): boolean {
    return super.create(prefixPath(path, this._pathPrefix), value);
  }

  update(path: Path, value: Property): boolean {
    console.log(this._getPath(path));
    return super.update(this._getPath(path), value);
  }

  upsert(path: Path, value: Property): void {
    super.upsert(this._getPath(path), value);
  }

  delete(path: Path): boolean {
    return super.delete(this._getPath(path));
  }

  add(properties: Properties, path?: Path): void {
    super.add(properties, this._getPath(path));
  }

  merge(properties: Properties, path?: Path): void {
    super.merge(properties, this._getPath(path));
  }

  protected _getPath(path?: Path): Path {
    return path != null ? prefixPath(path, this._pathPrefix) : this._pathPrefix;
  }
}

const environmentService: EnvironmentService = new SubmoduleEnvironmentService(environmentStore);

environmentService.create('a.a', 1); // {submodule:{a:{a:1}}}
environmentService.update('a.a', 0); // {submodule:{a:{a:0}}}
environmentService.upsert('a.a', 2); // {submodule:{a:{a:2}}}
environmentService.delete('a.a'); // {submodule:{a:{}}}
environmentService.add({ a: { a: 0 } }); // {submodule:{a:{a:0}}}
environmentService.merge({ a: { b: 0 } }); // {submodule:{a:{a:0,b:0}}}
```

### Add logs to operations

Sometimes is needed to add logs for the different operations.

```ts
import { Path, pathAsString } from '@environment/common';
import { EnvironmentService, EnvironmentStore, Properties, Property } from '@kaikokeke/environment';
import { environmentStore } from './environment.store';

class LoggedEnvironmentService extends EnvironmentService {
  constructor(protected readonly store: EnvironmentStore) {
    super(store);
  }

  reset(): void {
    this._log('reset');
    super.reset();
  }

  create(path: Path, value: Property): boolean {
    const result: boolean = super.create(path, value);

    if (result) {
      this._log('create', path, value);
    } else {
      console.info(`environment create: the path "${pathAsString(path)}" constains a value`);
    }

    return result;
  }

  update(path: Path, value: Property): boolean {
    const result: boolean = super.update(path, value);

    if (result) {
      this._log('update', path, value);
    } else {
      console.info(`environment update: the path "${pathAsString(path)}" doesn't constain a value`);
    }

    return result;
  }

  upsert(path: Path, value: Property): void {
    this._log('upsert', path, value);
    super.upsert(path, value);
  }

  delete(path: Path): boolean {
    const result: boolean = super.delete(path);

    if (result) {
      this._log('delete', path);
    } else {
      console.info(`environment delete: the path "${pathAsString(path)}" doesn't constain a value`);
    }

    return result;
  }

  add(properties: Properties, path?: Path): void {
    this._log('add', properties, path);
    super.add(properties, path);
  }

  merge(properties: Properties, path?: Path): void {
    this._log('merge', properties, path);
    super.merge(properties, path);
  }

  protected _log(method: string, ...args: unknown[]): void {
    console.log(`environment ${method}`, ...args);
  }
}

const environmentService: EnvironmentService = new LoggedEnvironmentService(environmentStore);

environmentService.reset(); // Log 'environment reset'
environmentService.create('b', 1); // Log 'environment create', 'b', 1
environmentService.create('b', 0); // Info 'environment create: the path "b" constains a value'
environmentService.update('b', 0); // Log 'environment update', 'b', 0
environmentService.update('a', 0); // Info `environment update: the path "a" doesn't constain a value`
environmentService.upsert('b', 2); // Log 'environment upsert', 'b', 2
environmentService.delete('b'); // Log 'environment delete', 'b'
environmentService.delete('a'); // Info `environment delete: the path "a" doesn't constain a value`
environmentService.add({ a: 0 }, 'a'); // Log 'environment add', { a: 0 }, 'a'
environmentService.merge({ a: 0 }, 'a'); // Log 'environment merge', { a: 0 }, 'a'
```

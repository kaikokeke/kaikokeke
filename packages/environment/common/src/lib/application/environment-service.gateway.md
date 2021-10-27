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

Throws `InvalidPathError` if the path is invalid.

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

Throws `InvalidPathError` if the path is invalid.

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

Throws `InvalidPathError` if the path is invalid.

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

Throws `InvalidPathError` if the path is invalid.

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

Throws `InvalidPathError` if the path is invalid.

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

Throws `InvalidPathError` if the path is invalid.

## Examples of use

### Add all properties under an specific path

You can overwrite all methods to add a default base path for a module or subapplication.

```ts
import { Path, prefixPath } from '@environment/common';
import { EnvironmentService, EnvironmentStore, Properties, Property } from '@kaikokeke/environment';
import { store } from './simple-environment.store';

class SubmoduleEnvironmentService extends EnvironmentService {
  private readonly _pathPrefix = 'submodule';

  constructor(protected store: EnvironmentStore) {
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

const service: EnvironmentService = new SubmoduleEnvironmentService(store);

service.create('a.a', 1); // {submodule:{a:{a:1}}}
service.update('a.a', 0); // {submodule:{a:{a:0}}}
service.upsert('a.a', 2); // {submodule:{a:{a:2}}}
service.delete('a.a'); // {submodule:{a:{}}}
service.add({ a: { a: 0 } }); // {submodule:{a:{a:0}}}
service.merge({ a: { b: 0 } }); // {submodule:{a:{a:0,b:0}}}
```

### Add logs to operations

Sometimes is needed to add logs for the different operations.

```ts
import { Path, pathAsString } from '@environment/common';
import { EnvironmentService, EnvironmentStore, Properties, Property } from '@kaikokeke/environment';
import { store } from './simple-environment.store';

class LoggedEnvironmentService extends EnvironmentService {
  constructor(protected store: EnvironmentStore) {
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

const service: EnvironmentService = new LoggedEnvironmentService(store);

service.reset(); // Log 'environment reset'
service.create('b', 1); // Log 'environment create', 'b', 1
service.create('b', 0); // Info 'environment create: the path "b" constains a value'
service.update('b', 0); // Log 'environment update', 'b', 0
service.update('a', 0); // Info `environment update: the path "a" doesn't constain a value`
service.upsert('b', 2); // Log 'environment upsert', 'b', 2
service.delete('b'); // Log 'environment delete', 'b'
service.delete('a'); // Info `environment delete: the path "a" doesn't constain a value`
service.add({ a: 0 }, 'a'); // Log 'environment add', { a: 0 }, 'a'
service.merge({ a: 0 }, 'a'); // Log 'environment merge', { a: 0 }, 'a'
```

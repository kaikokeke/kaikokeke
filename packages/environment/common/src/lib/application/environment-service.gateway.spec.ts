import { Path, pathAsString, prefixPath } from '@kaikokeke/common';
import { Observable } from 'rxjs';

import { Properties, Property } from '../types';
import { EnvironmentService } from './environment-service.gateway';
import { EnvironmentStore } from './environment-store.gateway';

class TestStore extends EnvironmentStore {
  getAll$(): Observable<Properties> {
    throw new Error('Method not implemented.');
  }
  getAll(): Properties {
    throw new Error('Method not implemented.');
  }
  update(properties: Properties): void {
    throw new Error('Method not implemented.');
  }
  reset(): void {
    throw new Error('Method not implemented.');
  }
}

class TestEnvironmentService extends EnvironmentService {
  constructor(protected store: EnvironmentStore) {
    super(store);
  }
}

describe('EnvironmentService', () => {
  let store: EnvironmentStore;
  let service: EnvironmentService;

  beforeEach(() => {
    store = new TestStore();
    service = new TestEnvironmentService(store);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it(`.store is an EnvironmentStore`, () => {
    expect(service['store']).toBeInstanceOf(EnvironmentStore);
  });

  it(`reset() resets the environment to the initial state`, () => {
    jest.spyOn(store, 'reset').mockImplementation(() => null);
    expect(store.reset).not.toHaveBeenCalled();
    service.reset();
    expect(store.reset).toHaveBeenCalledTimes(1);
  });

  it(`create(path, value) returns true if the property is created`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue({ a: { b: 0 }, b: 0 });
    jest.spyOn(store, 'update').mockImplementation(() => null);
    expect(service.create('a.a', 1)).toBeTrue();
  });

  it(`create(path, value) creates a new property in the environment and sets the value`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue({ a: { b: 0 }, b: 0 });
    jest.spyOn(store, 'update').mockImplementation(() => null);
    expect(store.update).not.toHaveBeenCalled();
    service.create('a.a', 1);
    expect(store.update).toHaveBeenNthCalledWith(1, { a: { a: 1, b: 0 }, b: 0 });
    expect(store.update).toHaveBeenCalledTimes(1);
  });

  it(`create(path, value) returns false if the property exists`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue({ a: null });
    jest.spyOn(store, 'update').mockImplementation(() => null);
    expect(service.create('a', 1)).toBeFalse();
  });

  it(`create(path, value) ignores the action if the property exists`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue({ a: null });
    jest.spyOn(store, 'update').mockImplementation(() => null);
    expect(store.update).not.toHaveBeenCalled();
    service.create('a', 1);
    expect(store.update).not.toHaveBeenCalled();
  });

  it(`create(path, value) throws if the path is invalid`, () => {
    expect(() => service.create('', 1)).toThrowError('The path "" is invalid');
  });

  it(`update(path, value) returns true if the property is updated`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue({ a: { b: null }, b: 0 });
    jest.spyOn(store, 'update').mockImplementation(() => null);
    expect(service.update('a.b', 1)).toBeTrue();
  });

  it(`update(path, value) updates the value of a property in the environment`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue({ a: { b: null }, b: 0 });
    jest.spyOn(store, 'update').mockImplementation(() => null);
    expect(store.update).not.toHaveBeenCalled();
    service.update('a.b', 1);
    expect(store.update).toHaveBeenNthCalledWith(1, { a: { b: 1 }, b: 0 });
    expect(store.update).toHaveBeenCalledTimes(1);
  });

  it(`update(path, value) returns false if the property doesn't exist`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue({ a: null });
    jest.spyOn(store, 'update').mockImplementation(() => null);
    expect(service.update('a.b', 1)).toBeFalse();
  });

  it(`update(path, value) ignores the action if the property doesn't exist`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue({ a: null });
    jest.spyOn(store, 'update').mockImplementation(() => null);
    expect(store.update).not.toHaveBeenCalled();
    service.update('a.b', 1);
    expect(store.update).not.toHaveBeenCalled();
  });

  it(`update(path, value) throws if the path is invalid`, () => {
    expect(() => service.update('', 1)).toThrowError('The path "" is invalid');
  });

  it(`upsert(path, value) creates the value of a property in the environment`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue({ a: { b: 0 }, b: 0 });
    jest.spyOn(store, 'update').mockImplementation(() => null);
    expect(store.update).not.toHaveBeenCalled();
    service.upsert('a.a', 1);
    expect(store.update).toHaveBeenNthCalledWith(1, { a: { a: 1, b: 0 }, b: 0 });
    expect(store.update).toHaveBeenCalledTimes(1);
  });

  it(`upsert(path, value) updates the value of a property in the environment`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue({ a: { b: null }, b: 0 });
    jest.spyOn(store, 'update').mockImplementation(() => null);
    expect(store.update).not.toHaveBeenCalled();
    service.upsert('a.b', 1);
    expect(store.update).toHaveBeenNthCalledWith(1, { a: { b: 1 }, b: 0 });
    expect(store.update).toHaveBeenCalledTimes(1);
  });

  it(`upsert(path, value) throws if the path is invalid`, () => {
    expect(() => service.upsert('', 1)).toThrowError('The path "" is invalid');
  });

  it(`delete(path, value) returns true if the property is deleted`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue({ a: { b: null }, b: 0 });
    jest.spyOn(store, 'update').mockImplementation(() => null);
    expect(service.delete('a.b')).toBeTrue();
  });

  it(`delete(path) deletes a property from the environment.`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue({ a: { b: null }, b: 0 });
    jest.spyOn(store, 'update').mockImplementation(() => null);
    expect(store.update).not.toHaveBeenCalled();
    service.delete('a.b');
    expect(store.update).toHaveBeenNthCalledWith(1, { a: {}, b: 0 });
    expect(store.update).toHaveBeenCalledTimes(1);
  });

  it(`delete(path, value) returns false if the property doesn't exist`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue({ a: { b: null }, b: 0 });
    jest.spyOn(store, 'update').mockImplementation(() => null);
    expect(service.delete('a.c')).toBeFalse();
  });

  it(`delete(path) throws if the path is invalid`, () => {
    expect(() => service.delete('')).toThrowError('The path "" is invalid');
  });

  it(`add(properties) adds properties to the environment`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue({ a: [0], b: { b: 0 } });
    jest.spyOn(store, 'update').mockImplementation(() => null);
    expect(store.update).not.toHaveBeenCalled();
    service.add({ a: [1], b: { a: 0 } });
    expect(store.update).toHaveBeenNthCalledWith(1, { a: [1], b: { a: 0 } });
    expect(store.update).toHaveBeenCalledTimes(1);
  });

  it(`add(properties, path) adds properties at path to the environment`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue({ a: { b: 0, c: 1 } });
    jest.spyOn(store, 'update').mockImplementation(() => null);
    expect(store.update).not.toHaveBeenCalled();
    service.add({ a: 0 }, 'a.c');
    expect(store.update).toHaveBeenNthCalledWith(1, { a: { b: 0, c: { a: 0 } } });
    expect(store.update).toHaveBeenCalledTimes(1);
  });

  it(`add(properties, path) throws if the path is invalid`, () => {
    expect(() => service.add({ a: { a: 0 } }, '')).toThrowError('The path "" is invalid');
  });

  it(`merge(properties) adds properties to the environment using the deep merge strategy`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue({ a: [0], b: { b: 0 } });
    jest.spyOn(store, 'update').mockImplementation(() => null);
    expect(store.update).not.toHaveBeenCalled();
    service.merge({ a: [1], b: { a: 0 } });
    expect(store.update).toHaveBeenNthCalledWith(1, { a: [0, 1], b: { a: 0, b: 0 } });
    expect(store.update).toHaveBeenCalledTimes(1);
  });

  it(`merge(properties, path) adds properties at path to the environment using the deep merge strategy`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue({ b: { b: 0 } });
    jest.spyOn(store, 'update').mockImplementation(() => null);
    expect(store.update).not.toHaveBeenCalled();
    service.merge({ a: 0 }, 'b');
    expect(store.update).toHaveBeenNthCalledWith(1, { b: { a: 0, b: 0 } });
    expect(store.update).toHaveBeenCalledTimes(1);
  });

  it(`merge(properties, path) throws if the path is invalid`, () => {
    expect(() => service.merge({ a: { a: 0 } }, '')).toThrowError('The path "" is invalid');
  });

  describe('examples of use', () => {
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

    it(`add all properties under an specific path`, () => {
      const submoduleService: EnvironmentService = new SubmoduleEnvironmentService(store);
      jest
        .spyOn(store, 'getAll')
        .mockReturnValueOnce({})
        .mockReturnValueOnce({ submodule: { a: { a: 1 } } })
        .mockReturnValueOnce({ submodule: { a: { a: 0 } } })
        .mockReturnValueOnce({ submodule: { a: { a: 2 } } })
        .mockReturnValueOnce({ submodule: { a: {} } })
        .mockReturnValueOnce({ submodule: { a: { a: 0 } } });
      jest.spyOn(store, 'update').mockImplementation(() => null);
      expect(submoduleService.create('a.a', 1)).toBeTrue();
      expect(store.update).toHaveBeenNthCalledWith(1, { submodule: { a: { a: 1 } } });
      expect(submoduleService.update('a.a', 0)).toBeTrue();
      expect(store.update).toHaveBeenNthCalledWith(2, { submodule: { a: { a: 0 } } });
      submoduleService.upsert('a.a', 2);
      expect(store.update).toHaveBeenNthCalledWith(3, { submodule: { a: { a: 2 } } });
      expect(submoduleService.delete('a.a')).toBeTrue();
      expect(store.update).toHaveBeenNthCalledWith(4, { submodule: { a: {} } });
      submoduleService.add({ a: { a: 0 } });
      expect(store.update).toHaveBeenNthCalledWith(5, { submodule: { a: { a: 0 } } });
      submoduleService.merge({ a: { b: 0 } });
      expect(store.update).toHaveBeenNthCalledWith(6, { submodule: { a: { a: 0, b: 0 } } });
    });

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

    it(`add logs to operations`, () => {
      const loggedService: EnvironmentService = new LoggedEnvironmentService(store);
      jest.spyOn(store, 'getAll').mockReturnValue({ a: 0 });
      jest.spyOn(store, 'reset').mockImplementation(() => null);
      jest.spyOn(store, 'update').mockImplementation(() => null);
      jest.spyOn(console, 'log').mockImplementation(() => null);
      jest.spyOn(console, 'info').mockImplementation(() => null);
      loggedService.reset();
      expect(console.log).toHaveBeenNthCalledWith(1, 'environment reset');
      loggedService.create('b', 1);
      expect(console.log).toHaveBeenNthCalledWith(2, 'environment create', 'b', 1);
      loggedService.create('a', 1);
      expect(console.info).toHaveBeenNthCalledWith(1, 'environment create: the path "a" constains a value');
      loggedService.update('a', 1);
      expect(console.log).toHaveBeenNthCalledWith(3, 'environment update', 'a', 1);
      loggedService.update('b', 1);
      expect(console.info).toHaveBeenNthCalledWith(2, `environment update: the path "b" doesn't constain a value`);
      loggedService.upsert('a', 2);
      expect(console.log).toHaveBeenNthCalledWith(4, 'environment upsert', 'a', 2);
      loggedService.delete('a');
      expect(console.log).toHaveBeenNthCalledWith(5, 'environment delete', 'a');
      loggedService.delete('b');
      expect(console.info).toHaveBeenNthCalledWith(3, `environment delete: the path "b" doesn't constain a value`);
      loggedService.add({ a: 0 }, 'a');
      expect(console.log).toHaveBeenNthCalledWith(6, 'environment add', { a: 0 }, 'a');
      loggedService.merge({ a: 0 }, 'a');
      expect(console.log).toHaveBeenNthCalledWith(7, 'environment merge', { a: 0 }, 'a');
    });
  });
});

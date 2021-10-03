import { Observable } from 'rxjs';

import { Properties } from '../types';
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

  it(`create(path, value) creates a new property in the environment and sets the value.`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue({ a: { b: 0 }, b: 0 });
    jest.spyOn(store, 'update').mockImplementation(() => null);
    expect(store.update).not.toHaveBeenCalled();
    service.create('a.a', 1);
    expect(store.update).toHaveBeenNthCalledWith(1, { a: { a: 1, b: 0 }, b: 0 });
    expect(store.update).toHaveBeenCalledTimes(1);
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

  it(`update(path, value) updates the value of a property in the environment`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue({ a: { b: null }, b: 0 });
    jest.spyOn(store, 'update').mockImplementation(() => null);
    expect(store.update).not.toHaveBeenCalled();
    service.update('a.b', 1);
    expect(store.update).toHaveBeenNthCalledWith(1, { a: { b: 1 }, b: 0 });
    expect(store.update).toHaveBeenCalledTimes(1);
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

  it(`delete(path) deletes a property from the environment.`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue({ a: { b: null }, b: 0 });
    jest.spyOn(store, 'update').mockImplementation(() => null);
    expect(store.update).not.toHaveBeenCalled();
    service.delete('a.b');
    expect(store.update).toHaveBeenNthCalledWith(1, { a: {}, b: 0 });
    expect(store.update).toHaveBeenCalledTimes(1);
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

  it(`add(properties, path) adds properties to the environment if invalid path`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue({ a: { b: 0 } });
    jest.spyOn(store, 'update').mockImplementation(() => null);
    expect(store.update).not.toHaveBeenCalled();
    service.add({ a: { a: 0 } }, '');
    expect(store.update).toHaveBeenNthCalledWith(1, { a: { a: 0 } });
    expect(store.update).toHaveBeenCalledTimes(1);
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

  it(`merge(properties, path) adds properties to the environment using the deep merge strategy if invalid path`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue({ a: { b: 0 } });
    jest.spyOn(store, 'update').mockImplementation(() => null);
    expect(store.update).not.toHaveBeenCalled();
    service.merge({ a: { a: 0 } }, '');
    expect(store.update).toHaveBeenNthCalledWith(1, { a: { a: 0, b: 0 } });
    expect(store.update).toHaveBeenCalledTimes(1);
  });
});

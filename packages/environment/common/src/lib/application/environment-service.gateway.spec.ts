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

  it(`reset() resets the store`, () => {
    jest.spyOn(store, 'reset').mockImplementation(() => null);
    expect(store.reset).not.toHaveBeenCalled();
    service.reset();
    expect(store.reset).toHaveBeenCalledTimes(1);
  });

  it(`create(path, value) sets the path value if the environment path is undefined`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue({ a: { b: 0 }, b: 0 });
    jest.spyOn(store, 'update').mockImplementation(() => null);
    expect(store.update).not.toHaveBeenCalled();
    service.create('a.a', 1);
    expect(store.update).toHaveBeenNthCalledWith(1, { a: { a: 1, b: 0 }, b: 0 });
    expect(store.update).toHaveBeenCalledTimes(1);
  });

  it(`create(path, value) does nothing if the environment path value is not undefined`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue({ a: null });
    jest.spyOn(store, 'update').mockImplementation(() => null);
    expect(store.update).not.toHaveBeenCalled();
    service.create('a', 1);
    expect(store.update).not.toHaveBeenCalled();
  });

  it(`create(path, value) throws error if the path is invalid`, () => {
    expect(() => service.create('', 1)).toThrowError('The path "" is invalid');
  });

  it(`update(path, value) sets the path value if the environment path is not undefined`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue({ a: { b: null }, b: 0 });
    jest.spyOn(store, 'update').mockImplementation(() => null);
    expect(store.update).not.toHaveBeenCalled();
    service.update('a.b', 1);
    expect(store.update).toHaveBeenNthCalledWith(1, { a: { b: 1 }, b: 0 });
    expect(store.update).toHaveBeenCalledTimes(1);
  });

  it(`update(path, value) does nothing if the environment path value is undefined`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue({ a: null });
    jest.spyOn(store, 'update').mockImplementation(() => null);
    expect(store.update).not.toHaveBeenCalled();
    service.update('a.b', 1);
    expect(store.update).not.toHaveBeenCalled();
  });

  it(`update(path, value) throws error if the path is invalid`, () => {
    expect(() => service.update('', 1)).toThrowError('The path "" is invalid');
  });

  it(`upsert(path, value) sets the path value if the environment path is undefined`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue({ a: { b: 0 }, b: 0 });
    jest.spyOn(store, 'update').mockImplementation(() => null);
    expect(store.update).not.toHaveBeenCalled();
    service.upsert('a.a', 1);
    expect(store.update).toHaveBeenNthCalledWith(1, { a: { a: 1, b: 0 }, b: 0 });
    expect(store.update).toHaveBeenCalledTimes(1);
  });

  it(`upsert(path, value) sets the path value if the environment path is not undefined`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue({ a: { b: null }, b: 0 });
    jest.spyOn(store, 'update').mockImplementation(() => null);
    expect(store.update).not.toHaveBeenCalled();
    service.upsert('a.b', 1);
    expect(store.update).toHaveBeenNthCalledWith(1, { a: { b: 1 }, b: 0 });
    expect(store.update).toHaveBeenCalledTimes(1);
  });

  it(`upsert(path, value) throws error if the path is invalid`, () => {
    expect(() => service.upsert('', 1)).toThrowError('The path "" is invalid');
  });

  it(`delete(path) deletes the value at path`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue({ a: { b: null }, b: 0 });
    jest.spyOn(store, 'update').mockImplementation(() => null);
    expect(store.update).not.toHaveBeenCalled();
    service.delete('a.b');
    expect(store.update).toHaveBeenNthCalledWith(1, { a: {}, b: 0 });
    expect(store.update).toHaveBeenCalledTimes(1);
  });

  it(`delete(path) throws error if the path is invalid`, () => {
    expect(() => service.delete('')).toThrowError('The path "" is invalid');
  });

  it(`merge(properties) sets the new properties using the merge strategy`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue({ a: [0], b: { b: 0 } });
    jest.spyOn(store, 'update').mockImplementation(() => null);
    expect(store.update).not.toHaveBeenCalled();
    service.merge({ a: [1], b: { a: 0 } });
    expect(store.update).toHaveBeenNthCalledWith(1, { a: [1], b: { a: 0 } });
    expect(store.update).toHaveBeenCalledTimes(1);
  });

  it(`merge(properties, path) sets the new properties at path using the merge strategy`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue({ a: { b: 0, c: 1 } });
    jest.spyOn(store, 'update').mockImplementation(() => null);
    expect(store.update).not.toHaveBeenCalled();
    service.merge({ a: 0 }, 'a.c');
    expect(store.update).toHaveBeenNthCalledWith(1, { a: { b: 0, c: { a: 0 } } });
    expect(store.update).toHaveBeenCalledTimes(1);
  });

  it(`merge(properties, path) sets the new properties using the merge strategy if path is invalid`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue({ a: { b: 0 } });
    jest.spyOn(store, 'update').mockImplementation(() => null);
    expect(store.update).not.toHaveBeenCalled();
    service.merge({ a: { a: 0 } }, '');
    expect(store.update).toHaveBeenNthCalledWith(1, { a: { a: 0 } });
    expect(store.update).toHaveBeenCalledTimes(1);
  });

  it(`deepMerge(properties) sets the new properties using the deep merge strategy`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue({ a: [0], b: { b: 0 } });
    jest.spyOn(store, 'update').mockImplementation(() => null);
    expect(store.update).not.toHaveBeenCalled();
    service.deepMerge({ a: [1], b: { a: 0 } });
    expect(store.update).toHaveBeenNthCalledWith(1, { a: [0, 1], b: { a: 0, b: 0 } });
    expect(store.update).toHaveBeenCalledTimes(1);
  });

  it(`deepMerge(properties, path) sets the new properties at path using the deep merge strategy`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue({ b: { b: 0 } });
    jest.spyOn(store, 'update').mockImplementation(() => null);
    expect(store.update).not.toHaveBeenCalled();
    service.deepMerge({ a: 0 }, 'b');
    expect(store.update).toHaveBeenNthCalledWith(1, { b: { a: 0, b: 0 } });
    expect(store.update).toHaveBeenCalledTimes(1);
  });

  it(`deepMerge(properties, path) sets the new properties using the deep merge strategy if path is invalid`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue({ a: { b: 0 } });
    jest.spyOn(store, 'update').mockImplementation(() => null);
    expect(store.update).not.toHaveBeenCalled();
    service.deepMerge({ a: { a: 0 } }, '');
    expect(store.update).toHaveBeenNthCalledWith(1, { a: { a: 0, b: 0 } });
    expect(store.update).toHaveBeenCalledTimes(1);
  });
});

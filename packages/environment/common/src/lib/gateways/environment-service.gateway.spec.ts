import { Observable, of } from 'rxjs';

import { Properties } from '../types';
import { EnvironmentServiceGateway } from './environment-service.gateway';
import { EnvironmentStoreGateway } from './environment-store.gateway';

/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
class TestStore extends EnvironmentStoreGateway {
  getAll(): Properties {
    return {};
  }
  getAll$(): Observable<Properties> {
    return of({});
  }
  update(properties: Properties): void {}
  reset(): void {}
}

class TestEnvironmentService extends EnvironmentServiceGateway {
  constructor(protected readonly store: EnvironmentStoreGateway) {
    super(store);
  }
}

describe('EnvironmentServiceGateway', () => {
  let store: EnvironmentStoreGateway;
  let service: EnvironmentServiceGateway;

  beforeEach(() => {
    store = new TestStore();
    service = new TestEnvironmentService(store);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it(`.store is an EnvironmentStoreGateway`, () => {
    expect(service['store']).toBeInstanceOf(EnvironmentStoreGateway);
  });

  it(`reset() resets the store`, () => {
    jest.spyOn(store, 'reset');
    expect(store.reset).not.toHaveBeenCalled();
    service.reset();
    expect(store.reset).toHaveBeenCalledTimes(1);
  });

  it(`create(path, value) sets the path value if the environment path is undefined`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue({ a: { b: 0 }, b: 0 });
    jest.spyOn(store, 'update');
    expect(store.update).not.toHaveBeenCalled();
    service.create('a.a', 1);
    expect(store.update).toHaveBeenNthCalledWith(1, { a: { a: 1, b: 0 }, b: 0 });
  });

  it(`create(path, value) does nothing if the environment path value is not undefined`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue({ a: null });
    jest.spyOn(store, 'update');
    expect(store.update).not.toHaveBeenCalled();
    service.create('a', 1);
    expect(store.update).not.toHaveBeenCalled();
  });

  it(`create(path, value) does nothing if the path is invalid`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue({});
    jest.spyOn(store, 'update');
    expect(store.update).not.toHaveBeenCalled();
    service.create('', 1);
    expect(store.update).not.toHaveBeenCalled();
  });

  it(`update(path, value) sets the path value if the environment path is not undefined`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue({ a: { b: null }, b: 0 });
    jest.spyOn(store, 'update');
    expect(store.update).not.toHaveBeenCalled();
    service.update('a.b', 1);
    expect(store.update).toHaveBeenNthCalledWith(1, { a: { b: 1 }, b: 0 });
  });

  it(`update(path, value) does nothing if the environment path value is undefined`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue({ a: null });
    jest.spyOn(store, 'update');
    expect(store.update).not.toHaveBeenCalled();
    service.update('a.b', 1);
    expect(store.update).not.toHaveBeenCalled();
  });

  it(`update(path, value) does nothing if the path is invalid`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue({ a: null });
    jest.spyOn(store, 'update');
    expect(store.update).not.toHaveBeenCalled();
    service.update('', 1);
    expect(store.update).not.toHaveBeenCalled();
  });

  it(`upsert(path, value) sets the path value if the environment path is undefined`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue({ a: { b: 0 }, b: 0 });
    jest.spyOn(store, 'update');
    expect(store.update).not.toHaveBeenCalled();
    service.upsert('a.a', 1);
    expect(store.update).toHaveBeenNthCalledWith(1, { a: { a: 1, b: 0 }, b: 0 });
  });

  it(`upsert(path, value) sets the path value if the environment path is not undefined`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue({ a: { b: null }, b: 0 });
    jest.spyOn(store, 'update');
    expect(store.update).not.toHaveBeenCalled();
    service.upsert('a.b', 1);
    expect(store.update).toHaveBeenNthCalledWith(1, { a: { b: 1 }, b: 0 });
  });

  it(`upsert(path, value) does nothing if the path is invalid`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue({ a: null });
    jest.spyOn(store, 'update');
    expect(store.update).not.toHaveBeenCalled();
    service.upsert('', 1);
    expect(store.update).not.toHaveBeenCalled();
  });

  it(`merge(properties) sets the new properties using the merge strategy`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue({ a: [0], b: { b: 0 } });
    jest.spyOn(store, 'update');
    expect(store.update).not.toHaveBeenCalled();
    service.merge({ a: [1], b: { a: 0 } });
    expect(store.update).toHaveBeenNthCalledWith(1, { a: [1], b: { a: 0 } });
  });

  it(`merge(properties, path) sets the new properties at path using the merge strategy`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue({ b: { b: 0 } });
    jest.spyOn(store, 'update');
    expect(store.update).not.toHaveBeenCalled();
    service.merge({ a: 0 }, 'b');
    expect(store.update).toHaveBeenNthCalledWith(1, { b: { a: 0 } });
  });

  it(`merge(properties, path) sets the new properties using the merge strategy if path is invalid`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue({ a: { b: 0 } });
    jest.spyOn(store, 'update');
    expect(store.update).not.toHaveBeenCalled();
    service.merge({ a: { a: 0 } }, '');
    expect(store.update).toHaveBeenNthCalledWith(1, { a: { a: 0 } });
  });

  it(`deepMerge(properties) sets the new properties using the deep merge strategy`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue({ a: [0], b: { b: 0 } });
    jest.spyOn(store, 'update');
    expect(store.update).not.toHaveBeenCalled();
    service.deepMerge({ a: [1], b: { a: 0 } });
    expect(store.update).toHaveBeenNthCalledWith(1, { a: [0, 1], b: { a: 0, b: 0 } });
  });

  it(`deepMerge(properties, path) sets the new properties at path using the deep merge strategy`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue({ b: { b: 0 } });
    jest.spyOn(store, 'update');
    expect(store.update).not.toHaveBeenCalled();
    service.deepMerge({ a: 0 }, 'b');
    expect(store.update).toHaveBeenNthCalledWith(1, { b: { a: 0, b: 0 } });
  });

  it(`deepMerge(properties, path) sets the new properties using the deep merge strategy if path is invalid`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue({ a: { b: 0 } });
    jest.spyOn(store, 'update');
    expect(store.update).not.toHaveBeenCalled();
    service.deepMerge({ a: { a: 0 } }, '');
    expect(store.update).toHaveBeenNthCalledWith(1, { a: { a: 0, b: 0 } });
  });
});

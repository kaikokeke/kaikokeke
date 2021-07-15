import { Properties, PropertyStore } from '../types';
import { EnvironmentService } from './environment.service';

class TestStore implements PropertyStore {
  getProperties(): Properties {
    return {};
  }

  updateProperties(newProperties: Properties): void {
    // any
  }
}

class TestEnvironmentService extends EnvironmentService {
  constructor(protected readonly store: TestStore) {
    super(store);
  }
}

describe('EnvironmentService', () => {
  let service: EnvironmentService;
  let store: PropertyStore;

  beforeEach(() => {
    store = new TestStore();
    service = new TestEnvironmentService(store);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it(`create(path, value) sets the path value if the environment path is undefined`, () => {
    jest.spyOn(store, 'getProperties').mockReturnValue({ a: { b: 0 }, b: 0 });
    jest.spyOn(store, 'updateProperties');
    expect(store.updateProperties).not.toHaveBeenCalled();
    service.create('a.a', 1);
    expect(store.updateProperties).toHaveBeenNthCalledWith(1, { a: { a: 1, b: 0 }, b: 0 });
  });

  it(`create(path, value) does nothing if the environment path value is not undefined`, () => {
    jest.spyOn(store, 'getProperties').mockReturnValue({ a: null });
    jest.spyOn(store, 'updateProperties');
    expect(store.updateProperties).not.toHaveBeenCalled();
    service.create('a', 1);
    expect(store.updateProperties).not.toHaveBeenCalled();
  });

  it(`create(path, value) does nothing if the path is invalid`, () => {
    jest.spyOn(store, 'getProperties').mockReturnValue({});
    jest.spyOn(store, 'updateProperties');
    expect(store.updateProperties).not.toHaveBeenCalled();
    service.create('', 1);
    expect(store.updateProperties).not.toHaveBeenCalled();
  });

  it(`update(path, value) sets the path value if the environment path is not undefined`, () => {
    jest.spyOn(store, 'getProperties').mockReturnValue({ a: { b: null }, b: 0 });
    jest.spyOn(store, 'updateProperties');
    expect(store.updateProperties).not.toHaveBeenCalled();
    service.update('a.b', 1);
    expect(store.updateProperties).toHaveBeenNthCalledWith(1, { a: { b: 1 }, b: 0 });
  });

  it(`update(path, value) does nothing if the environment path value is undefined`, () => {
    jest.spyOn(store, 'getProperties').mockReturnValue({ a: null });
    jest.spyOn(store, 'updateProperties');
    expect(store.updateProperties).not.toHaveBeenCalled();
    service.update('a.b', 1);
    expect(store.updateProperties).not.toHaveBeenCalled();
  });

  it(`update(path, value) does nothing if the path is invalid`, () => {
    jest.spyOn(store, 'getProperties').mockReturnValue({ a: null });
    jest.spyOn(store, 'updateProperties');
    expect(store.updateProperties).not.toHaveBeenCalled();
    service.update('', 1);
    expect(store.updateProperties).not.toHaveBeenCalled();
  });

  it(`upsert(path, value) sets the path value if the environment path is undefined`, () => {
    jest.spyOn(store, 'getProperties').mockReturnValue({ a: { b: 0 }, b: 0 });
    jest.spyOn(store, 'updateProperties');
    expect(store.updateProperties).not.toHaveBeenCalled();
    service.upsert('a.a', 1);
    expect(store.updateProperties).toHaveBeenNthCalledWith(1, { a: { a: 1, b: 0 }, b: 0 });
  });

  it(`upsert(path, value) sets the path value if the environment path is not undefined`, () => {
    jest.spyOn(store, 'getProperties').mockReturnValue({ a: { b: null }, b: 0 });
    jest.spyOn(store, 'updateProperties');
    expect(store.updateProperties).not.toHaveBeenCalled();
    service.upsert('a.b', 1);
    expect(store.updateProperties).toHaveBeenNthCalledWith(1, { a: { b: 1 }, b: 0 });
  });

  it(`upsert(path, value) does nothing if the path is invalid`, () => {
    jest.spyOn(store, 'getProperties').mockReturnValue({ a: null });
    jest.spyOn(store, 'updateProperties');
    expect(store.updateProperties).not.toHaveBeenCalled();
    service.upsert('', 1);
    expect(store.updateProperties).not.toHaveBeenCalled();
  });

  it(`merge(properties) sets the new properties using the merge strategy`, () => {
    jest.spyOn(store, 'getProperties').mockReturnValue({ a: [0], b: { b: 0 } });
    jest.spyOn(store, 'updateProperties');
    expect(store.updateProperties).not.toHaveBeenCalled();
    service.merge({ a: [1], b: { a: 0 } });
    expect(store.updateProperties).toHaveBeenNthCalledWith(1, { a: [0, 1], b: { a: 0, b: 0 } });
  });

  it(`merge(properties, path) sets the new properties at path using the merge strategy`, () => {
    jest.spyOn(store, 'getProperties').mockReturnValue({ b: { b: 0 } });
    jest.spyOn(store, 'updateProperties');
    expect(store.updateProperties).not.toHaveBeenCalled();
    service.merge({ a: 0 }, 'b');
    expect(store.updateProperties).toHaveBeenNthCalledWith(1, { b: { a: 0, b: 0 } });
  });

  it(`merge(properties, path) sets the new properties using the merge strategy if path is invalid`, () => {
    jest.spyOn(store, 'getProperties').mockReturnValue({ a: { b: 0 } });
    jest.spyOn(store, 'updateProperties');
    expect(store.updateProperties).not.toHaveBeenCalled();
    service.merge({ a: { a: 0 } }, '');
    expect(store.updateProperties).toHaveBeenNthCalledWith(1, { a: { a: 0, b: 0 } });
  });

  it(`overwrite(properties) sets the new properties using the overwrite strategy`, () => {
    jest.spyOn(store, 'getProperties').mockReturnValue({ a: [0], b: { b: 0 } });
    jest.spyOn(store, 'updateProperties');
    expect(store.updateProperties).not.toHaveBeenCalled();
    service.overwrite({ a: [1], b: { a: 0 } });
    expect(store.updateProperties).toHaveBeenNthCalledWith(1, { a: [1], b: { a: 0 } });
  });

  it(`overwrite(properties, path) sets the new properties at path using the overwrite strategy`, () => {
    jest.spyOn(store, 'getProperties').mockReturnValue({ b: { b: 0 } });
    jest.spyOn(store, 'updateProperties');
    expect(store.updateProperties).not.toHaveBeenCalled();
    service.overwrite({ a: 0 }, 'b');
    expect(store.updateProperties).toHaveBeenNthCalledWith(1, { b: { a: 0 } });
  });

  it(`overwrite(properties, path) sets the new properties using the overwrite strategy if path is invalid`, () => {
    jest.spyOn(store, 'getProperties').mockReturnValue({ a: { b: 0 } });
    jest.spyOn(store, 'updateProperties');
    expect(store.updateProperties).not.toHaveBeenCalled();
    service.overwrite({ a: { a: 0 } }, '');
    expect(store.updateProperties).toHaveBeenNthCalledWith(1, { a: { a: 0 } });
  });
});

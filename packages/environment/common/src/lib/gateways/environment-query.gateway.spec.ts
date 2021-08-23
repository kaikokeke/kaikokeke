import { Observable, of } from 'rxjs';
import { marbles } from 'rxjs-marbles/jest';

import { Properties } from '../types';
import { EnvironmentQueryGateway } from './environment-query.gateway';
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

class TestQuery extends EnvironmentQueryGateway {
  constructor(protected readonly store: TestStore) {
    super(store);
  }
}

const environment = { a: { a: 0 } };
const environment2 = { a: { b: 0 } };

describe('EnvironmentQueryGateway', () => {
  let store: EnvironmentStoreGateway;
  let query: EnvironmentQueryGateway;

  beforeEach(() => {
    store = new TestStore();
    query = new TestQuery(store);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it(
    `containsProperty$(path) returns if the path exists as Observable`,
    marbles((m) => {
      jest.spyOn(store, 'getAll$').mockReturnValue(m.cold('-a-a-b-b-a-|', { a: environment, b: environment2 }));
      const expected = m.cold('-t---f---t-|', { t: true, f: false });
      m.expect(query.containsProperty$('a.a')).toBeObservable(expected);
    }),
  );

  it(`containsProperty(path) returns true if the path exists`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue(environment);
    expect(query.containsProperty('a.a')).toBeTrue();
  });

  it(`containsProperty(path) returns false if the path doesn't exist`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue(environment);
    expect(query.containsProperty('a.b')).toBeFalse();
  });

  it(
    `getProperties$() returns the properties as Observable`,
    marbles((m) => {
      jest.spyOn(store, 'getAll$').mockReturnValue(m.cold('-a-a-b-b-a-|', { a: environment, b: environment2 }));
      const expected = m.cold('-a---b---a-|', { a: environment, b: environment2 });
      m.expect(query.getProperties$()).toBeObservable(expected);
    }),
  );

  it(`getProperties() returns the properties`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue(environment);
    expect(query.getProperties()).toEqual(environment);
  });

  it(
    `getProperty$(path) returns the property value as Observable`,
    marbles((m) => {
      jest.spyOn(store, 'getAll$').mockReturnValue(m.cold('-a-a-b-b-a-|', { a: environment, b: environment2 }));
      const expected = m.cold('-a---b---a-|', { a: 0, b: undefined });
      m.expect(query.getProperty$('a.a')).toBeObservable(expected);
    }),
  );

  it(`getProperty(path) returns the property value`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue(environment);
    expect(query.getProperty('a.a')).toEqual(0);
  });

  it(`getProperty(path) returns undefined if no path`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue(environment);
    expect(query.getProperty('a.b')).toBeUndefined();
  });

  it(
    `getTypedProperty$(path, targetType) returns the typed property value as Observable`,
    marbles((m) => {
      jest.spyOn(store, 'getAll$').mockReturnValue(m.cold('-a-a-b-b-a-|', { a: environment, b: environment2 }));
      const expected = m.cold('-a---b---a-|', { a: '0', b: undefined });
      m.expect(query.getTypedProperty$('a.a', String)).toBeObservable(expected);
    }),
  );

  it(`getTypedProperty(path, targetType) returns the typed property value`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue(environment);
    expect(query.getTypedProperty('a.a', String)).toEqual('0');
  });

  it(`getTypedProperty(path, targetType) returns undefined if no path`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue(environment);
    expect(query.getTypedProperty('a.b', String)).toBeUndefined();
  });

  it(
    `getRequiredProperty$(path, defaultValue) returns the property value or default value if no path as Observable`,
    marbles((m) => {
      jest.spyOn(store, 'getAll$').mockReturnValue(m.cold('-a-a-b-b-a-|', { a: environment, b: environment2 }));
      const expected = m.cold('-a---b---a-|', { a: 0, b: 1 });
      m.expect(query.getRequiredProperty$('a.a', 1)).toBeObservable(expected);
    }),
  );

  it(`getRequiredProperty(path, defaultValue) returns the property value`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue(environment);
    expect(query.getRequiredProperty('a.a', 1)).toEqual(0);
  });

  it(`getRequiredProperty(path, defaultValue) returns default value if no path`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue(environment);
    expect(query.getRequiredProperty('a.b', 1)).toEqual(1);
  });

  it(
    `getRequiredTypedProperty$(path, defaultValue, targetType) returns the typed property value or the typed default value if no path as Observable`,
    marbles((m) => {
      jest.spyOn(store, 'getAll$').mockReturnValue(m.cold('-a-a-b-b-a-|', { a: environment, b: environment2 }));
      const expected = m.cold('-a---b---a-|', { a: '0', b: '1' });
      m.expect(query.getRequiredTypedProperty$('a.a', 1, String)).toBeObservable(expected);
    }),
  );

  it(`getRequiredTypedProperty(path, defaultValue, targetType) returns the typed property value`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue(environment);
    expect(query.getRequiredTypedProperty('a.a', 1, String)).toEqual('0');
  });

  it(`getRequiredTypedProperty(path, defaultValue, targetType) returns the typed default value if no path`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue(environment);
    expect(query.getRequiredTypedProperty('a.b', 1, String)).toEqual('1');
  });
});

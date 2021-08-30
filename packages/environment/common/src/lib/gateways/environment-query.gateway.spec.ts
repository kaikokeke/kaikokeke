import { Observable, of } from 'rxjs';
import { marbles } from 'rxjs-marbles/jest';

import { Properties } from '../types';
import { EnvironmentQueryGateway } from './environment-query.gateway';
import { EnvironmentStoreGateway } from './environment-store.gateway';

class TestStore extends EnvironmentStoreGateway {
  getAll$(): Observable<Properties> {
    return of({});
  }
  getAll(): Properties {
    return {};
  }
  update(properties: Properties): void {}
  reset(): void {}
}

class TestQuery extends EnvironmentQueryGateway {
  constructor(protected store: TestStore) {
    super(store, {});
  }
}

const envA1 = Object.freeze({ a: Object.freeze({ a: 0 }) });
const envA2 = { a: { a: 0 } };
const envB1 = Object.freeze({ a: Object.freeze({ b: 0 }) });
const envB2 = { a: { b: 0 } };

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
    `getProperties$() returns all the distinct environment properties as Observable`,
    marbles((m) => {
      const source = m.cold('-a-b-c-d-a-|', { a: envA1, b: envA2, c: envB1, d: envB2 });
      const expected = m.cold('-a---b---a-|', { a: envA1, b: envB1 });
      jest.spyOn(store, 'getAll$').mockReturnValue(source);
      m.expect(query.getProperties$()).toBeObservable(expected);
    }),
  );

  it(`getProperties$() returns all the environment properties as mutable`, (done) => {
    jest.spyOn(store, 'getAll$').mockReturnValue(of(envA1));
    query.getProperties$().subscribe({
      next: (value) => {
        expect(value).toEqual(envA1);
        expect(Object.isFrozen(envA1)).toBeTrue();
        expect(Object.isFrozen(envA1.a)).toBeTrue();
        expect(Object.isFrozen(value)).toBeFalse();
        expect(Object.isFrozen(value.a)).toBeFalse();
        done();
      },
    });
  });

  it(`getProperties() returns all the environment properties as mutable`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue(envA1);
    const value = query.getProperties();
    expect(value).toEqual(envA1);
    expect(Object.isFrozen(envA1)).toBeTrue();
    expect(Object.isFrozen(envA1.a)).toBeTrue();
    expect(Object.isFrozen(value)).toBeFalse();
    expect(Object.isFrozen(value.a)).toBeFalse();
  });

  it(
    `getProperty$(path) returns the distinct environment property at path as Observable`,
    marbles((m) => {
      const source = m.cold('-a-b-c-d-a-|', { a: envA1, b: envA2, c: envB1, d: envB2 });
      const expected = m.cold('-a---b---a-|', { a: 0, b: undefined });
      jest.spyOn(store, 'getAll$').mockReturnValue(source);
      m.expect(query.getProperty$('a.a')).toBeObservable(expected);
    }),
  );

  it(`getProperty$(path) returns the environment property at path as mutable`, (done) => {
    jest.spyOn(store, 'getAll$').mockReturnValue(of(envA1));
    query.getProperty$('a').subscribe({
      next: (value) => {
        expect(value).toEqual(envA1.a);
        expect(Object.isFrozen(envA1.a)).toBeTrue();
        expect(Object.isFrozen(value)).toBeFalse();
        done();
      },
    });
  });

  it(`getProperty(path) returns the environment property at path as mutable`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue(envA1);
    const value = query.getProperty('a');
    expect(value).toEqual(envA1.a);
    expect(Object.isFrozen(envA1.a)).toBeTrue();
    expect(Object.isFrozen(value)).toBeFalse();
  });

  it(`getProperty(path) returns undefined if the path cannot be resolved`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue(envA1);
    expect(query.getProperty('a.b')).toBeUndefined();
  });

  it(
    `containsProperty$(path) returns if the distinct environment property at path is available for resolution as Observable`,
    marbles((m) => {
      const source = m.cold('-a-b-c-d-a-|', { a: envA1, b: envA2, c: envB1, d: envB2 });
      const expected = m.cold('-t---f---t-|', { t: true, f: false });
      jest.spyOn(store, 'getAll$').mockReturnValue(source);
      m.expect(query.containsProperty$('a.a')).toBeObservable(expected);
    }),
  );

  it(`containsProperty(path) returns true if the environment property at path exists`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue(envA1);
    expect(query.containsProperty('a.a')).toBeTrue();
  });

  it(`containsProperty(path) returns false if the environment property at path doesn't exist`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue(envA1);
    expect(query.containsProperty('a.b')).toBeFalse();
  });

  it(
    `getRequiredProperty$(path, defaultValue) returns the distinct required environment property at path as Observable`,
    marbles((m) => {
      const source = m.cold('-a-b-c-d-a-|', { a: envA1, b: envA2, c: envB1, d: envB2 });
      const expected = m.cold('-a---b---a-|', { a: 0, b: 'def' });
      jest.spyOn(store, 'getAll$').mockReturnValue(source);
      m.expect(query.getRequiredProperty$('a.a', 'def')).toBeObservable(expected);
    }),
  );

  it(`getRequiredProperty$(path, defaultValue) returns the environment property at path as mutable`, (done) => {
    jest.spyOn(store, 'getAll$').mockReturnValue(of(envA1));
    query.getRequiredProperty$('a', 'def').subscribe({
      next: (value) => {
        expect(value).toEqual(envA1.a);
        expect(Object.isFrozen(envA1.a)).toBeTrue();
        expect(Object.isFrozen(value)).toBeFalse();
        done();
      },
    });
  });

  it(`getRequiredProperty(path, defaultValue) returns the environment property at path as mutable`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue(envA1);
    expect(query.getRequiredProperty('a.a', 'def')).toEqual(0);
    const value = query.getRequiredProperty('a', 'def');
    expect(value).toEqual(envA1.a);
    expect(Object.isFrozen(envA1.a)).toBeTrue();
    expect(Object.isFrozen(value)).toBeFalse();
  });

  it(`getRequiredProperty(path, defaultValue) returns the defaultValue if the path cannot be resolved`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue(envA1);
    expect(query.getRequiredProperty('a.b', 'def')).toEqual('def');
  });

  it(
    `getTypedProperty$(path, targetType) returns the distinct typed environment property at path as Observable`,
    marbles((m) => {
      const source = m.cold('-a-b-c-d-a-|', { a: envA1, b: envA2, c: envB1, d: envB2 });
      const expected = m.cold('-a---b---a-|', { a: '0', b: undefined });
      jest.spyOn(store, 'getAll$').mockReturnValue(source);
      m.expect(query.getTypedProperty$('a.a', String)).toBeObservable(expected);
    }),
  );

  it(`getTypedProperty$(path, targetType) returns the environment property at path converted to the targetType as mutable`, (done) => {
    jest.spyOn(store, 'getAll$').mockReturnValue(of(envA1));
    query
      .getTypedProperty$('a', (value) => value)
      .subscribe({
        next: (value) => {
          expect(value).toEqual(envA1.a);
          expect(Object.isFrozen(envA1.a)).toBeTrue();
          expect(Object.isFrozen(value)).toBeFalse();
          done();
        },
      });
  });

  it(`getTypedProperty(path, targetType) returns the environment property at path converted to the targetType as mutable`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue(envA1);
    expect(query.getTypedProperty('a.a', String)).toEqual('0');
    const value = query.getTypedProperty('a', (value) => value);
    expect(value).toEqual(envA1.a);
    expect(Object.isFrozen(envA1.a)).toBeTrue();
    expect(Object.isFrozen(value)).toBeFalse();
  });

  it(`getTypedProperty(path, targetType) returns undefined if the path cannot be resolved`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue(envA1);
    expect(query.getTypedProperty('a.b', (value) => value)).toBeUndefined();
  });

  it(
    `getRequiredTypedProperty$(path, defaultValue, targetType) returns the distinct required typed environment property at path as Observable`,
    marbles((m) => {
      const source = m.cold('-a-b-c-d-a-|', { a: envA1, b: envA2, c: envB1, d: envB2 });
      const expected = m.cold('-a---b---a-|', { a: '0', b: '1' });
      jest.spyOn(store, 'getAll$').mockReturnValue(source);
      m.expect(query.getRequiredTypedProperty$('a.a', 1, String)).toBeObservable(expected);
    }),
  );

  it(`getRequiredTypedProperty$(path, defaultValue, targetType) returns the environment property at path converted to the targetType as mutable`, (done) => {
    jest.spyOn(store, 'getAll$').mockReturnValue(of(envA1));
    query
      .getRequiredTypedProperty$('a', 1, (value) => value)
      .subscribe({
        next: (value) => {
          expect(value).toEqual(envA1.a);
          expect(Object.isFrozen(envA1.a)).toBeTrue();
          expect(Object.isFrozen(value)).toBeFalse();
          done();
        },
      });
  });

  it(`getRequiredTypedProperty(path, defaultValue, targetType) returns the environment property at path converted to the targetType as mutable`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue(envA1);
    expect(query.getRequiredTypedProperty('a.a', 1, String)).toEqual('0');
    const value = query.getRequiredTypedProperty('a', 1, (value) => value);
    expect(value).toEqual(envA1.a);
    expect(Object.isFrozen(envA1.a)).toBeTrue();
    expect(Object.isFrozen(value)).toBeFalse();
  });

  it(`getRequiredTypedProperty(path, defaultValue, targetType) returns the defaultValue converted to the targetType if the path cannot be resolved`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue(envA1);
    expect(query.getRequiredTypedProperty('a.b', 1, String)).toEqual('1');
  });
});

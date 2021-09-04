import { Observable, of, Subject } from 'rxjs';
import { marbles } from 'rxjs-marbles/jest';

import { Properties } from '../types';
import { EnvironmentQuery } from './environment-query.gateway';
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

class TestQuery extends EnvironmentQuery {
  constructor(protected store: TestStore) {
    super(store);
  }
}

const envA1 = Object.freeze({ a: Object.freeze({ a: 0 }), b: '{{ a.a }}' });
const envA2 = { a: { a: 0 }, b: '{{ a.a }}' };
const envB1 = Object.freeze({ a: Object.freeze({ b: 0 }), b: '{{ a.b }}' });
const envB2 = { a: { b: 0 }, b: '{{ a.b }}' };

describe('EnvironmentQuery', () => {
  let store: EnvironmentStore;
  let query: EnvironmentQuery;

  beforeEach(() => {
    store = new TestStore();
    query = new TestQuery(store);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // getProperties

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

  it(`getProperties$() returns always the last value`, () => {
    const sub = new Subject<Properties>();
    const value = { a: 0 };
    jest.spyOn(console, 'log').mockImplementation(() => null);
    jest.spyOn(store, 'getAll$').mockReturnValue(sub);
    const prop = query.getProperties$();
    prop.subscribe({ next: (v) => console.log(v) });
    sub.next(value);
    expect(console.log).toHaveBeenNthCalledWith(1, value);
    prop.subscribe({ next: (v) => console.log(v) });
    expect(console.log).toHaveBeenNthCalledWith(2, value);
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

  // getProperty

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

  it(`getProperty$(path) returns always the last value`, () => {
    const sub = new Subject<Properties>();
    const value = { a: 0 };
    jest.spyOn(console, 'log').mockImplementation(() => null);
    jest.spyOn(store, 'getAll$').mockReturnValue(sub);
    const prop = query.getProperty$('a');
    prop.subscribe({ next: (v) => console.log(v) });
    sub.next(value);
    expect(console.log).toHaveBeenNthCalledWith(1, value.a);
    prop.subscribe({ next: (v) => console.log(v) });
    expect(console.log).toHaveBeenNthCalledWith(2, value.a);
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

  // containsProperty

  it(
    `containsProperty$(path) returns if the distinct environment property at path is available for resolution as Observable`,
    marbles((m) => {
      const source = m.cold('-a-b-c-d-a-|', { a: envA1, b: envA2, c: envB1, d: envB2 });
      const expected = m.cold('-t---f---t-|', { t: true, f: false });
      jest.spyOn(store, 'getAll$').mockReturnValue(source);
      m.expect(query.containsProperty$('a.a')).toBeObservable(expected);
    }),
  );

  it(`containsProperty$(path) returns always the last value`, () => {
    const sub = new Subject<Properties>();
    const value = { a: 0 };
    jest.spyOn(console, 'log').mockImplementation(() => null);
    jest.spyOn(store, 'getAll$').mockReturnValue(sub);
    const prop = query.containsProperty$('a');
    prop.subscribe({ next: (v) => console.log(v) });
    sub.next(value);
    expect(console.log).toHaveBeenNthCalledWith(1, true);
    prop.subscribe({ next: (v) => console.log(v) });
    expect(console.log).toHaveBeenNthCalledWith(2, true);
  });

  it(`containsProperty(path) returns true if the environment property at path exists`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue(envA1);
    expect(query.containsProperty('a.a')).toBeTrue();
  });

  it(`containsProperty(path) returns false if the environment property at path doesn't exist`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue(envA1);
    expect(query.containsProperty('a.b')).toBeFalse();
  });

  // getRequiredProperty

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

  it(`getRequiredProperty$(path, defaultValue) returns always the last value`, () => {
    const sub = new Subject<Properties>();
    const value = { a: 0 };
    jest.spyOn(console, 'log').mockImplementation(() => null);
    jest.spyOn(store, 'getAll$').mockReturnValue(sub);
    const prop = query.getRequiredProperty$('a', 1);
    prop.subscribe({ next: (v) => console.log(v) });
    sub.next(value);
    expect(console.log).toHaveBeenNthCalledWith(1, value.a);
    prop.subscribe({ next: (v) => console.log(v) });
    expect(console.log).toHaveBeenNthCalledWith(2, value.a);
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

  // getTypedProperty

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

  it(`getTypedProperty$(path, targetType) returns always the last value`, () => {
    const sub = new Subject<Properties>();
    const value = { a: 0 };
    jest.spyOn(console, 'log').mockImplementation(() => null);
    jest.spyOn(store, 'getAll$').mockReturnValue(sub);
    const prop = query.getTypedProperty$('a', (v) => v);
    prop.subscribe({ next: (v) => console.log(v) });
    sub.next(value);
    expect(console.log).toHaveBeenNthCalledWith(1, value.a);
    prop.subscribe({ next: (v) => console.log(v) });
    expect(console.log).toHaveBeenNthCalledWith(2, value.a);
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

  // getRequiredTypedProperty

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

  it(`getRequiredTypedProperty$(path, defaultValue, targetType) returns always the last value`, () => {
    const sub = new Subject<Properties>();
    const value = { a: 0 };
    jest.spyOn(console, 'log').mockImplementation(() => null);
    jest.spyOn(store, 'getAll$').mockReturnValue(sub);
    const prop = query.getRequiredTypedProperty$('a', 1, (v) => v);
    prop.subscribe({ next: (v) => console.log(v) });
    sub.next(value);
    expect(console.log).toHaveBeenNthCalledWith(1, value.a);
    prop.subscribe({ next: (v) => console.log(v) });
    expect(console.log).toHaveBeenNthCalledWith(2, value.a);
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

  // getTranspiledProperty

  it(
    `getTranspiledProperty$(path) returns the distinct environment property at path as Observable`,
    marbles((m) => {
      const source = m.cold('-a-b-c-d-a-|', { a: envA1, b: envA2, c: envB1, d: envB2 });
      const expected = m.cold('-a---b---a-|', { a: 0, b: undefined });
      jest.spyOn(store, 'getAll$').mockReturnValue(source);
      m.expect(query.getTranspiledProperty$('a.a')).toBeObservable(expected);
    }),
  );

  it(`getTranspiledProperty$(path) returns the environment property at path as mutable`, (done) => {
    jest.spyOn(store, 'getAll$').mockReturnValue(of(envA1));
    query.getTranspiledProperty$('a').subscribe({
      next: (value) => {
        expect(value).toEqual(envA1.a);
        expect(Object.isFrozen(envA1.a)).toBeTrue();
        expect(Object.isFrozen(value)).toBeFalse();
        done();
      },
    });
  });

  it(`getTranspiledProperty$(path) returns always the last value`, () => {
    const sub = new Subject<Properties>();
    const value = { a: 0 };
    jest.spyOn(console, 'log').mockImplementation(() => null);
    jest.spyOn(store, 'getAll$').mockReturnValue(sub);
    const prop = query.getTranspiledProperty$('a');
    prop.subscribe({ next: (v) => console.log(v) });
    sub.next(value);
    expect(console.log).toHaveBeenNthCalledWith(1, value.a);
    prop.subscribe({ next: (v) => console.log(v) });
    expect(console.log).toHaveBeenNthCalledWith(2, value.a);
  });

  it(`getTranspiledProperty$(path) returns untranspiled string if no useEnvironmentToTranspile`, (done) => {
    jest.spyOn(store, 'getAll$').mockReturnValue(of(envA1));
    jest.spyOn(store, 'getAll').mockReturnValue(envA1);
    (query as any)['config'].useEnvironmentToTranspile = false;
    query.getTranspiledProperty$('b').subscribe({
      next: (value) => {
        expect(value).toEqual(envA1.b);
        done();
      },
    });
  });

  it(`getTranspiledProperty$(path) returns transpiled if useEnvironmentToTranspile`, (done) => {
    jest.spyOn(store, 'getAll$').mockReturnValue(of(envA1));
    jest.spyOn(store, 'getAll').mockReturnValue(envA1);
    (query as any)['config'].useEnvironmentToTranspile = true;
    query.getTranspiledProperty$('b').subscribe({
      next: (value) => {
        expect(value).toEqual('0');
        done();
      },
    });
  });

  it(`getTranspiledProperty$(path, properties) returns transpiled if no useEnvironmentToTranspile`, (done) => {
    jest.spyOn(store, 'getAll$').mockReturnValue(of(envA1));
    jest.spyOn(store, 'getAll').mockReturnValue(envA1);
    (query as any)['config'].useEnvironmentToTranspile = false;
    query.getTranspiledProperty$('b', { a: { a: 1 } }).subscribe({
      next: (value) => {
        expect(value).toEqual('1');
        done();
      },
    });
  });

  it(`getTranspiledProperty$(path, properties) returns transpiled if useEnvironmentToTranspile`, (done) => {
    jest.spyOn(store, 'getAll$').mockReturnValue(of(envA1));
    jest.spyOn(store, 'getAll').mockReturnValue(envA1);
    (query as any)['config'].useEnvironmentToTranspile = true;
    query.getTranspiledProperty$('b', { a: { a: 1 } }).subscribe({
      next: (value) => {
        expect(value).toEqual('1');
        done();
      },
    });
  });

  it(`getTranspiledProperty$(path, properties, config) returns transpiled using custom config`, (done) => {
    jest.spyOn(store, 'getAll$').mockReturnValue(of(envA1));
    jest.spyOn(store, 'getAll').mockReturnValue(envA1);
    (query as any)['config'].useEnvironmentToTranspile = false;
    query.getTranspiledProperty$('b', {}, { useEnvironmentToTranspile: true }).subscribe({
      next: (value) => {
        expect(value).toEqual('0');
        done();
      },
    });
  });

  it(`getTranspiledProperty$(path) returns transpiled object`, (done) => {
    const env = { a: { a: 0 }, b: '{{ a }}' };
    jest.spyOn(store, 'getAll$').mockReturnValue(of(env));
    jest.spyOn(store, 'getAll').mockReturnValue(env);
    (query as any)['config'].useEnvironmentToTranspile = true;
    query.getTranspiledProperty$('b').subscribe({
      next: (value) => {
        expect(value).toEqual('{"a":0}');
        done();
      },
    });
  });

  it(`getTranspiledProperty$(path) returns transpiled with custom interpolation`, (done) => {
    const env = { a: { a: 0 }, b: '[< a.a >]' };
    jest.spyOn(store, 'getAll$').mockReturnValue(of(env));
    jest.spyOn(store, 'getAll').mockReturnValue(env);
    (query as any)['config'].useEnvironmentToTranspile = true;
    (query as any)['config'].interpolation = ['[<', '>]'];
    query.getTranspiledProperty$('b').subscribe({
      next: (value) => {
        expect(value).toEqual('0');
        done();
      },
    });
  });

  it(`getTranspiledProperty$(path, properties, config) returns transpiled with custom interpolation`, (done) => {
    const env = { a: { a: 0 }, b: '[< a.a >]' };
    jest.spyOn(store, 'getAll$').mockReturnValue(of(env));
    jest.spyOn(store, 'getAll').mockReturnValue(env);
    (query as any)['config'].useEnvironmentToTranspile = true;
    query.getTranspiledProperty$('b', {}, { interpolation: ['[<', '>]'] }).subscribe({
      next: (value) => {
        expect(value).toEqual('0');
        done();
      },
    });
  });

  it(`getTranspiledProperty$(path) returns transpiled with weird space interpolation`, (done) => {
    const env = { a: { a: 0 }, b: '{{    a.a}}' };
    jest.spyOn(store, 'getAll$').mockReturnValue(of(env));
    jest.spyOn(store, 'getAll').mockReturnValue(env);
    (query as any)['config'].useEnvironmentToTranspile = true;
    query.getTranspiledProperty$('b').subscribe({
      next: (value) => {
        expect(value).toEqual('0');
        done();
      },
    });
  });

  it(`getTranspiledProperty(path) returns the environment property at path as mutable`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue(envA1);
    const value = query.getTranspiledProperty('a');
    expect(value).toEqual(envA1.a);
    expect(Object.isFrozen(envA1.a)).toBeTrue();
    expect(Object.isFrozen(value)).toBeFalse();
  });

  it(`getTranspiledProperty(path) returns undefined if the path cannot be resolved`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue(envA1);
    expect(query.getTranspiledProperty('a.b')).toBeUndefined();
  });

  it(`getTranspiledProperty(path) returns untranspiled string if no useEnvironmentToTranspile`, () => {
    jest.spyOn(store, 'getAll$').mockReturnValue(of(envA1));
    jest.spyOn(store, 'getAll').mockReturnValue(envA1);
    (query as any)['config'].useEnvironmentToTranspile = false;
    expect(query.getTranspiledProperty('b')).toEqual(envA1.b);
  });

  it(`getTranspiledProperty(path) returns transpiled if useEnvironmentToTranspile`, () => {
    jest.spyOn(store, 'getAll$').mockReturnValue(of(envA1));
    jest.spyOn(store, 'getAll').mockReturnValue(envA1);
    (query as any)['config'].useEnvironmentToTranspile = true;
    expect(query.getTranspiledProperty('b')).toEqual('0');
  });

  it(`getTranspiledProperty(path, properties) returns transpiled if no useEnvironmentToTranspile`, () => {
    jest.spyOn(store, 'getAll$').mockReturnValue(of(envA1));
    jest.spyOn(store, 'getAll').mockReturnValue(envA1);
    (query as any)['config'].useEnvironmentToTranspile = false;
    expect(query.getTranspiledProperty('b', { a: { a: 1 } })).toEqual('1');
  });

  it(`getTranspiledProperty(path, properties) returns transpiled if useEnvironmentToTranspile`, () => {
    jest.spyOn(store, 'getAll$').mockReturnValue(of(envA1));
    jest.spyOn(store, 'getAll').mockReturnValue(envA1);
    (query as any)['config'].useEnvironmentToTranspile = true;
    expect(query.getTranspiledProperty('b', { a: { a: 1 } })).toEqual('1');
  });

  it(`getTranspiledProperty(path, properties, config) returns transpiled using custom config`, () => {
    jest.spyOn(store, 'getAll$').mockReturnValue(of(envA1));
    jest.spyOn(store, 'getAll').mockReturnValue(envA1);
    (query as any)['config'].useEnvironmentToTranspile = false;
    expect(query.getTranspiledProperty('b', {}, { useEnvironmentToTranspile: true })).toEqual('0');
  });

  it(`getTranspiledProperty(path) returns transpiled object`, () => {
    const env = { a: { a: 0 }, b: '{{ a }}' };
    jest.spyOn(store, 'getAll$').mockReturnValue(of(env));
    jest.spyOn(store, 'getAll').mockReturnValue(env);
    (query as any)['config'].useEnvironmentToTranspile = true;
    expect(query.getTranspiledProperty('b')).toEqual('{"a":0}');
  });

  it(`getTranspiledProperty(path) returns transpiled with custom interpolation`, () => {
    const env = { a: { a: 0 }, b: '[< a.a >]' };
    jest.spyOn(store, 'getAll$').mockReturnValue(of(env));
    jest.spyOn(store, 'getAll').mockReturnValue(env);
    (query as any)['config'].useEnvironmentToTranspile = true;
    (query as any)['config'].interpolation = ['[<', '>]'];
    expect(query.getTranspiledProperty('b')).toEqual('0');
  });

  it(`getTranspiledProperty(path, properties, config) returns transpiled with custom interpolation`, () => {
    const env = { a: { a: 0 }, b: '[< a.a >]' };
    jest.spyOn(store, 'getAll$').mockReturnValue(of(env));
    jest.spyOn(store, 'getAll').mockReturnValue(env);
    (query as any)['config'].useEnvironmentToTranspile = true;
    expect(query.getTranspiledProperty('b', {}, { interpolation: ['[<', '>]'] })).toEqual('0');
  });

  it(`getTranspiledProperty(path) returns transpiled with weird space interpolation`, () => {
    const env = { a: { a: 0 }, b: '{{   a.a}}' };
    jest.spyOn(store, 'getAll$').mockReturnValue(of(env));
    jest.spyOn(store, 'getAll').mockReturnValue(env);
    (query as any)['config'].useEnvironmentToTranspile = true;
    expect(query.getTranspiledProperty('b')).toEqual('0');
  });

  // getRequiredTranspiledProperty

  it(
    `getRequiredTranspiledProperty$(path, defaultValue) returns the distinct required environment property at path as Observable`,
    marbles((m) => {
      const source = m.cold('-a-b-c-d-a-|', { a: envA1, b: envA2, c: envB1, d: envB2 });
      const expected = m.cold('-a---b---a-|', { a: 0, b: 'def' });
      jest.spyOn(store, 'getAll$').mockReturnValue(source);
      m.expect(query.getRequiredTranspiledProperty$('a.a', 'def')).toBeObservable(expected);
    }),
  );

  it(`getRequiredTranspiledProperty$(path, defaultValue) returns the environment property at path as mutable`, (done) => {
    jest.spyOn(store, 'getAll$').mockReturnValue(of(envA1));
    query.getRequiredTranspiledProperty$('a', 'def').subscribe({
      next: (value) => {
        expect(value).toEqual(envA1.a);
        expect(Object.isFrozen(envA1.a)).toBeTrue();
        expect(Object.isFrozen(value)).toBeFalse();
        done();
      },
    });
  });

  it(`getRequiredTranspiledProperty$(path, defaultValue) returns always the last value`, () => {
    const sub = new Subject<Properties>();
    const value = { a: 0 };
    jest.spyOn(console, 'log').mockImplementation(() => null);
    jest.spyOn(store, 'getAll$').mockReturnValue(sub);
    const prop = query.getRequiredTranspiledProperty$('a', 1);
    prop.subscribe({ next: (v) => console.log(v) });
    sub.next(value);
    expect(console.log).toHaveBeenNthCalledWith(1, value.a);
    prop.subscribe({ next: (v) => console.log(v) });
    expect(console.log).toHaveBeenNthCalledWith(2, value.a);
  });

  it(`getRequiredTranspiledProperty$(path, defaultValue) returns untranspiled string if no useEnvironmentToTranspile`, (done) => {
    jest.spyOn(store, 'getAll$').mockReturnValue(of(envA1));
    jest.spyOn(store, 'getAll').mockReturnValue(envA1);
    (query as any)['config'].useEnvironmentToTranspile = false;
    query.getRequiredTranspiledProperty$('b', 2).subscribe({
      next: (value) => {
        expect(value).toEqual(envA1.b);
        done();
      },
    });
  });

  it(`getRequiredTranspiledProperty$(path, defaultValue) returns transpiled if useEnvironmentToTranspile`, (done) => {
    jest.spyOn(store, 'getAll$').mockReturnValue(of(envA1));
    jest.spyOn(store, 'getAll').mockReturnValue(envA1);
    (query as any)['config'].useEnvironmentToTranspile = true;
    query.getRequiredTranspiledProperty$('b', 2).subscribe({
      next: (value) => {
        expect(value).toEqual('0');
        done();
      },
    });
  });

  it(`getRequiredTranspiledProperty$(path, defaultValue, properties) returns transpiled if no useEnvironmentToTranspile`, (done) => {
    jest.spyOn(store, 'getAll$').mockReturnValue(of(envA1));
    jest.spyOn(store, 'getAll').mockReturnValue(envA1);
    (query as any)['config'].useEnvironmentToTranspile = false;
    query.getRequiredTranspiledProperty$('b', 2, { a: { a: 1 } }).subscribe({
      next: (value) => {
        expect(value).toEqual('1');
        done();
      },
    });
  });

  it(`getRequiredTranspiledProperty$(path, defaultValue, properties) returns transpiled if useEnvironmentToTranspile`, (done) => {
    jest.spyOn(store, 'getAll$').mockReturnValue(of(envA1));
    jest.spyOn(store, 'getAll').mockReturnValue(envA1);
    (query as any)['config'].useEnvironmentToTranspile = true;
    query.getRequiredTranspiledProperty$('b', 2, { a: { a: 1 } }).subscribe({
      next: (value) => {
        expect(value).toEqual('1');
        done();
      },
    });
  });

  it(`getRequiredTranspiledProperty$(path, defaultValue, properties, config) returns transpiled using custom config`, (done) => {
    jest.spyOn(store, 'getAll$').mockReturnValue(of(envA1));
    jest.spyOn(store, 'getAll').mockReturnValue(envA1);
    (query as any)['config'].useEnvironmentToTranspile = false;
    query.getRequiredTranspiledProperty$('b', 2, {}, { useEnvironmentToTranspile: true }).subscribe({
      next: (value) => {
        expect(value).toEqual('0');
        done();
      },
    });
  });

  it(`getRequiredTranspiledProperty$(path, defaultValue) returns transpiled object`, (done) => {
    const env = { a: { a: 0 }, b: '{{ a }}' };
    jest.spyOn(store, 'getAll$').mockReturnValue(of(env));
    jest.spyOn(store, 'getAll').mockReturnValue(env);
    (query as any)['config'].useEnvironmentToTranspile = true;
    query.getRequiredTranspiledProperty$('b', 2).subscribe({
      next: (value) => {
        expect(value).toEqual('{"a":0}');
        done();
      },
    });
  });

  it(`getRequiredTranspiledProperty$(path, defaultValue) returns transpiled with custom interpolation`, (done) => {
    const env = { a: { a: 0 }, b: '[< a.a >]' };
    jest.spyOn(store, 'getAll$').mockReturnValue(of(env));
    jest.spyOn(store, 'getAll').mockReturnValue(env);
    (query as any)['config'].useEnvironmentToTranspile = true;
    (query as any)['config'].interpolation = ['[<', '>]'];
    query.getRequiredTranspiledProperty$('b', 2).subscribe({
      next: (value) => {
        expect(value).toEqual('0');
        done();
      },
    });
  });

  it(`getRequiredTranspiledProperty$(path, defaultValue, properties, config) returns transpiled with custom interpolation`, (done) => {
    const env = { a: { a: 0 }, b: '[< a.a >]' };
    jest.spyOn(store, 'getAll$').mockReturnValue(of(env));
    jest.spyOn(store, 'getAll').mockReturnValue(env);
    (query as any)['config'].useEnvironmentToTranspile = true;
    query.getRequiredTranspiledProperty$('b', 2, {}, { interpolation: ['[<', '>]'] }).subscribe({
      next: (value) => {
        expect(value).toEqual('0');
        done();
      },
    });
  });

  it(`getRequiredTranspiledProperty$(path, defaultValue) returns transpiled with weird space interpolation`, (done) => {
    const env = { a: { a: 0 }, b: '{{    a.a}}' };
    jest.spyOn(store, 'getAll$').mockReturnValue(of(env));
    jest.spyOn(store, 'getAll').mockReturnValue(env);
    (query as any)['config'].useEnvironmentToTranspile = true;
    query.getRequiredTranspiledProperty$('b', 2).subscribe({
      next: (value) => {
        expect(value).toEqual('0');
        done();
      },
    });
  });

  it(`getRequiredTranspiledProperty(path, defaultValue) returns the environment property at path as mutable`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue(envA1);
    expect(query.getRequiredTranspiledProperty('a.a', 'def')).toEqual(0);
    const value = query.getRequiredTranspiledProperty('a', 'def');
    expect(value).toEqual(envA1.a);
    expect(Object.isFrozen(envA1.a)).toBeTrue();
    expect(Object.isFrozen(value)).toBeFalse();
  });

  it(`getRequiredTranspiledProperty(path, defaultValue) returns the defaultValue if the path cannot be resolved`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue(envA1);
    expect(query.getRequiredTranspiledProperty('a.b', 'def')).toEqual('def');
  });

  it(`getRequiredTranspiledProperty(path, defaultValue) returns untranspiled string if no useEnvironmentToTranspile`, () => {
    jest.spyOn(store, 'getAll$').mockReturnValue(of(envA1));
    jest.spyOn(store, 'getAll').mockReturnValue(envA1);
    (query as any)['config'].useEnvironmentToTranspile = false;
    expect(query.getRequiredTranspiledProperty('b', 2)).toEqual(envA1.b);
  });

  it(`getRequiredTranspiledProperty(path, defaultValue) returns transpiled if useEnvironmentToTranspile`, () => {
    jest.spyOn(store, 'getAll$').mockReturnValue(of(envA1));
    jest.spyOn(store, 'getAll').mockReturnValue(envA1);
    (query as any)['config'].useEnvironmentToTranspile = true;
    expect(query.getRequiredTranspiledProperty('b', 2)).toEqual('0');
  });

  it(`getRequiredTranspiledProperty(path, defaultValue, properties) returns transpiled if no useEnvironmentToTranspile`, () => {
    jest.spyOn(store, 'getAll$').mockReturnValue(of(envA1));
    jest.spyOn(store, 'getAll').mockReturnValue(envA1);
    (query as any)['config'].useEnvironmentToTranspile = false;
    expect(query.getRequiredTranspiledProperty('b', 2, { a: { a: 1 } })).toEqual('1');
  });

  it(`getRequiredTranspiledProperty(path, defaultValue, properties) returns transpiled if useEnvironmentToTranspile`, () => {
    jest.spyOn(store, 'getAll$').mockReturnValue(of(envA1));
    jest.spyOn(store, 'getAll').mockReturnValue(envA1);
    (query as any)['config'].useEnvironmentToTranspile = true;
    expect(query.getRequiredTranspiledProperty('b', 2, { a: { a: 1 } })).toEqual('1');
  });

  it(`getRequiredTranspiledProperty(path, defaultValue, properties, config) returns transpiled using custom config`, () => {
    jest.spyOn(store, 'getAll$').mockReturnValue(of(envA1));
    jest.spyOn(store, 'getAll').mockReturnValue(envA1);
    (query as any)['config'].useEnvironmentToTranspile = false;
    expect(query.getRequiredTranspiledProperty('b', 2, {}, { useEnvironmentToTranspile: true })).toEqual('0');
  });

  it(`getRequiredTranspiledProperty(path, defaultValue) returns transpiled object`, () => {
    const env = { a: { a: 0 }, b: '{{ a }}' };
    jest.spyOn(store, 'getAll$').mockReturnValue(of(env));
    jest.spyOn(store, 'getAll').mockReturnValue(env);
    (query as any)['config'].useEnvironmentToTranspile = true;
    expect(query.getRequiredTranspiledProperty('b', 2)).toEqual('{"a":0}');
  });

  it(`getRequiredTranspiledProperty(path, defaultValue) returns transpiled with custom interpolation`, () => {
    const env = { a: { a: 0 }, b: '[< a.a >]' };
    jest.spyOn(store, 'getAll$').mockReturnValue(of(env));
    jest.spyOn(store, 'getAll').mockReturnValue(env);
    (query as any)['config'].useEnvironmentToTranspile = true;
    (query as any)['config'].interpolation = ['[<', '>]'];
    expect(query.getRequiredTranspiledProperty('b', 2)).toEqual('0');
  });

  it(`getRequiredTranspiledProperty(path, defaultValue, properties, config) returns transpiled with custom interpolation`, () => {
    const env = { a: { a: 0 }, b: '[< a.a >]' };
    jest.spyOn(store, 'getAll$').mockReturnValue(of(env));
    jest.spyOn(store, 'getAll').mockReturnValue(env);
    (query as any)['config'].useEnvironmentToTranspile = true;
    expect(query.getRequiredTranspiledProperty('b', 2, {}, { interpolation: ['[<', '>]'] })).toEqual('0');
  });

  it(`getRequiredTranspiledProperty(path, defaultValue) returns transpiled with weird space interpolation`, () => {
    const env = { a: { a: 0 }, b: '{{   a.a}}' };
    jest.spyOn(store, 'getAll$').mockReturnValue(of(env));
    jest.spyOn(store, 'getAll').mockReturnValue(env);
    (query as any)['config'].useEnvironmentToTranspile = true;
    expect(query.getRequiredTranspiledProperty('b', 2)).toEqual('0');
  });
});

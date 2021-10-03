import { Observable, of, Subject } from 'rxjs';
import { marbles } from 'rxjs-marbles/jest';

import { asMutable, mapAsMutable } from '../helpers';
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
const envB1 = Object.freeze({ a: Object.freeze({ c: 0 }), b: '{{ a.b }}' });
const envB2 = { a: { c: 0 }, b: '{{ a.b }}' };

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

  // getAll

  it(
    `getAll$() returns all the distinct environment properties as Observable`,
    marbles((m) => {
      const source = m.cold('-a-b-c-d-a-|', { a: envA1, b: envA2, c: envB1, d: envB2 });
      const expected = m.cold('-a---b---a-|', { a: envA1, b: envB1 });
      jest.spyOn(store, 'getAll$').mockReturnValue(source);
      m.expect(query.getAll$()).toBeObservable(expected);
    }),
  );

  it(`getAll$() returns always the last value`, () => {
    const sub = new Subject<Properties>();
    const value = { a: 0 };
    jest.spyOn(console, 'log').mockImplementation(() => null);
    jest.spyOn(store, 'getAll$').mockReturnValue(sub);
    const prop = query.getAll$();
    prop.subscribe({ next: (v) => console.log(v) });
    sub.next(value);
    expect(console.log).toHaveBeenNthCalledWith(1, value);
    prop.subscribe({ next: (v) => console.log(v) });
    expect(console.log).toHaveBeenNthCalledWith(2, value);
  });

  // get

  it(
    `get$(path) returns the distinct environment property at path as Observable`,
    marbles((m) => {
      const source = m.cold('-a-b-c-d-a-|', { a: envA1, b: envA2, c: envB1, d: envB2 });
      const expected = m.cold('-a---b---a-|', { a: 0, b: undefined });
      jest.spyOn(store, 'getAll$').mockReturnValue(source);
      m.expect(query.get$('a.a')).toBeObservable(expected);
    }),
  );

  it(`get$(path) returns always the last value`, () => {
    const sub = new Subject<Properties>();
    const value = { a: 0 };
    jest.spyOn(console, 'log').mockImplementation(() => null);
    jest.spyOn(store, 'getAll$').mockReturnValue(sub);
    const prop = query.get$('a');
    prop.subscribe({ next: (v) => console.log(v) });
    sub.next(value);
    expect(console.log).toHaveBeenNthCalledWith(1, value.a);
    prop.subscribe({ next: (v) => console.log(v) });
    expect(console.log).toHaveBeenNthCalledWith(2, value.a);
  });

  it(`get(path) returns undefined if the path cannot be resolved`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue(envA1);
    expect(query.get('a.z')).toBeUndefined();
  });

  // contains

  it(
    `contains$(path) returns if the distinct environment property path is available for resolution as Observable`,
    marbles((m) => {
      const source = m.cold('-a-b-c-d-a-|', { a: envA1, b: envA2, c: envB1, d: envB2 });
      const expected = m.cold('-t---f---t-|', { t: true, f: false });
      jest.spyOn(store, 'getAll$').mockReturnValue(source);
      m.expect(query.contains$('a.a')).toBeObservable(expected);
    }),
  );

  it(`contains$(path) returns always the last value`, () => {
    const sub = new Subject<Properties>();
    const value = { a: 0 };
    jest.spyOn(console, 'log').mockImplementation(() => null);
    jest.spyOn(store, 'getAll$').mockReturnValue(sub);
    const prop = query.contains$('a');
    prop.subscribe({ next: (v) => console.log(v) });
    sub.next(value);
    expect(console.log).toHaveBeenNthCalledWith(1, true);
    prop.subscribe({ next: (v) => console.log(v) });
    expect(console.log).toHaveBeenNthCalledWith(2, true);
  });

  it(`contains(path) returns true if the environment property path exists`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue(envB1);
    expect(query.contains('a.c')).toBeTrue();
    expect(query.contains(['a', 'c'])).toBeTrue();
  });

  it(`contains(path) returns false if the environment property path doesn't exist`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue(envA1);
    expect(query.contains('z')).toBeFalse();
  });

  // containsAll

  it(
    `containsAll$(path) returns if the distinct environment property path is available for resolution as Observable`,
    marbles((m) => {
      const source = m.cold('-a-b-c-d-a-|', { a: envA1, b: envA2, c: envB1, d: envB2 });
      const expected = m.cold('-t---f---t-|', { t: true, f: false });
      jest.spyOn(store, 'getAll$').mockReturnValue(source);
      m.expect(query.containsAll$('a.a')).toBeObservable(expected);
    }),
  );

  it(
    `containsAll$(...paths) returns if all the distinct environment property paths are available for resolution as Observable`,
    marbles((m) => {
      const source = m.cold('-a-b-c-d-a-|', { a: envA1, b: envA2, c: envB1, d: envB2 });
      const expected = m.cold('-t---f---t-|', { t: true, f: false });
      jest.spyOn(store, 'getAll$').mockReturnValue(source);
      m.expect(query.containsAll$('b', 'a.a')).toBeObservable(expected);
    }),
  );

  it(`containsAll$(path) returns always the last value`, () => {
    const sub = new Subject<Properties>();
    const value = { a: 0 };
    jest.spyOn(console, 'log').mockImplementation(() => null);
    jest.spyOn(store, 'getAll$').mockReturnValue(sub);
    const prop = query.containsAll$('a');
    prop.subscribe({ next: (v) => console.log(v) });
    sub.next(value);
    expect(console.log).toHaveBeenNthCalledWith(1, true);
    prop.subscribe({ next: (v) => console.log(v) });
    expect(console.log).toHaveBeenNthCalledWith(2, true);
  });

  it(`containsAll(path) returns true if the environment property path exists`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue(envB1);
    expect(query.containsAll('a.c')).toBeTrue();
    expect(query.containsAll(['a', 'c'])).toBeTrue();
  });

  it(`containsAll(...paths) returns true if all the environment property paths exists`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue(envB1);
    expect(query.containsAll('a.c', 'b')).toBeTrue();
    expect(query.containsAll(['a', 'c'], 'b')).toBeTrue();
  });

  it(`containsAll(path) returns false if the environment property path doesn't exist`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue(envA1);
    expect(query.containsAll('z')).toBeFalse();
  });

  it(`containsAll(...paths) returns false if an environment property path doesn't exist`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue(envA1);
    expect(query.containsAll('a.a', 'z')).toBeFalse();
  });

  // containsSome

  it(
    `containsSome$(path) returns if the distinct environment property path is available for resolution as Observable`,
    marbles((m) => {
      const source = m.cold('-a-b-c-d-a-|', { a: envA1, b: envA2, c: envB1, d: envB2 });
      const expected = m.cold('-t---f---t-|', { t: true, f: false });
      jest.spyOn(store, 'getAll$').mockReturnValue(source);
      m.expect(query.containsSome$('a.a')).toBeObservable(expected);
    }),
  );

  it(
    `containsSome$(path, ...paths) returns if some distinct environment property paths are available for resolution as Observable`,
    marbles((m) => {
      const source = m.cold('-a-b-c-d-a-|', { a: envA1, b: envA2, c: envB1, d: envB2 });
      const expected = m.cold('-t---f---t-|', { t: true, f: false });
      jest.spyOn(store, 'getAll$').mockReturnValue(source);
      m.expect(query.containsSome$('a.a', 'z')).toBeObservable(expected);
    }),
  );

  it(`containsSome$(path) returns always the last value`, () => {
    const sub = new Subject<Properties>();
    const value = { a: 0 };
    jest.spyOn(console, 'log').mockImplementation(() => null);
    jest.spyOn(store, 'getAll$').mockReturnValue(sub);
    const prop = query.containsSome$('a');
    prop.subscribe({ next: (v) => console.log(v) });
    sub.next(value);
    expect(console.log).toHaveBeenNthCalledWith(1, true);
    prop.subscribe({ next: (v) => console.log(v) });
    expect(console.log).toHaveBeenNthCalledWith(2, true);
  });

  it(`containsSome(path) returns true if the environment property path exists`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue(envA1);
    expect(query.containsSome('a.a')).toBeTrue();
  });

  it(`containsSome(path, ...paths) returns true if some environment property paths exists`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue(envA1);
    expect(query.containsSome('a.a', 'z')).toBeTrue();
  });

  it(`containsSome(path) returns false if the environment property path doesn't exist`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue(envA1);
    expect(query.containsSome('z')).toBeFalse();
  });

  it(`containsSome(path, ...paths) returns false if all the environment property paths doesn't exist`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue(envA1);
    expect(query.containsSome('a.z', 'z')).toBeFalse();
  });

  // getRequired

  it(
    `getRequired$(path) returns the distinct required environment property at path as Observable or error if do not exists`,
    marbles((m) => {
      const source = m.cold('-a-b-c-d-a-|', { a: envA1, b: envA2, c: envB1, d: envB2 });
      const expected = m.cold(
        '-a---#',
        { a: 0 },
        new Error('The environment property at path "a.a" is required and is undefined'),
      );
      jest.spyOn(store, 'getAll$').mockReturnValue(source);
      m.expect(query.getRequired$('a.a')).toBeObservable(expected);
    }),
  );

  it(
    `getRequired$(path, defaultValue) returns the distinct required environment property at path as Observable`,
    marbles((m) => {
      const source = m.cold('-a-b-c-d-a-|', { a: envA1, b: envA2, c: envB1, d: envB2 });
      const expected = m.cold('-a---b---a-|', { a: 0, b: 'def' });
      jest.spyOn(store, 'getAll$').mockReturnValue(source);
      m.expect(query.getRequired$('a.a', 'def')).toBeObservable(expected);
    }),
  );

  it(`getRequired$(path, defaultValue) returns always the last value`, () => {
    const sub = new Subject<Properties>();
    const value = { a: 0 };
    jest.spyOn(console, 'log').mockImplementation(() => null);
    jest.spyOn(store, 'getAll$').mockReturnValue(sub);
    const prop = query.getRequired$('a', 1);
    prop.subscribe({ next: (v) => console.log(v) });
    sub.next(value);
    expect(console.log).toHaveBeenNthCalledWith(1, value.a);
    prop.subscribe({ next: (v) => console.log(v) });
    expect(console.log).toHaveBeenNthCalledWith(2, value.a);
  });

  it(`getRequired(path) returns the the value at path if exists`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue(envA1);
    expect(query.getRequired('a.a')).toEqual(0);
  });

  it(`getRequired(path) throws if the path cannot be resolved`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue(envA1);
    expect(() => query.getRequired('a.z')).toThrowError(
      'The environment property at path "a.z" is required and is undefined',
    );
  });

  it(`getRequired(path, defaultValue) returns the the value at path if exists`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue(envA1);
    expect(query.getRequired('a.a', 'def')).toEqual(0);
  });

  it(`getRequired(path, defaultValue) returns the defaultValue if the path cannot be resolved`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue(envA1);
    expect(query.getRequired('a.z', 'def')).toEqual('def');
  });

  // getTyped

  it(
    `getTyped$(path, targetType) returns the distinct typed environment property at path as Observable`,
    marbles((m) => {
      const source = m.cold('-a-b-c-d-a-|', { a: envA1, b: envA2, c: envB1, d: envB2 });
      const expected = m.cold('-a---b---a-|', { a: '0', b: undefined });
      jest.spyOn(store, 'getAll$').mockReturnValue(source);
      m.expect(query.getTyped$('a.a', String)).toBeObservable(expected);
    }),
  );

  it(`getTyped$(path, targetType) returns always the last value`, () => {
    const sub = new Subject<Properties>();
    const value = { a: 0 };
    jest.spyOn(console, 'log').mockImplementation(() => null);
    jest.spyOn(store, 'getAll$').mockReturnValue(sub);
    const prop = query.getTyped$('a', (v) => v);
    prop.subscribe({ next: (v) => console.log(v) });
    sub.next(value);
    expect(console.log).toHaveBeenNthCalledWith(1, value.a);
    prop.subscribe({ next: (v) => console.log(v) });
    expect(console.log).toHaveBeenNthCalledWith(2, value.a);
  });

  it(`getTyped(path, targetType) returns undefined if the path cannot be resolved`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue(envA1);
    expect(query.getTyped('a.z', (value) => value)).toBeUndefined();
  });

  // getRequiredTyped

  it(
    `getRequiredTyped$(path, targetType) returns the distinct required typed environment property at path as Observable or error if do not exists`,
    marbles((m) => {
      const source = m.cold('-a-b-c-d-a-|', { a: envA1, b: envA2, c: envB1, d: envB2 });
      const expected = m.cold(
        '-a---#',
        { a: '0' },
        new Error('The environment property at path "a.a" is required and is undefined'),
      );
      jest.spyOn(store, 'getAll$').mockReturnValue(source);
      m.expect(query.getRequiredTyped$('a.a', String)).toBeObservable(expected);
    }),
  );

  it(
    `getRequiredTyped$(path, targetType, defaultValue) returns the distinct required typed environment property at path as Observable`,
    marbles((m) => {
      const source = m.cold('-a-b-c-d-a-|', { a: envA1, b: envA2, c: envB1, d: envB2 });
      const expected = m.cold('-a---b---a-|', { a: '0', b: '1' });
      jest.spyOn(store, 'getAll$').mockReturnValue(source);
      m.expect(query.getRequiredTyped$('a.a', String, 1)).toBeObservable(expected);
    }),
  );

  it(`getRequiredTyped$(path, targetType, defaultValue) returns always the last value`, () => {
    const sub = new Subject<Properties>();
    const value = { a: 0 };
    jest.spyOn(console, 'log').mockImplementation(() => null);
    jest.spyOn(store, 'getAll$').mockReturnValue(sub);
    const prop = query.getRequiredTyped$('a', (v) => v, 1);
    prop.subscribe({ next: (v) => console.log(v) });
    sub.next(value);
    expect(console.log).toHaveBeenNthCalledWith(1, value.a);
    prop.subscribe({ next: (v) => console.log(v) });
    expect(console.log).toHaveBeenNthCalledWith(2, value.a);
  });

  it(`getRequiredTyped(path, targetType) returns the the value at path converted to the targetType if exists`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue(envA1);
    expect(query.getRequiredTyped('a.a', String)).toEqual('0');
  });

  it(`getRequiredTyped(path, targetType) throws if the path cannot be resolved`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue(envA1);
    expect(() => query.getRequiredTyped('a.z', String)).toThrowError(
      'The environment property at path "a.z" is required and is undefined',
    );
  });

  it(`getRequiredTyped(path, targetType, defaultValue) returns the the value at path converted to the targetType if exists`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue(envA1);
    expect(query.getRequiredTyped('a.a', String, 1)).toEqual('0');
  });

  it(`getRequiredTyped(path, targetType, defaultValue) returns the defaultValue converted to the targetType if the path cannot be resolved`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue(envA1);
    expect(query.getRequiredTyped('a.z', String, 1)).toEqual('1');
  });

  // getTranspiled

  it(
    `getTranspiled$(path) returns the distinct environment property at path as Observable`,
    marbles((m) => {
      const source = m.cold('-a-b-c-d-a-|', { a: envA1, b: envA2, c: envB1, d: envB2 });
      const expected = m.cold('-a---b---a-|', { a: 0, b: undefined });
      jest.spyOn(store, 'getAll$').mockReturnValue(source);
      m.expect(query.getTranspiled$('a.a')).toBeObservable(expected);
    }),
  );

  it(`getTranspiled$(path) returns always the last value`, () => {
    const sub = new Subject<Properties>();
    const value = { a: 0 };
    jest.spyOn(console, 'log').mockImplementation(() => null);
    jest.spyOn(store, 'getAll$').mockReturnValue(sub);
    const prop = query.getTranspiled$('a');
    prop.subscribe({ next: (v) => console.log(v) });
    sub.next(value);
    expect(console.log).toHaveBeenNthCalledWith(1, value.a);
    prop.subscribe({ next: (v) => console.log(v) });
    expect(console.log).toHaveBeenNthCalledWith(2, value.a);
  });

  it(`getTranspiled$(path) returns untranspiled string if no useEnvironmentToTranspile`, (done) => {
    jest.spyOn(store, 'getAll$').mockReturnValue(of(envA1));
    jest.spyOn(store, 'getAll').mockReturnValue(envA1);
    (query as any)['config'].useEnvironmentToTranspile = false;
    query.getTranspiled$('b').subscribe({
      next: (value) => {
        expect(value).toEqual(envA1.b);
        done();
      },
    });
  });

  it(`getTranspiled$(path) returns transpiled if useEnvironmentToTranspile`, (done) => {
    jest.spyOn(store, 'getAll$').mockReturnValue(of(envA1));
    jest.spyOn(store, 'getAll').mockReturnValue(envA1);
    (query as any)['config'].useEnvironmentToTranspile = true;
    query.getTranspiled$('b').subscribe({
      next: (value) => {
        expect(value).toEqual('0');
        done();
      },
    });
  });

  it(`getTranspiled$(path, properties) returns transpiled if no useEnvironmentToTranspile`, (done) => {
    jest.spyOn(store, 'getAll$').mockReturnValue(of(envA1));
    jest.spyOn(store, 'getAll').mockReturnValue(envA1);
    (query as any)['config'].useEnvironmentToTranspile = false;
    query.getTranspiled$('b', { a: { a: 1 } }).subscribe({
      next: (value) => {
        expect(value).toEqual('1');
        done();
      },
    });
  });

  it(`getTranspiled$(path, properties) returns transpiled if useEnvironmentToTranspile`, (done) => {
    jest.spyOn(store, 'getAll$').mockReturnValue(of(envA1));
    jest.spyOn(store, 'getAll').mockReturnValue(envA1);
    (query as any)['config'].useEnvironmentToTranspile = true;
    query.getTranspiled$('b', { a: { a: 1 } }).subscribe({
      next: (value) => {
        expect(value).toEqual('1');
        done();
      },
    });
  });

  it(`getTranspiled$(path, properties, config) returns transpiled using custom config`, (done) => {
    jest.spyOn(store, 'getAll$').mockReturnValue(of(envA1));
    jest.spyOn(store, 'getAll').mockReturnValue(envA1);
    (query as any)['config'].useEnvironmentToTranspile = false;
    query.getTranspiled$('b', {}, { useEnvironmentToTranspile: true }).subscribe({
      next: (value) => {
        expect(value).toEqual('0');
        done();
      },
    });
  });

  it(`getTranspiled$(path) returns transpiled object`, (done) => {
    const env = { a: { a: 0 }, b: '{{ a }}' };
    jest.spyOn(store, 'getAll$').mockReturnValue(of(env));
    jest.spyOn(store, 'getAll').mockReturnValue(env);
    (query as any)['config'].useEnvironmentToTranspile = true;
    query.getTranspiled$('b').subscribe({
      next: (value) => {
        expect(value).toEqual('{"a":0}');
        done();
      },
    });
  });

  it(`getTranspiled$(path) returns transpiled with custom interpolation`, (done) => {
    const env = { a: { a: 0 }, b: '[< a.a >]' };
    jest.spyOn(store, 'getAll$').mockReturnValue(of(env));
    jest.spyOn(store, 'getAll').mockReturnValue(env);
    (query as any)['config'].useEnvironmentToTranspile = true;
    (query as any)['config'].interpolation = ['[<', '>]'];
    query.getTranspiled$('b').subscribe({
      next: (value) => {
        expect(value).toEqual('0');
        done();
      },
    });
  });

  it(`getTranspiled$(path, properties, config) returns transpiled with custom interpolation`, (done) => {
    const env = { a: { a: 0 }, b: '[< a.a >]' };
    jest.spyOn(store, 'getAll$').mockReturnValue(of(env));
    jest.spyOn(store, 'getAll').mockReturnValue(env);
    (query as any)['config'].useEnvironmentToTranspile = true;
    query.getTranspiled$('b', {}, { interpolation: ['[<', '>]'] }).subscribe({
      next: (value) => {
        expect(value).toEqual('0');
        done();
      },
    });
  });

  it(`getTranspiled$(path) returns transpiled with weird space interpolation`, (done) => {
    const env = { a: { a: 0 }, b: '{{    a.a}}' };
    jest.spyOn(store, 'getAll$').mockReturnValue(of(env));
    jest.spyOn(store, 'getAll').mockReturnValue(env);
    (query as any)['config'].useEnvironmentToTranspile = true;
    query.getTranspiled$('b').subscribe({
      next: (value) => {
        expect(value).toEqual('0');
        done();
      },
    });
  });

  it(`getTranspiled(path) returns undefined if the path cannot be resolved`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue(envA1);
    expect(query.getTranspiled('a.z')).toBeUndefined();
  });

  it(`getTranspiled(path) returns untranspiled string if no useEnvironmentToTranspile`, () => {
    jest.spyOn(store, 'getAll$').mockReturnValue(of(envA1));
    jest.spyOn(store, 'getAll').mockReturnValue(envA1);
    (query as any)['config'].useEnvironmentToTranspile = false;
    expect(query.getTranspiled('b')).toEqual(envA1.b);
  });

  it(`getTranspiled(path) returns transpiled if useEnvironmentToTranspile`, () => {
    jest.spyOn(store, 'getAll$').mockReturnValue(of(envA1));
    jest.spyOn(store, 'getAll').mockReturnValue(envA1);
    (query as any)['config'].useEnvironmentToTranspile = true;
    expect(query.getTranspiled('b')).toEqual('0');
  });

  it(`getTranspiled(path, properties) returns transpiled if no useEnvironmentToTranspile`, () => {
    jest.spyOn(store, 'getAll$').mockReturnValue(of(envA1));
    jest.spyOn(store, 'getAll').mockReturnValue(envA1);
    (query as any)['config'].useEnvironmentToTranspile = false;
    expect(query.getTranspiled('b', { a: { a: 1 } })).toEqual('1');
  });

  it(`getTranspiled(path, properties) returns transpiled if useEnvironmentToTranspile`, () => {
    jest.spyOn(store, 'getAll$').mockReturnValue(of(envA1));
    jest.spyOn(store, 'getAll').mockReturnValue(envA1);
    (query as any)['config'].useEnvironmentToTranspile = true;
    expect(query.getTranspiled('b', { a: { a: 1 } })).toEqual('1');
  });

  it(`getTranspiled(path, properties, config) returns transpiled using custom config`, () => {
    jest.spyOn(store, 'getAll$').mockReturnValue(of(envA1));
    jest.spyOn(store, 'getAll').mockReturnValue(envA1);
    (query as any)['config'].useEnvironmentToTranspile = false;
    expect(query.getTranspiled('b', {}, { useEnvironmentToTranspile: true })).toEqual('0');
  });

  it(`getTranspiled(path) returns transpiled object`, () => {
    const env = { a: { a: 0 }, b: '{{ a }}' };
    jest.spyOn(store, 'getAll$').mockReturnValue(of(env));
    jest.spyOn(store, 'getAll').mockReturnValue(env);
    (query as any)['config'].useEnvironmentToTranspile = true;
    expect(query.getTranspiled('b')).toEqual('{"a":0}');
  });

  it(`getTranspiled(path) returns transpiled with custom interpolation`, () => {
    const env = { a: { a: 0 }, b: '[< a.a >]' };
    jest.spyOn(store, 'getAll$').mockReturnValue(of(env));
    jest.spyOn(store, 'getAll').mockReturnValue(env);
    (query as any)['config'].useEnvironmentToTranspile = true;
    (query as any)['config'].interpolation = ['[<', '>]'];
    expect(query.getTranspiled('b')).toEqual('0');
  });

  it(`getTranspiled(path, properties, config) returns transpiled with custom interpolation`, () => {
    const env = { a: { a: 0 }, b: '[< a.a >]' };
    jest.spyOn(store, 'getAll$').mockReturnValue(of(env));
    jest.spyOn(store, 'getAll').mockReturnValue(env);
    (query as any)['config'].useEnvironmentToTranspile = true;
    expect(query.getTranspiled('b', {}, { interpolation: ['[<', '>]'] })).toEqual('0');
  });

  it(`getTranspiled(path) returns transpiled with weird space interpolation`, () => {
    const env = { a: { a: 0 }, b: '{{   a.a}}' };
    jest.spyOn(store, 'getAll$').mockReturnValue(of(env));
    jest.spyOn(store, 'getAll').mockReturnValue(env);
    (query as any)['config'].useEnvironmentToTranspile = true;
    expect(query.getTranspiled('b')).toEqual('0');
  });

  // getRequiredTranspiled

  it(
    `getRequiredTranspiled$(path) returns the distinct required environment property at path as Observable or error if do not exists`,
    marbles((m) => {
      const source = m.cold('-a-b-c-d-a-|', { a: envA1, b: envA2, c: envB1, d: envB2 });
      const expected = m.cold(
        '-a---#',
        { a: 0 },
        new Error('The environment property at path "a.a" is required and is undefined'),
      );
      jest.spyOn(store, 'getAll$').mockReturnValue(source);
      m.expect(query.getRequiredTranspiled$('a.a')).toBeObservable(expected);
    }),
  );

  it(
    `getRequiredTranspiled$(path, defaultValue) returns the distinct required environment property at path as Observable`,
    marbles((m) => {
      const source = m.cold('-a-b-c-d-a-|', { a: envA1, b: envA2, c: envB1, d: envB2 });
      const expected = m.cold('-a---b---a-|', { a: 0, b: 'def' });
      jest.spyOn(store, 'getAll$').mockReturnValue(source);
      m.expect(query.getRequiredTranspiled$('a.a', 'def')).toBeObservable(expected);
    }),
  );

  it(`getRequiredTranspiled$(path, defaultValue) returns always the last value`, () => {
    const sub = new Subject<Properties>();
    const value = { a: 0 };
    jest.spyOn(console, 'log').mockImplementation(() => null);
    jest.spyOn(store, 'getAll$').mockReturnValue(sub);
    const prop = query.getRequiredTranspiled$('a', 1);
    prop.subscribe({ next: (v) => console.log(v) });
    sub.next(value);
    expect(console.log).toHaveBeenNthCalledWith(1, value.a);
    prop.subscribe({ next: (v) => console.log(v) });
    expect(console.log).toHaveBeenNthCalledWith(2, value.a);
  });

  it(`getRequiredTranspiled$(path, defaultValue) returns untranspiled string if no useEnvironmentToTranspile`, (done) => {
    jest.spyOn(store, 'getAll$').mockReturnValue(of(envA1));
    jest.spyOn(store, 'getAll').mockReturnValue(envA1);
    (query as any)['config'].useEnvironmentToTranspile = false;
    query.getRequiredTranspiled$('b', 2).subscribe({
      next: (value) => {
        expect(value).toEqual(envA1.b);
        done();
      },
    });
  });

  it(`getRequiredTranspiled$(path, defaultValue) returns transpiled if useEnvironmentToTranspile`, (done) => {
    jest.spyOn(store, 'getAll$').mockReturnValue(of(envA1));
    jest.spyOn(store, 'getAll').mockReturnValue(envA1);
    (query as any)['config'].useEnvironmentToTranspile = true;
    query.getRequiredTranspiled$('b', 2).subscribe({
      next: (value) => {
        expect(value).toEqual('0');
        done();
      },
    });
  });

  it(`getRequiredTranspiled$(path, defaultValue, properties) returns transpiled if no useEnvironmentToTranspile`, (done) => {
    jest.spyOn(store, 'getAll$').mockReturnValue(of(envA1));
    jest.spyOn(store, 'getAll').mockReturnValue(envA1);
    (query as any)['config'].useEnvironmentToTranspile = false;
    query.getRequiredTranspiled$('b', 2, { a: { a: 1 } }).subscribe({
      next: (value) => {
        expect(value).toEqual('1');
        done();
      },
    });
  });

  it(`getRequiredTranspiled$(path, defaultValue, properties) returns transpiled if useEnvironmentToTranspile`, (done) => {
    jest.spyOn(store, 'getAll$').mockReturnValue(of(envA1));
    jest.spyOn(store, 'getAll').mockReturnValue(envA1);
    (query as any)['config'].useEnvironmentToTranspile = true;
    query.getRequiredTranspiled$('b', 2, { a: { a: 1 } }).subscribe({
      next: (value) => {
        expect(value).toEqual('1');
        done();
      },
    });
  });

  it(`getRequiredTranspiled$(path, defaultValue, properties, config) returns transpiled using custom config`, (done) => {
    jest.spyOn(store, 'getAll$').mockReturnValue(of(envA1));
    jest.spyOn(store, 'getAll').mockReturnValue(envA1);
    (query as any)['config'].useEnvironmentToTranspile = false;
    query.getRequiredTranspiled$('b', 2, {}, { useEnvironmentToTranspile: true }).subscribe({
      next: (value) => {
        expect(value).toEqual('0');
        done();
      },
    });
  });

  it(`getRequiredTranspiled$(path, defaultValue) returns transpiled object`, (done) => {
    const env = { a: { a: 0 }, b: '{{ a }}' };
    jest.spyOn(store, 'getAll$').mockReturnValue(of(env));
    jest.spyOn(store, 'getAll').mockReturnValue(env);
    (query as any)['config'].useEnvironmentToTranspile = true;
    query.getRequiredTranspiled$('b', 2).subscribe({
      next: (value) => {
        expect(value).toEqual('{"a":0}');
        done();
      },
    });
  });

  it(`getRequiredTranspiled$(path, defaultValue) returns transpiled with custom interpolation`, (done) => {
    const env = { a: { a: 0 }, b: '[< a.a >]' };
    jest.spyOn(store, 'getAll$').mockReturnValue(of(env));
    jest.spyOn(store, 'getAll').mockReturnValue(env);
    (query as any)['config'].useEnvironmentToTranspile = true;
    (query as any)['config'].interpolation = ['[<', '>]'];
    query.getRequiredTranspiled$('b', 2).subscribe({
      next: (value) => {
        expect(value).toEqual('0');
        done();
      },
    });
  });

  it(`getRequiredTranspiled$(path, defaultValue, properties, config) returns transpiled with custom interpolation`, (done) => {
    const env = { a: { a: 0 }, b: '[< a.a >]' };
    jest.spyOn(store, 'getAll$').mockReturnValue(of(env));
    jest.spyOn(store, 'getAll').mockReturnValue(env);
    (query as any)['config'].useEnvironmentToTranspile = true;
    query.getRequiredTranspiled$('b', 2, {}, { interpolation: ['[<', '>]'] }).subscribe({
      next: (value) => {
        expect(value).toEqual('0');
        done();
      },
    });
  });

  it(`getRequiredTranspiled$(path, defaultValue) returns transpiled with weird space interpolation`, (done) => {
    const env = { a: { a: 0 }, b: '{{    a.a}}' };
    jest.spyOn(store, 'getAll$').mockReturnValue(of(env));
    jest.spyOn(store, 'getAll').mockReturnValue(env);
    (query as any)['config'].useEnvironmentToTranspile = true;
    query.getRequiredTranspiled$('b', 2).subscribe({
      next: (value) => {
        expect(value).toEqual('0');
        done();
      },
    });
  });

  it(`getRequiredTranspiled(path) throws if the path cannot be resolved`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue(envA1);
    expect(() => query.getRequiredTranspiled('a.z')).toThrowError(
      'The environment property at path "a.z" is required and is undefined',
    );
  });

  it(`getRequiredTranspiled(path, defaultValue) returns the defaultValue if the path cannot be resolved`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue(envA1);
    expect(query.getRequiredTranspiled('a.z', 'def')).toEqual('def');
  });

  it(`getRequiredTranspiled(path, defaultValue) returns untranspiled string if no useEnvironmentToTranspile`, () => {
    jest.spyOn(store, 'getAll$').mockReturnValue(of(envA1));
    jest.spyOn(store, 'getAll').mockReturnValue(envA1);
    (query as any)['config'].useEnvironmentToTranspile = false;
    expect(query.getRequiredTranspiled('b', 2)).toEqual(envA1.b);
  });

  it(`getRequiredTranspiled(path, defaultValue) returns transpiled if useEnvironmentToTranspile`, () => {
    jest.spyOn(store, 'getAll$').mockReturnValue(of(envA1));
    jest.spyOn(store, 'getAll').mockReturnValue(envA1);
    (query as any)['config'].useEnvironmentToTranspile = true;
    expect(query.getRequiredTranspiled('b', 2)).toEqual('0');
  });

  it(`getRequiredTranspiled(path, defaultValue, properties) returns transpiled if no useEnvironmentToTranspile`, () => {
    jest.spyOn(store, 'getAll$').mockReturnValue(of(envA1));
    jest.spyOn(store, 'getAll').mockReturnValue(envA1);
    (query as any)['config'].useEnvironmentToTranspile = false;
    expect(query.getRequiredTranspiled('b', 2, { a: { a: 1 } })).toEqual('1');
  });

  it(`getRequiredTranspiled(path, defaultValue, properties) returns transpiled if useEnvironmentToTranspile`, () => {
    jest.spyOn(store, 'getAll$').mockReturnValue(of(envA1));
    jest.spyOn(store, 'getAll').mockReturnValue(envA1);
    (query as any)['config'].useEnvironmentToTranspile = true;
    expect(query.getRequiredTranspiled('b', 2, { a: { a: 1 } })).toEqual('1');
  });

  it(`getRequiredTranspiled(path, defaultValue, properties, config) returns transpiled using custom config`, () => {
    jest.spyOn(store, 'getAll$').mockReturnValue(of(envA1));
    jest.spyOn(store, 'getAll').mockReturnValue(envA1);
    (query as any)['config'].useEnvironmentToTranspile = false;
    expect(query.getRequiredTranspiled('b', 2, {}, { useEnvironmentToTranspile: true })).toEqual('0');
  });

  it(`getRequiredTranspiled(path, defaultValue) returns transpiled object`, () => {
    const env = { a: { a: 0 }, b: '{{ a }}' };
    jest.spyOn(store, 'getAll$').mockReturnValue(of(env));
    jest.spyOn(store, 'getAll').mockReturnValue(env);
    (query as any)['config'].useEnvironmentToTranspile = true;
    expect(query.getRequiredTranspiled('b', 2)).toEqual('{"a":0}');
  });

  it(`getRequiredTranspiled(path, defaultValue) returns transpiled with custom interpolation`, () => {
    const env = { a: { a: 0 }, b: '[< a.a >]' };
    jest.spyOn(store, 'getAll$').mockReturnValue(of(env));
    jest.spyOn(store, 'getAll').mockReturnValue(env);
    (query as any)['config'].useEnvironmentToTranspile = true;
    (query as any)['config'].interpolation = ['[<', '>]'];
    expect(query.getRequiredTranspiled('b', 2)).toEqual('0');
  });

  it(`getRequiredTranspiled(path, defaultValue, properties, config) returns transpiled with custom interpolation`, () => {
    const env = { a: { a: 0 }, b: '[< a.a >]' };
    jest.spyOn(store, 'getAll$').mockReturnValue(of(env));
    jest.spyOn(store, 'getAll').mockReturnValue(env);
    (query as any)['config'].useEnvironmentToTranspile = true;
    expect(query.getRequiredTranspiled('b', 2, {}, { interpolation: ['[<', '>]'] })).toEqual('0');
  });

  it(`getRequiredTranspiled(path, defaultValue) returns transpiled with weird space interpolation`, () => {
    const env = { a: { a: 0 }, b: '{{   a.a}}' };
    jest.spyOn(store, 'getAll$').mockReturnValue(of(env));
    jest.spyOn(store, 'getAll').mockReturnValue(env);
    (query as any)['config'].useEnvironmentToTranspile = true;
    expect(query.getRequiredTranspiled('b', 2)).toEqual('0');
  });

  describe('examples of use', () => {
    it(`returns as mutable`, (done) => {
      jest.spyOn(store, 'getAll').mockReturnValue(envA1);
      jest.spyOn(store, 'getAll$').mockReturnValue(of(envA1));
      expect(Object.isFrozen(envA1.a)).toBeTrue();

      const value = query.getTyped('a', asMutable);
      expect(value).toEqual(envA1.a);
      expect(Object.isFrozen(value)).toBeFalse();

      query
        .get$('a')
        .pipe(mapAsMutable())
        .subscribe({
          next: (_value) => {
            expect(_value).toEqual(envA1.a);
            expect(Object.isFrozen(_value)).toBeFalse();
            done();
          },
        });
    });
  });
});

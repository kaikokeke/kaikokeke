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
    `containsProperty$(path) returns if the path exists as observable`,
    marbles((m) => {
      jest.spyOn(store, 'getAll$').mockReturnValue(m.cold('-a-a-b-b-a-|', { a: { a: 0 }, b: { b: 0 } }));
      const expected = m.cold('-t---f---t-|', { t: true, f: false });
      m.expect(query.containsProperty$('a')).toBeObservable(expected);
    }),
  );

  it(`containsProperty(path) returns true if the path exists`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue({ a: { a: 0 } });
    expect(query.containsProperty('a.a')).toBeTrue();
  });

  it(`containsProperty(path) returns false if the path doesn't exist`, () => {
    jest.spyOn(store, 'getAll').mockReturnValue({ a: { a: 0 } });
    expect(query.containsProperty('a.b')).toBeFalse();
  });
});

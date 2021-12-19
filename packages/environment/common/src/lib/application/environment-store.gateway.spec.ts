import { BehaviorSubject, Observable } from 'rxjs';

import { Properties } from '../types';
import { EnvironmentStore } from './environment-store.gateway';

class TestEvironmentStore extends EnvironmentStore {
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

class RxjsEnvironmentStore extends EnvironmentStore {
  private readonly _properties: BehaviorSubject<Properties> = new BehaviorSubject({});

  getAll(): Properties {
    return this._properties.getValue();
  }

  getAll$(): Observable<Properties> {
    return this._properties.asObservable();
  }

  update(properties: Properties): void {
    this._properties.next(properties);
  }

  reset(): void {
    this._properties.next({});
  }
}

let _rxjsProperties = new BehaviorSubject({});
const rxjsEnvironmentStore = {
  getAll: () => _rxjsProperties.getValue(),
  getAll$: () => _rxjsProperties.asObservable(),
  update: (properties) => {
    _rxjsProperties.next(properties);
  },
  reset: () => {
    _rxjsProperties.next({});
  },
};

describe('EnvironmentStore', () => {
  let store: EnvironmentStore;

  beforeEach(() => {
    store = new TestEvironmentStore();
  });

  it(`getAll$() is a defined method`, () => {
    expect(store.getAll$).toBeFunction();
  });

  it(`getAll() is a defined method`, () => {
    expect(store.getAll).toBeFunction();
  });

  it(`update() is a defined method`, () => {
    expect(store.update).toBeFunction();
  });

  it(`reset() is a defined method`, () => {
    expect(store.reset).toBeFunction();
  });

  describe('examples of use', () => {
    const testExampleImplementation = () => {
      it(`getAll$() returns the environment properties as Observable that emits on every environment change`, () => {
        const mock = jest.fn();
        jest.useFakeTimers();
        expect(mock).not.toHaveBeenCalled();
        store.getAll$().subscribe((value) => mock(value));
        jest.runAllTimers();
        expect(mock).toHaveBeenNthCalledWith(1, {});
        expect(mock).toHaveBeenCalledTimes(1);
        store.update({ a: 0 });
        jest.runAllTimers();
        expect(mock).toHaveBeenNthCalledWith(2, { a: 0 });
        expect(mock).toHaveBeenCalledTimes(2);
        store.update({ a: 0 });
        jest.runAllTimers();
        expect(mock).toHaveBeenNthCalledWith(3, { a: 0 });
        expect(mock).toHaveBeenCalledTimes(3);
      });

      it(`getAll() returns the environment properties`, () => {
        expect(store.getAll()).toEqual({});
        store.update({ a: 0 });
        expect(store.getAll()).toEqual({ a: 0 });
      });

      it(`update(properties) updates the properties in the environment store`, () => {
        expect(store.getAll()).toEqual({});
        store.update({ a: 0 });
        expect(store.getAll()).toEqual({ a: 0 });
        store.update({ b: 0 });
        expect(store.getAll()).toEqual({ b: 0 });
      });

      it(`reset() resets the environment store to the initial state`, () => {
        expect(store.getAll()).toEqual({});
        store.update({ a: 0 });
        expect(store.getAll()).toEqual({ a: 0 });
        store.reset();
        expect(store.getAll()).toEqual({});
      });
    };

    describe(`using a TypeScript basic RxJS State Manager`, () => {
      beforeEach(() => {
        store = new RxjsEnvironmentStore();
      });

      testExampleImplementation();
    });
  });
});

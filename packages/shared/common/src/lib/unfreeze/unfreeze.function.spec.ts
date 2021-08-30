import { AnyMap } from '@kaikokeke/devtools';

import { unfreeze } from './unfreeze.function';

const obj = Object.freeze({ a: 0, b: Object.freeze({ b: 0 }) });

describe('unfreeze()', () => {
  it(`returns the unfreezed value`, () => {
    const v = unfreeze(obj);
    expect(Object.isFrozen(v)).toEqual(false);
    expect(Object.isFrozen(v.b)).toEqual(false);
  });

  new AnyMap().entries().forEach((value) => {
    it(`returns the value for non freezed "${value.description}"`, () => {
      const v = unfreeze(value.value);
      expect(v).toEqual(value.value);
    });
  });

  const emptyObject = new AnyMap()
    .includes('object')
    .excludes('null')
    .excludes('Error')
    .excludes('function')
    .excludes('Element')
    .excludes('JSON')
    .excludes('Atomics')
    .excludes('Math')
    .excludes('WeakSet')
    .excludes('WeakMap')
    .excludes('SharedArrayBuffer')
    .excludes('BigUint64Array')
    .excludes('BigInt64Array');

  emptyObject.entries().forEach((value) => {
    it(`returns the unfreezed value for freezed "${value.description}"`, () => {
      const v = unfreeze(Object.freeze(value.value));
      expect(v).toEqual(value.value);
      expect(Object.isFrozen(v)).toEqual(false);
    });
  });

  new AnyMap()
    .includes('object')
    .excludes('null')
    .not(emptyObject)
    .entries()
    .forEach((value) => {
      it(`returns an unfreezed {} for freezed "${value.description}"`, () => {
        const v = unfreeze(Object.freeze(value.value));
        expect(v).toEqual({});
        expect(Object.isFrozen(v)).toEqual(false);
      });
    });
});

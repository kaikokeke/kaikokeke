import { AnyMap } from '@kaikokeke/devtools';

import { unfreeze } from './unfreeze.function';

const obj = Object.freeze({ a: 0, b: Object.freeze({ b: 0 }) });
const obj2 = { a: 0, b: Object.freeze({ b: 0 }) };

describe('unfreeze()', () => {
  it(`returns the unfreezed value`, () => {
    const v = unfreeze(obj);
    expect(Object.isFrozen(v)).toBeFalse();
    expect(Object.isFrozen(v.b)).toBeFalse();
  });

  it(`returns the unfreezed inner value`, () => {
    const v = unfreeze(obj2);
    expect(Object.isFrozen(v)).toBeFalse();
    expect(Object.isFrozen(v.b)).toBeFalse();
  });

  new AnyMap()
    .excludes('object')
    .excludes('function')
    .join(new AnyMap().includes('null'))
    .entries()
    .forEach((value) => {
      it(`returns the value for non object "${value.description}"`, () => {
        expect(Object.isFrozen(value.value)).toBeTrue();
        const v = unfreeze(Object.freeze(value.value));
        expect(v).toEqual(value.value);
        expect(Object.isFrozen(v)).toBeTrue();
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
      expect(Object.isFrozen(value.value)).toBeFalse();
      const v = unfreeze(Object.freeze(value.value));
      expect(v).toEqual(value.value);
      expect(Object.isFrozen(v)).toBeFalse();
    });
  });

  new AnyMap()
    .includes(['object', 'function'])
    .excludes('null')
    .not(emptyObject)
    .entries()
    .forEach((value) => {
      it(`returns as is for freezed "${value.description}"`, () => {
        expect(Object.isFrozen(value.value)).toBeFalse();
        const v = unfreeze(Object.freeze(value.value));
        expect(v).toEqual(value.value);
        expect(Object.isFrozen(v)).toBeTrue();
      });
    });
});

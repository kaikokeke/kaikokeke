import { isEqual } from 'lodash-es';

import { asMutable } from './as-mutable.function';

const obj = Object.freeze({ a: Object.freeze({ b: 0 }), b: '{{ a.b }}' });
const arr: ReadonlyArray<any> = Object.freeze([Object.freeze({ a: 0 }), Object.freeze({ b: 0 })]);

describe('asMutable(property)', () => {
  it(`returns non object values as is`, () => {
    expect(asMutable('a')).toEqual('a');
    expect(asMutable(0)).toEqual(0);
    expect(asMutable(true)).toEqual(true);
    expect(asMutable(null)).toEqual(null);
  });

  it(`returns the property as mutable if is an object`, () => {
    const value = asMutable(obj);
    expect(isEqual(value, obj)).toBeTrue();
    expect(Object.isFrozen(obj)).toBeTrue();
    expect(Object.isFrozen(obj.a)).toBeTrue();
    expect(Object.isFrozen(value)).toBeFalse();
    expect(Object.isFrozen(value.a)).toBeFalse();
  });

  it(`returns the property as mutable if is an Array`, () => {
    const value = asMutable(arr);
    expect(isEqual(value, arr)).toBeTrue();
    expect(Object.isFrozen(arr)).toBeTrue();
    expect(Object.isFrozen(arr[0])).toBeTrue();
    expect(Object.isFrozen(value)).toBeFalse();
    expect(Object.isFrozen(value[0])).toBeFalse();
  });

  it(`example of use`, () => {
    const value = asMutable(arr);
    value[0] = 0;
    value[1].b = 1;
    value.push(1);
    expect(value).toEqual([0, { b: 1 }, 1]);
  });
});

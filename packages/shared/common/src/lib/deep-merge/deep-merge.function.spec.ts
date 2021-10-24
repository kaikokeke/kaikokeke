import { deepMerge } from './deep-merge.function';

class A {
  a = 0;
}

class B {
  b = 0;
}

class C extends A {
  c = 0;

  test(): void {}
}

class D {
  d = 0;
}

class E extends D {
  e = 0;

  test(): void {}
}

describe('deepMerge(...sources)', () => {
  it(`returns an object with merged own enumerable string keyed properties`, () => {
    const a = { a: { a: 0 } };
    const b = { a: { b: 0 } };
    const result = { a: { a: 0, b: 0 } };
    expect(deepMerge(a, b)).toEqual(result);
  });

  it(`returns an object with merged inherited enumerable string keyed properties`, () => {
    const b = new B();
    const c = new C();
    const result = { a: 0, b: 0, c: 0 };
    expect(deepMerge(b, c)).toEqual(result);
  });

  it(`source properties that resolve to undefined are skipped if a destination value exists`, () => {
    const a = { a: { a: 0 } };
    const b = { a: { a: undefined } };
    const result = { a: { a: 0 } };
    expect(deepMerge(a, b)).toEqual(result);
  });

  it(`other objects and value types are overridden by assignment`, () => {
    const a = { a: { a: 0 } };
    const b = { a: { a: null } };
    const result = { a: { a: null } };
    expect(deepMerge(a, b)).toEqual(result);
  });

  it(`source objects are applied from left to right`, () => {
    const a = { a: { a: 0 } };
    const b = { a: { a: 1 } };
    const c = { a: { a: 2 } };
    const result = { a: { a: 2 } };
    expect(deepMerge(a, b, c)).toEqual(result);
  });

  it(`Array sources are merged with previous Array`, () => {
    const a = { a: [0] };
    const b = { a: [1] };
    const result = { a: [0, 1] };
    expect(deepMerge(a, b)).toEqual(result);
  });

  it(`Set sources are merged with previous Set`, () => {
    const a = { a: new Set([0]) };
    const b = { a: new Set([1]) };
    const result = { a: new Set([0, 1]) };
    expect(deepMerge(a, b)).toEqual(result);
  });

  it(`Map sources are merged with previous Map`, () => {
    const a = { a: new Map().set('a', 0) };
    const b = { a: new Map().set('b', 0) };
    const result = { a: new Map().set('a', 0).set('b', 0) };
    expect(deepMerge(a, b)).toEqual(result);
  });

  it(`Int8Array sources are merged with previous Int8Array`, () => {
    const a = { a: Int8Array.from([0]) };
    const b = { a: Int8Array.from([1]) };
    const result = { a: Int8Array.from([0, 1]) };
    expect(deepMerge(a, b)).toEqual(result);
  });

  it(`Int16Array sources are merged with previous Int16Array`, () => {
    const a = { a: Int16Array.from([0]) };
    const b = { a: Int16Array.from([1]) };
    const result = { a: Int16Array.from([0, 1]) };
    expect(deepMerge(a, b)).toEqual(result);
  });

  it(`Int32Array sources are merged with previous Int32Array`, () => {
    const a = { a: Int32Array.from([0]) };
    const b = { a: Int32Array.from([1]) };
    const result = { a: Int32Array.from([0, 1]) };
    expect(deepMerge(a, b)).toEqual(result);
  });

  it(`Uint8Array sources are merged with previous Uint8Array`, () => {
    const a = { a: Uint8Array.from([0]) };
    const b = { a: Uint8Array.from([1]) };
    const result = { a: Uint8Array.from([0, 1]) };
    expect(deepMerge(a, b)).toEqual(result);
  });

  it(`Uint8ClampedArray sources are merged with previous Uint8ClampedArray`, () => {
    const a = { a: Uint8ClampedArray.from([0]) };
    const b = { a: Uint8ClampedArray.from([1]) };
    const result = { a: Uint8ClampedArray.from([0, 1]) };
    expect(deepMerge(a, b)).toEqual(result);
  });

  it(`Uint16Array sources are merged with previous Uint16Array`, () => {
    const a = { a: Uint16Array.from([0]) };
    const b = { a: Uint16Array.from([1]) };
    const result = { a: Uint16Array.from([0, 1]) };
    expect(deepMerge(a, b)).toEqual(result);
  });

  it(`Uint32Array sources are merged with previous Uint32Array`, () => {
    const a = { a: Uint32Array.from([0]) };
    const b = { a: Uint32Array.from([1]) };
    const result = { a: Uint32Array.from([0, 1]) };
    expect(deepMerge(a, b)).toEqual(result);
  });

  it(`Float32Array sources are merged with previous Float32Array`, () => {
    const a = { a: Float32Array.from([0]) };
    const b = { a: Float32Array.from([1]) };
    const result = { a: Float32Array.from([0, 1]) };
    expect(deepMerge(a, b)).toEqual(result);
  });

  it(`Float64Array sources are merged with previous Float64Array`, () => {
    const a = { a: Float64Array.from([0]) };
    const b = { a: Float64Array.from([1]) };
    const result = { a: Float64Array.from([0, 1]) };
    expect(deepMerge(a, b)).toEqual(result);
  });

  it(`BigInt64Array sources are merged with previous BigInt64Array`, () => {
    const a = { a: BigInt64Array.from([BigInt(0)]) };
    const b = { a: BigInt64Array.from([BigInt(1)]) };
    const result = { a: BigInt64Array.from([BigInt(0), BigInt(1)]) };
    expect(deepMerge(a, b)).toEqual(result);
  });

  it(`BigUint64Array sources are merged with previous BigUint64Array`, () => {
    const a = { a: BigUint64Array.from([BigInt(0)]) };
    const b = { a: BigUint64Array.from([BigInt(1)]) };
    const result = { a: BigUint64Array.from([BigInt(0), BigInt(1)]) };
    expect(deepMerge(a, b)).toEqual(result);
  });

  describe('examples of use', () => {
    it(`complex deep merge`, () => {
      const a = { a: { a: [0] }, b: 1 };
      const b = { a: { a: [1] }, b: 0, c: { a: 0 } };
      const c = { a: { a: [1] }, b: undefined, c: { b: 1 } };
      const e = new E();
      const result = { a: { a: [0, 1, 1] }, b: 0, c: { a: 0, b: 1 }, d: 0, e: 0 };
      expect(deepMerge(a, b, c, e)).toEqual(result);
    });
  });
});

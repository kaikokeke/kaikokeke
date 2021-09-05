import { deepMerge } from './deep-merge.function';

describe('deepMerge(source1, source2, ...otherSources)', () => {
  it(`merges own enumerable string keyed properties`, () => {
    const a = { a: 0 };
    const b = { b: 0 };
    const result = { a: 0, b: 0 };
    expect(deepMerge(a, b)).toEqual(result);
  });

  it(`skips source properties that resolve to undefined if a destination value exists`, () => {
    const a = { a: { a: 0 } };
    const b = { a: { a: undefined } };
    const result = { a: { a: 0 } };
    expect(deepMerge(a, b)).toEqual(result);
  });

  it(`merges using otherSources`, () => {
    const a = { a: 0 };
    const b = { b: 0 };
    const c = { c: 0 };
    const d = { d: 0 };
    const result = { a: 0, b: 0, c: 0, d: 0 };
    expect(deepMerge(a, b, c, d)).toEqual(result);
  });

  it(`recursively merges plain object properties `, () => {
    const a = { a: { a: 0 } };
    const b = { a: { b: 0 } };
    const result = { a: { a: 0, b: 0 } };
    expect(deepMerge(a, b)).toEqual(result);
  });

  it(`recursively merges array properties`, () => {
    const a = { a: [0] };
    const b = { a: [1] };
    const result = { a: [0, 1] };
    expect(deepMerge(a, b)).toEqual(result);
  });

  it(`recursively merges Set properties`, () => {
    const a = { a: new Set([0]) };
    const b = { a: new Set([1]) };
    const result = { a: new Set([0, 1]) };
    expect(deepMerge(a, b)).toEqual(result);
  });

  it(`recursively merges Map properties`, () => {
    const a = { a: new Map().set('a', 0) };
    const b = { a: new Map().set('b', 0) };
    const result = { a: new Map().set('a', 0).set('b', 0) };
    expect(deepMerge(a, b)).toEqual(result);
  });

  it(`recursively merges Int8Array properties`, () => {
    const a = { a: Int8Array.from([0]) };
    const b = { a: Int8Array.from([1]) };
    const result = { a: Int8Array.from([0, 1]) };
    expect(deepMerge(a, b)).toEqual(result);
  });

  it(`recursively merges Int16Array properties`, () => {
    const a = { a: Int16Array.from([0]) };
    const b = { a: Int16Array.from([1]) };
    const result = { a: Int16Array.from([0, 1]) };
    expect(deepMerge(a, b)).toEqual(result);
  });

  it(`recursively merges Int32Array properties`, () => {
    const a = { a: Int32Array.from([0]) };
    const b = { a: Int32Array.from([1]) };
    const result = { a: Int32Array.from([0, 1]) };
    expect(deepMerge(a, b)).toEqual(result);
  });

  it(`recursively merges Uint8Array properties`, () => {
    const a = { a: Uint8Array.from([0]) };
    const b = { a: Uint8Array.from([1]) };
    const result = { a: Uint8Array.from([0, 1]) };
    expect(deepMerge(a, b)).toEqual(result);
  });

  it(`recursively merges Uint8ClampedArray properties`, () => {
    const a = { a: Uint8ClampedArray.from([0]) };
    const b = { a: Uint8ClampedArray.from([1]) };
    const result = { a: Uint8ClampedArray.from([0, 1]) };
    expect(deepMerge(a, b)).toEqual(result);
  });

  it(`recursively merges Uint16Array properties`, () => {
    const a = { a: Uint16Array.from([0]) };
    const b = { a: Uint16Array.from([1]) };
    const result = { a: Uint16Array.from([0, 1]) };
    expect(deepMerge(a, b)).toEqual(result);
  });

  it(`recursively merges Uint32Array properties`, () => {
    const a = { a: Uint32Array.from([0]) };
    const b = { a: Uint32Array.from([1]) };
    const result = { a: Uint32Array.from([0, 1]) };
    expect(deepMerge(a, b)).toEqual(result);
  });

  it(`recursively merges Float32Array properties`, () => {
    const a = { a: Float32Array.from([0]) };
    const b = { a: Float32Array.from([1]) };
    const result = { a: Float32Array.from([0, 1]) };
    expect(deepMerge(a, b)).toEqual(result);
  });

  it(`recursively merges Float64Array properties`, () => {
    const a = { a: Float64Array.from([0]) };
    const b = { a: Float64Array.from([1]) };
    const result = { a: Float64Array.from([0, 1]) };
    expect(deepMerge(a, b)).toEqual(result);
  });

  it(`recursively merges BigInt64Array properties`, () => {
    const a = { a: BigInt64Array.from([BigInt(0)]) };
    const b = { a: BigInt64Array.from([BigInt(1)]) };
    const result = { a: BigInt64Array.from([BigInt(0), BigInt(1)]) };
    expect(deepMerge(a, b)).toEqual(result);
  });

  it(`recursively merges BigUint64Array properties`, () => {
    const a = { a: BigUint64Array.from([BigInt(0)]) };
    const b = { a: BigUint64Array.from([BigInt(1)]) };
    const result = { a: BigUint64Array.from([BigInt(0), BigInt(1)]) };
    expect(deepMerge(a, b)).toEqual(result);
  });

  it(`merges source objects from left to right`, () => {
    const a = { a: { a: 0 } };
    const b = { a: { a: 1 } };
    const result = { a: { a: 1 } };
    expect(deepMerge(a, b)).toEqual(result);
  });

  describe('examples of use', () => {
    it(`complex deep merge`, () => {
      const a = { a: { a: [0] }, b: 1 };
      const b = { a: { a: [1] }, b: 0, c: { a: 0 } };
      const c = { a: { a: [1] }, b: undefined, c: { b: 1 } };
      const result = { a: { a: [0, 1, 1] }, b: 0, c: { a: 0, b: 1 } };
      expect(deepMerge(a, b, c)).toEqual(result);
    });
  });
});

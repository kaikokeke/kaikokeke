import { mergeDeep } from './merge-deep.function';

describe('mergeDeep(...sources)', () => {
  it(`merges own enumerable string keyed properties`, () => {
    expect(mergeDeep({ a: 0 }, { b: 0 })).toEqual({ a: 0, b: 0 });
  });

  it(`source properties that resolve to undefined are skipped if a destination value exists`, () => {
    const a = { a: { a: 0 } };
    const b = { a: { a: undefined } };
    expect(mergeDeep(a, b)).toEqual({ a: { a: 0 } });
  });

  it(`merges from multiple sources`, () => {
    expect(mergeDeep({ a: 0 }, { b: 0 }, { c: 0 })).toEqual({ a: 0, b: 0, c: 0 });
  });

  it(`plain object properties are merged recursively`, () => {
    const a = { a: { a: 0 } };
    const b = { a: { b: 0 } };
    expect(mergeDeep(a, b)).toEqual({ a: { a: 0, b: 0 } });
  });

  it(`array properties are merged recursively`, () => {
    const a = { a: [0] };
    const b = { a: [1] };
    expect(mergeDeep(a, b)).toEqual({ a: [0, 1] });
  });

  it(`set properties are merged recursively`, () => {
    const a = { a: new Set([0]) };
    const b = { a: new Set([1]) };
    expect(mergeDeep(a, b)).toEqual({ a: new Set([0, 1]) });
  });

  it(`map properties are merged recursively`, () => {
    const a = { a: new Map().set('a', 0) };
    const b = { a: new Map().set('b', 0) };
    expect(mergeDeep(a, b)).toEqual({ a: new Map().set('a', 0).set('b', 0) });
  });

  it(`Int8Array properties are merged recursively`, () => {
    const a = { a: Int8Array.from([0]) };
    const b = { a: Int8Array.from([1]) };
    expect(mergeDeep(a, b)).toEqual({ a: Int8Array.from([0, 1]) });
  });

  it(`Int16Array properties are merged recursively`, () => {
    const a = { a: Int16Array.from([0]) };
    const b = { a: Int16Array.from([1]) };
    expect(mergeDeep(a, b)).toEqual({ a: Int16Array.from([0, 1]) });
  });

  it(`Int32Array properties are merged recursively`, () => {
    const a = { a: Int32Array.from([0]) };
    const b = { a: Int32Array.from([1]) };
    expect(mergeDeep(a, b)).toEqual({ a: Int32Array.from([0, 1]) });
  });

  it(`Uint8Array properties are merged recursively`, () => {
    const a = { a: Uint8Array.from([0]) };
    const b = { a: Uint8Array.from([1]) };
    expect(mergeDeep(a, b)).toEqual({ a: Uint8Array.from([0, 1]) });
  });

  it(`Uint8ClampedArray properties are merged recursively`, () => {
    const a = { a: Uint8ClampedArray.from([0]) };
    const b = { a: Uint8ClampedArray.from([1]) };
    expect(mergeDeep(a, b)).toEqual({ a: Uint8ClampedArray.from([0, 1]) });
  });

  it(`Uint16Array properties are merged recursively`, () => {
    const a = { a: Uint16Array.from([0]) };
    const b = { a: Uint16Array.from([1]) };
    expect(mergeDeep(a, b)).toEqual({ a: Uint16Array.from([0, 1]) });
  });

  it(`Uint32Array properties are merged recursively`, () => {
    const a = { a: Uint32Array.from([0]) };
    const b = { a: Uint32Array.from([1]) };
    expect(mergeDeep(a, b)).toEqual({ a: Uint32Array.from([0, 1]) });
  });

  it(`Float32Array properties are merged recursively`, () => {
    const a = { a: Float32Array.from([0]) };
    const b = { a: Float32Array.from([1]) };
    expect(mergeDeep(a, b)).toEqual({ a: Float32Array.from([0, 1]) });
  });

  it(`Float64Array properties are merged recursively`, () => {
    const a = { a: Float64Array.from([0]) };
    const b = { a: Float64Array.from([1]) };
    expect(mergeDeep(a, b)).toEqual({ a: Float64Array.from([0, 1]) });
  });

  it(`BigInt64Array properties are merged recursively`, () => {
    const a = { a: BigInt64Array.from([BigInt(0)]) };
    const b = { a: BigInt64Array.from([BigInt(1)]) };
    expect(mergeDeep(a, b)).toEqual({ a: BigInt64Array.from([BigInt(0), BigInt(1)]) });
  });

  it(`BigUint64Array properties are merged recursively`, () => {
    const a = { a: BigUint64Array.from([BigInt(0)]) };
    const b = { a: BigUint64Array.from([BigInt(1)]) };
    expect(mergeDeep(a, b)).toEqual({ a: BigUint64Array.from([BigInt(0), BigInt(1)]) });
  });

  it(`source objects are applied from left to right`, () => {
    const a = { a: { a: 0 } };
    const b = { a: { a: 1 } };
    expect(mergeDeep(a, b)).toEqual({ a: { a: 1 } });
  });
});

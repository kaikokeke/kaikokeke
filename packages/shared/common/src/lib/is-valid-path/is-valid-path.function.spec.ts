import { AnyMap } from '@kaikokeke/devtools';

import { isValidPath } from './is-valid-path.function';

describe('isValidPath(value)', () => {
  it(`returns true for key`, () => {
    expect(isValidPath('a')).toBeTrue();
  });

  it(`returns true for complex key`, () => {
    expect(isValidPath('a.a')).toBeTrue();
  });

  it(`returns true for Array key`, () => {
    expect(isValidPath(['a'])).toBeTrue();
  });

  it(`returns true for Array complex key`, () => {
    expect(isValidPath(['a', 'a'])).toBeTrue();
  });

  it(`returns false for empty key`, () => {
    expect(isValidPath('')).toBeFalse();
  });

  it(`returns false for complex key with empty key`, () => {
    expect(isValidPath('a.')).toBeFalse();
    expect(isValidPath('a..a')).toBeFalse();
  });

  it(`returns false for empty Array`, () => {
    expect(isValidPath([])).toBeFalse();
  });

  it(`returns false for Array of no keys`, () => {
    expect(isValidPath([0, 'a'])).toBeFalse();
    expect(isValidPath([true, 'a'])).toBeFalse();
  });

  it(`returns false for Array with empty key`, () => {
    expect(isValidPath(['', 'a'])).toBeFalse();
  });

  it(`returns false for Array with complex key`, () => {
    expect(isValidPath(['a', 'a.a'])).toBeFalse();
  });

  it(`returns false for Array complex key with empty key`, () => {
    expect(isValidPath(['a', 'a.'])).toBeFalse();
    expect(isValidPath(['a', 'a..a'])).toBeFalse();
  });

  it(`returns false for any other type of value`, () => {
    new AnyMap()
      .excludes('string')
      .excludes('Array')
      .values()
      .forEach((v) => {
        expect(isValidPath(v)).toBeFalse();
      });
  });
});

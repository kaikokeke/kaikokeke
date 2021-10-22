import { AnyMap } from '@kaikokeke/devtools';

import { InvalidPathError, isPath } from './path.type';

describe('isPath(value)', () => {
  it(`returns true for non empty string`, () => {
    expect(isPath('a')).toBeTrue();
  });

  it(`returns true for non empty Array of strings`, () => {
    expect(isPath(['a'])).toBeTrue();
  });

  it(`returns false for empty string`, () => {
    expect(isPath('')).toBeFalse();
  });

  it(`returns false for empty Array`, () => {
    expect(isPath([])).toBeFalse();
  });

  it(`returns false for Array of non strings`, () => {
    expect(isPath([0, 'a'])).toBeFalse();
  });

  it(`returns false for any other type of value`, () => {
    new AnyMap()
      .excludes('string')
      .excludes('Array')
      .values()
      .forEach((v) => {
        expect(isPath(v)).toBeFalse();
      });
  });
});

describe('InvalidPathError', () => {
  it(`throws a InvalidPathError type`, () => {
    expect(() => {
      throw new InvalidPathError('');
    }).toThrow(InvalidPathError);
  });

  it(`throws with a custom message`, () => {
    expect(() => {
      throw new InvalidPathError('');
    }).toThrow('The path "" is invalid');
  });
});

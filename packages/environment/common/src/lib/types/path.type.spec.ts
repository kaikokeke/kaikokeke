import { AnyMap } from '@kaikokeke/devtools';

import { isPath } from './path.type';

describe('isPath(value)', () => {
  it(`returns true for non empty string`, () => {
    expect(isPath('a')).toEqual(true);
  });

  it(`returns true for non empty Array of strings`, () => {
    expect(isPath(['a'])).toEqual(true);
  });

  it(`returns false for empty string`, () => {
    expect(isPath('')).toEqual(false);
  });

  it(`returns false for empty Array`, () => {
    expect(isPath([])).toEqual(false);
  });

  it(`returns false for Array of non strings`, () => {
    expect(isPath([0, 'a'])).toEqual(false);
  });

  it(`returns false for any other type of value`, () => {
    new AnyMap()
      .excludes('string')
      .excludes('Array')
      .values()
      .forEach((v) => {
        expect(isPath(v)).toEqual(false);
      });
  });
});

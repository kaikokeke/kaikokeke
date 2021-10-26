import { isValidPath } from '../is-valid-path';
import { Path } from '../types';
import { InvalidPathError } from './invalid-path.error';

describe('InvalidPathError', () => {
  it(`extends Error`, () => {
    expect(new InvalidPathError('a.')).toBeInstanceOf(Error);
  });

  it(`.name is 'InvalidPathError'`, () => {
    expect(new InvalidPathError('a.').name).toEqual('InvalidPathError');
  });

  it(`.message is setted from string Path`, () => {
    expect(new InvalidPathError('a.').message).toEqual('The path "a." is invalid');
  });

  it(`.message is setted from Array Path`, () => {
    expect(new InvalidPathError(['a', '']).message).toEqual('The path "a." is invalid');
  });

  it(`.stack is setted`, () => {
    expect(new InvalidPathError('a.').stack).toStartWith('InvalidPathError: The path "a." is invalid');
  });

  describe('examples of use', () => {
    function doSomething(path: Path): void {
      if (isValidPath(path)) {
        // do something
      } else {
        throw new InvalidPathError(path);
      }
    }

    it(`use with isValidPath()`, () => {
      const path = 'a.';
      expect(() => doSomething(path)).toThrowError(new InvalidPathError(path));
    });
  });
});

import { suffixPath } from './suffix-path.function';

describe('suffixPath(path, suffix)', () => {
  it(`returns prefixed string path from string path and string prefix`, () => {
    expect(suffixPath('a.a', 'b.c')).toEqual('a.a.b.c');
  });

  it(`returns prefixed string path from string path and Array prefix`, () => {
    expect(suffixPath('a.a', ['b', 'c'])).toEqual('a.a.b.c');
  });

  it(`returns prefixed Array path from Array path and string prefix`, () => {
    expect(suffixPath(['a', 'a'], 'b.c')).toEqual(['a', 'a', 'b', 'c']);
  });

  it(`returns prefixed Array path from Array path and string prefix`, () => {
    expect(suffixPath(['a', 'a'], ['b', 'c'])).toEqual(['a', 'a', 'b', 'c']);
  });
});

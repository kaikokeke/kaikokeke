import { prefixPath } from './prefix-path.function';

describe('prefixPath(path, prefix)', () => {
  it(`returns prefixed string path from string path and string prefix`, () => {
    expect(prefixPath('a.a', 'b.c')).toEqual('b.c.a.a');
  });

  it(`returns prefixed string path from string path and Array prefix`, () => {
    expect(prefixPath('a.a', ['b', 'c'])).toEqual('b.c.a.a');
  });

  it(`returns prefixed Array path from Array path and string prefix`, () => {
    expect(prefixPath(['a', 'a'], 'b.c')).toEqual(['b', 'c', 'a', 'a']);
  });

  it(`returns prefixed Array path from Array path and string prefix`, () => {
    expect(prefixPath(['a', 'a'], ['b', 'c'])).toEqual(['b', 'c', 'a', 'a']);
  });
});

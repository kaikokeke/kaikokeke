import { InvalidPathError } from './invalid-path.error';

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

  it(`throws with a custom message with Array`, () => {
    expect(() => {
      throw new InvalidPathError(['a', '']);
    }).toThrow('The path "a." is invalid');
  });
});

import { executeIfExists } from './execute-if-exists.function';

class TestClass {
  method(a: number): number {
    return a;
  }
}

describe('executeIfExists(obj, method, ...args)', () => {
  let testClass: TestClass;

  beforeEach(() => {
    testClass = new TestClass();
  });

  it(`returns The method's return value if exists`, () => {
    expect(executeIfExists(testClass, 'method', 1)).toEqual(1);
  });

  it(`returns undefined if the method doesn't exist`, () => {
    expect(executeIfExists(testClass, 'noMethod', 1)).toBeUndefined();
  });
});

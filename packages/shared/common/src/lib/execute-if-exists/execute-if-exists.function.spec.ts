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

  describe('examples of use', () => {
    interface OnOperation {
      onOperation(operation: string, ...args: number[]): void;
    }

    abstract class AbstractOperationClass {
      plusOne(a: number): number {
        executeIfExists(this, 'onOperation', 'sum', a, 1);
        return a + 1;
      }
    }

    class SumClass extends AbstractOperationClass implements OnOperation {
      onOperation(operation: string, ...args: number[]): void {
        console.log(`operation: ${operation}`, ...args);
      }
    }

    class OperationClass extends AbstractOperationClass {}

    const sumClass: AbstractOperationClass = new SumClass();
    const operationClass: AbstractOperationClass = new OperationClass();

    it(`lifecycle hooks`, () => {
      jest.spyOn(console, 'log').mockImplementation(() => null);
      expect(console.log).not.toHaveBeenCalled();
      expect(sumClass.plusOne(0)).toEqual(1);
      expect(console.log).toHaveBeenNthCalledWith(1, 'operation: sum', 0, 1);
      expect(console.log).toHaveBeenCalledTimes(1);
      expect(operationClass.plusOne(0)).toEqual(1);
      expect(console.log).toHaveBeenCalledTimes(1);
      jest.restoreAllMocks();
    });
  });
});

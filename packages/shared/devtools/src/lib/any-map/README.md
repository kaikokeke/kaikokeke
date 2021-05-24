# AnyMap

AnyMap is a helper class to test use cases where the value can be an `any` type value.

## Usage

First, create an instance of AnyMap.

```ts
import { AnyMap } from '@kaikokeke/devtools';

describe('test', () => {
  let anyMap: AnyMap;

  beforeEach(() => {
    anyMap = new AnyMap();
  });

  it(`test case`, () => {
    anyMap
      .includes('falsy')
      .values()
      .forEach((value: any) => {
        expect(value).toBeFalsy();
      });
  });
});
```

## Any keys

- primitive
- object
- boolean
- string
- number
- bigint
- symbol
- null
- undefined
- infinity
- NaN
- integer
- decimal
- binary
- octal
- hexadecimal
- exponent
- negative
- falsy
- nullish
- empty

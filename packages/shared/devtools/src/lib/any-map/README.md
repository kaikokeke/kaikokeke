# AnyMap

AnyMap is a helper class for testing use cases where the value is of type `any`.

## Usage

```ts
import { AnyMap } from '@kaikokeke/devtools';
import { isFalsy } from './is-falsy';

describe('isFalsy(any)', () => {
  let anyMap: AnyMap;

  beforeEach(() => {
    anyMap = new AnyMap();
  });

  it(`returns true for falsy values`, () => {
    anyMap
      .includes('falsy')
      .values()
      .forEach((value: any) => {
        expect(isFalsy(value)).toEqual(true);
      });
  });

  it(`returns false for truthy values`, () => {
    anyMap
      .excludes('falsy')
      .values()
      .forEach((value: any) => {
        expect(isFalsy(value)).toEqual(false);
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

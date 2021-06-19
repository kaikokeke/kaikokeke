# AnyMap

AnyMap is a helper class for testing use cases where the value is of type `any`.

The AnyMap type object contains all the standard Javascript data types in an array called `ANY_MAP`, allowing filtering them using the keywords exposed at the end of the document as full string search, a regular expressions or a function.

```ts
import { AnyMap } from '@kaikokeke/devtools';

const anyMap: AnyMap = new AnyMap();
```

## API

### Exposed Types

#### `AnyMapValue`

A tuple with the keyword, the value and the description.

```ts
export type AnyMapValue = [string, any, string];
```

All keywords must be surrounded by the character `_` to allow searching for complete keyword.

```ts
const value: AnyMapValue = ['_string_falsy_', '', "string ''"];
```

#### `AnyMapFilter`

A filter to match a value of type `any` using a full string, a regular expresion or a predicate.

```ts
export type AnyMapFilter = string | RegExp | ((key: string) => boolean);
```

### Constructor

#### `constructor(extraValues?: AnyMapValue[]) {}`

The class allows adding additional key-value arrays ​​in the constructor for data filtering.

If a value is found that matches another of `ANY_MAP`, the new key will be added to the original key.

```ts
const anyMap = new AnyMap();
anyMap.includes('string').includes('falsy').entries();
// [['_primitive_string_falsy_iterable_', '', "string ''"]]

const anyMap2 = new AnyMap([['_string_empty_', '']]);
anyMap2.includes('empty').entries();
// [['_primitive_string_falsy_iterable_empty_', '', "string ''"]]
```

If no value matches are found, the entries will be added as is.

```ts
const anyMap = new AnyMap([['_string_empty_', 'ccc', "string 'ccc'"]]);
anyMap.includes('empty').entries();
// [['_string_empty_', 'ccc', "string 'ccc'"]]
```

### Exposed Methods

#### `keys(): string[]`

Returns a new array that contains the keys for each element.

```ts
anyMap.includes('null').keys();
// ['_primitive_object_null_falsy_nullish_']
```

#### `values(): any[]`

Returns a new array that contains the values for each element.

```ts
anyMap.includes('null').values();
// [null]
```

#### `descriptions(): string[]`

Returns a new array that contains the description for each element.

```ts
anyMap.includes('null').descriptions();
// ['null']
```

#### `entries(): AnyMapValue[]`

Returns a new array of entries for each element.

```ts
anyMap.includes('null').entries();
// [['_primitive_object_null_falsy_nullish_', null, 'null']]
```

#### `includes(filter: AnyMapFilter | AnyMapFilter[]): AnyMap`

Returns the values of `any` that meet the inclusions of the filter.

```ts
anyMap.includes('boolean').values();
// [false, true]
```

If an array of filters is specified, it will be resolved as an OR.
All sets that meet any of the conditions will be included, without duplicates.

```ts
anyMap.includes(['boolean', 'null']).values();
// [false, true, null]
```

If multiple includes are chained it will work as filtered using AND.

```ts
anyMap.includes('boolean').includes('falsy').values();
// [false]
```

#### `excludes(filter: AnyMapFilter | AnyMapFilter[]): AnyMap`

Returns the values of `any` that meet the exclusions of the filter.

```ts
anyMap.excludes('boolean').values();
// all except [false, true]
```

If an array of filters is specified, it will be resolved as an AND.
Sets that meet all the conditions will be excluded.

```ts
anyMap.excludes(['boolean', 'falsy']).values();
// all except [false]
```

If multiple excludes are chained it will work as filtered using OR.

```ts
anyMap.excludes('boolean').excludes('null').values();
// all except [false, true, null]
```

#### `join(anyMap: AnyMap): AnyMap`

Returns the entries of this object joined with the entries in the provided AnyMap object.

```ts
const anyMap2: AnyMap = new AnyMap().includes('null', 'boolean');
anyMap.includes('boolean', 'undefined').join(anyMap2).values();
// [true, false, null, undefined]
```

#### `not(anyMap: AnyMap): AnyMap`

Returns the values of `any` that are not in the provided AnyMap object.

```ts
const anyMap2: AnyMap = new AnyMap().includes('null');
anyMap.not(anyMap2).values();
// all except [null]
```

## Example of use

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

## Keywords

`anonymousFunction`, `Array`, `ArrayBuffer`, `Atomics`, `bigint`, `BigInt64Array`, `BigUint64Array`, `binary`, `boolean`, `Boolean`, `DataView`, `Date`, `decimal`, `Element`, `Error`, `EvalError`, `exponent`, `falsy`, `Float32Array`, `Float64Array`, `function`, `hexadecimal`, `infinity`, `Int16Array`, `Int32Array`, `Int8Array`, `integer`, `iterable`, `JSON`, `Map`, `Math`, `namedFunction`, `namedObject`, `NaN`, `negative`, `null`, `nullish`, `number`, `Number`, `object`, `octal`, `plainObject`, `primitive`, `RangeError`, `ReferenceError`, `RegExp`, `Set`, `SharedArrayBuffer`, `string`, `String`, `symbol`, `SyntaxError`, `TypedArray`, `TypeError`, `Uint16Array`, `Uint32Array`, `Uint8Array`, `Uint8ClampedArray`, `undefined`, `URIError`, `WeakMap`, `WeakSet`

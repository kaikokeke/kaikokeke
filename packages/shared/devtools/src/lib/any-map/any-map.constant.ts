import { AnyMapValue } from './any-map-value.type';
import { sortAnyMapValue } from './sort-any-map-value.function';

/* istanbul ignore file */
class TestClass {}

function testFunction() {
  return;
}

const localAnyMap: AnyMapValue[] = [];

// boolean
// https://tc39.es/ecma262/#sec-ecmascript-language-types-boolean-type
// https://tc39.es/ecma262/#sec-boolean-objects
localAnyMap.push(
  { key: '_primitive_boolean_falsy_', value: false, description: 'false' },
  { key: '_primitive_boolean_', value: true, description: 'true' },
  { key: '_object_namedObject_Boolean_', value: new Boolean(false), description: 'Boolean false' },
  { key: '_object_namedObject_Boolean_', value: new Boolean(true), description: 'Boolean true' }
);

// undefined
// https://tc39.es/ecma262/#sec-ecmascript-language-types-undefined-type
localAnyMap.push({ key: '_primitive_undefined_falsy_nullish_', value: undefined, description: 'undefined' });

// null
// https://tc39.es/ecma262/#sec-ecmascript-language-types-null-type
localAnyMap.push({ key: '_primitive_object_null_falsy_nullish_', value: null, description: 'null' });

// string
// https://tc39.es/ecma262/#sec-ecmascript-language-types-string-type
// https://tc39.es/ecma262/#sec-string-objects
localAnyMap.push(
  { key: '_primitive_string_falsy_iterable_', value: '', description: "string ''" },
  { key: '_primitive_string_iterable_', value: 'a', description: 'string' },
  { key: '_object_namedObject_String_iterable_', value: new String(''), description: 'String' }
);

// symbol
// https://tc39.es/ecma262/#sec-ecmascript-language-types-symbol-type
// https://tc39.es/ecma262/#sec-symbol-objects
localAnyMap.push({ key: '_primitive_symbol_', value: Symbol(), description: 'Symbol' });

// number
// https://tc39.es/ecma262/#sec-ecmascript-language-types-number-type
// https://tc39.es/ecma262/#sec-number-objects
localAnyMap.push(
  { key: '_primitive_number_infinity_', value: Number.POSITIVE_INFINITY, description: 'Infinity' },
  { key: '_primitive_number_infinity_negative_', value: Number.NEGATIVE_INFINITY, description: '-Infinity' },
  { key: '_primitive_number_NaN_falsy_', value: Number.NaN, description: 'NaN' },
  { key: '_primitive_number_integer_', value: Number.MAX_SAFE_INTEGER, description: 'integer' },
  { key: '_primitive_number_integer_negative_', value: Number.MIN_SAFE_INTEGER, description: 'integer negative' },
  { key: '_primitive_number_integer_falsy_', value: 0, description: 'number 0' },
  { key: '_primitive_number_decimal_', value: 0.1, description: 'number decimal' },
  { key: '_primitive_number_binary_', value: 0b1, description: 'number binary' },
  { key: '_primitive_number_octal_', value: 0o1, description: 'number octal' },
  { key: '_primitive_number_hexadecimal_', value: 0x1, description: 'number hexadecimal' },
  { key: '_primitive_number_exponent_', value: 1e1, description: 'number exponent' },
  { key: '_object_namedObject_Number_', value: new Number(0), description: 'Number' }
);

// bigint
// https://tc39.es/ecma262/#sec-ecmascript-language-types-bigint-type
// https://tc39.es/ecma262/#sec-bigint-objects
localAnyMap.push(
  { key: '_primitive_bigint_falsy_', value: BigInt(0), description: 'bigint 0n' },
  { key: '_primitive_bigint_', value: BigInt(1), description: 'bigint' },
  { key: '_primitive_bigint_negative_', value: BigInt(-1), description: 'bigint negative' }
);

// Math
// https://tc39.es/ecma262/#sec-math-object
localAnyMap.push({ key: '_object_namedObject_Math_', value: Math, description: 'Math' });

// Object
// https://tc39.es/ecma262/#sec-object-objects
localAnyMap.push(
  { key: '_object_plainObject_', value: {}, description: 'object {}' },
  { key: '_object_plainObject_', value: Object.create(null), description: 'Object.create(null)' },
  { key: '_object_namedObject_', value: new TestClass(), description: 'object custom' }
);

// function
// https://tc39.es/ecma262/#sec-function-objects
localAnyMap.push(
  { key: '_function_anonymousFunction_', value: () => null, description: 'anonymous function' },
  { key: '_function_namedFunction_', value: testFunction, description: 'named function' }
);

// Array
// https://tc39.es/ecma262/#sec-array-objects
localAnyMap.push({ key: '_object_namedObject_Array_iterable_', value: [], description: 'Array' });

// TypedArray
// https://tc39.es/ecma262/#sec-typedarray-objects
localAnyMap.push(
  { key: '_object_namedObject_TypedArray_Int8Array_iterable_', value: new Int8Array(0), description: 'Int8Array' },
  { key: '_object_namedObject_TypedArray_Int16Array_iterable_', value: new Int16Array(0), description: 'Int16Array' },
  { key: '_object_namedObject_TypedArray_Int32Array_iterable_', value: new Int32Array(0), description: 'Int32Array' },
  { key: '_object_namedObject_TypedArray_Uint8Array_iterable_', value: new Uint8Array(0), description: 'Uint8Array' },
  {
    key: '_object_namedObject_TypedArray_Uint8ClampedArray_iterable_',
    value: new Uint8ClampedArray(0),
    description: 'Uint8ClampedArray',
  },
  {
    key: '_object_namedObject_TypedArray_Uint16Array_iterable_',
    value: new Uint16Array(0),
    description: 'Uint16Array',
  },
  {
    key: '_object_namedObject_TypedArray_Uint32Array_iterable_',
    value: new Uint32Array(0),
    description: 'Uint32Array',
  },
  {
    key: '_object_namedObject_TypedArray_Float32Array_iterable_',
    value: new Float32Array(0),
    description: 'Float32Array',
  },
  {
    key: '_object_namedObject_TypedArray_Float64Array_iterable_',
    value: new Float64Array(0),
    description: 'Float64Array',
  },
  {
    key: '_object_namedObject_TypedArray_BigInt64Array_iterable_',
    value: new BigInt64Array(0),
    description: 'BigInt64Array',
  },
  {
    key: '_object_namedObject_TypedArray_BigUint64Array_iterable_',
    value: new BigUint64Array(0),
    description: 'BigUint64Array',
  }
);

// ArrayBuffer
// https://tc39.es/ecma262/#sec-arraybuffer-objects
localAnyMap.push({ key: '_object_namedObject_ArrayBuffer_', value: new ArrayBuffer(0), description: 'ArrayBuffer' });

// SharedArrayBuffer
// https://tc39.es/ecma262/#sec-sharedarraybuffer-objects
localAnyMap.push({
  key: '_object_namedObject_SharedArrayBuffer_',
  value: new SharedArrayBuffer(0),
  description: 'SharedArrayBuffer',
});

// DataView
// https://tc39.es/ecma262/#sec-dataview-objects
localAnyMap.push({
  key: '_object_namedObject_DataView_',
  value: new DataView(new ArrayBuffer(0)),
  description: 'DataView',
});

// Atomics
// https://tc39.es/ecma262/#sec-atomics-object
localAnyMap.push({ key: '_object_namedObject_Atomics_', value: Atomics, description: 'Atomics' });

// JSON
// https://tc39.es/ecma262/#sec-json-object
localAnyMap.push({ key: '_object_namedObject_JSON_', value: JSON, description: 'JSON' });

// Map
// https://tc39.es/ecma262/#sec-map-objects
localAnyMap.push({ key: '_object_namedObject_Map_iterable_', value: new Map(), description: 'Map' });

// Set
// https://tc39.es/ecma262/#sec-set-objects
localAnyMap.push({ key: '_object_namedObject_Set_iterable_', value: new Set(), description: 'Set' });

// WeakMap
// https://tc39.es/ecma262/#sec-weakmap-objects
localAnyMap.push({ key: '_object_namedObject_WeakMap_', value: new WeakMap(), description: 'WeakMap' });

// WeakSet
// https://tc39.es/ecma262/#sec-weakset-objects
localAnyMap.push({ key: '_object_namedObject_WeakSet_', value: new WeakSet(), description: 'WeakSet' });

// Date
// https://tc39.es/ecma262/#sec-date-objects
localAnyMap.push({ key: '_object_namedObject_Date_', value: new Date(), description: 'Date' });

// RegExp
// https://tc39.es/ecma262/#sec-regexp-regular-expression-objects
localAnyMap.push({ key: '_object_namedObject_RegExp_', value: new RegExp(''), description: 'RegExp' });

// Error
// https://tc39.es/ecma262/#sec-error-objects
localAnyMap.push(
  { key: '_object_namedObject_Error_', value: new Error(), description: 'Error' },
  { key: '_object_namedObject_Error_EvalError_', value: new EvalError(), description: 'EvalError' },
  { key: '_object_namedObject_Error_RangeError_', value: new RangeError(), description: 'RangeError' },
  { key: '_object_namedObject_Error_ReferenceError_', value: new ReferenceError(), description: 'ReferenceError' },
  { key: '_object_namedObject_Error_SyntaxError_', value: new SyntaxError(), description: 'SyntaxError' },
  { key: '_object_namedObject_Error_TypeError_', value: new TypeError(), description: 'TypeError' },
  { key: '_object_namedObject_Error_URIError_', value: new URIError(), description: 'URIError' }
);

// Element
// https://developer.mozilla.org/en-US/docs/Web/API/Element
localAnyMap.push({ key: '_object_namedObject_Element_', value: document.body, description: 'Element' });

// DOM
// https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model
// TODO: add DOM interfaces

export const ANY_MAP: ReadonlyArray<AnyMapValue> = sortAnyMapValue(localAnyMap);

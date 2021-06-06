import { AnyMapValue } from './any-map-value.type';

/* istanbul ignore file */
class TestClass {}

function TestFunction() {
  return;
}

const localAnyMap: AnyMapValue[] = [];

// boolean
// https://tc39.es/ecma262/#sec-ecmascript-language-types-boolean-type
// https://tc39.es/ecma262/#sec-boolean-objects
localAnyMap.push(['_primitive_boolean_falsy_', false]);
localAnyMap.push(['_primitive_boolean_', true]);
localAnyMap.push(['_object_Boolean_', new Boolean(false)]);
localAnyMap.push(['_object_Boolean_', new Boolean(true)]);

// undefined
// https://tc39.es/ecma262/#sec-ecmascript-language-types-undefined-type
localAnyMap.push(['_primitive_undefined_falsy_nullish_', undefined]);

// null
// https://tc39.es/ecma262/#sec-ecmascript-language-types-null-type
localAnyMap.push(['_primitive_object_null_falsy_nullish_', null]);

// string
// https://tc39.es/ecma262/#sec-ecmascript-language-types-string-type
// https://tc39.es/ecma262/#sec-string-objects
localAnyMap.push(['_primitive_string_falsy_iterable_', '']);
localAnyMap.push(['_primitive_string_iterable_', 'a']);
localAnyMap.push(['_object_String_iterable_', new String('')]);

// symbol
// https://tc39.es/ecma262/#sec-ecmascript-language-types-symbol-type
// https://tc39.es/ecma262/#sec-symbol-objects
localAnyMap.push(['_primitive_symbol_', Symbol()]);

// number
// https://tc39.es/ecma262/#sec-ecmascript-language-types-number-type
// https://tc39.es/ecma262/#sec-number-objects
localAnyMap.push(['_primitive_number_infinity_', Number.POSITIVE_INFINITY]);
localAnyMap.push(['_primitive_number_infinity_negative_', Number.NEGATIVE_INFINITY]);
localAnyMap.push(['_primitive_number_NaN_falsy_', Number.NaN]);
localAnyMap.push(['_primitive_number_integer_', Number.MAX_SAFE_INTEGER]);
localAnyMap.push(['_primitive_number_integer_negative_', Number.MIN_SAFE_INTEGER]);
localAnyMap.push(['_primitive_number_integer_falsy_', 0]);
localAnyMap.push(['_primitive_number_integer_falsy_negative_', -0]);
localAnyMap.push(['_primitive_number_decimal_', Number.MAX_VALUE]);
localAnyMap.push(['_primitive_number_decimal_negative_', Number.MIN_VALUE]);
localAnyMap.push(['_primitive_number_decimal_falsy_', 0.0]);
localAnyMap.push(['_primitive_number_binary_', 0b1]);
localAnyMap.push(['_primitive_number_binary_falsy_', 0b0]);
localAnyMap.push(['_primitive_number_binary_falsy_negative_', -0b0]);
localAnyMap.push(['_primitive_number_octal_', 0o1]);
localAnyMap.push(['_primitive_number_octal_falsy_', 0o0]);
localAnyMap.push(['_primitive_number_octal_falsy_negative_', -0o0]);
localAnyMap.push(['_primitive_number_hexadecimal_', 0x1]);
localAnyMap.push(['_primitive_number_hexadecimal_falsy_', 0x0]);
localAnyMap.push(['_primitive_number_hexadecimal_falsy_negative_', -0x0]);
localAnyMap.push(['_primitive_number_exponent_', 1e1]);
localAnyMap.push(['_primitive_number_exponent_falsy_', 0e1]);
localAnyMap.push(['_primitive_number_exponent_falsy_negative_', -0e1]);
localAnyMap.push(['_object_Number_', new Number(0)]);

// bigint
// https://tc39.es/ecma262/#sec-ecmascript-language-types-bigint-type
// https://tc39.es/ecma262/#sec-bigint-objects
localAnyMap.push(['_primitive_bigint_falsy_', BigInt(0)]);
localAnyMap.push(['_primitive_bigint_falsy_negative_', BigInt(-0)]);
localAnyMap.push(['_primitive_bigint_', BigInt(1)]);
localAnyMap.push(['_primitive_bigint_negative_', BigInt(-1)]);

// Math
// https://tc39.es/ecma262/#sec-math-object
localAnyMap.push(['_object_Math_', Math]);

// Object
// https://tc39.es/ecma262/#sec-object-objects
localAnyMap.push(['_object_plainObject_', {}]);
localAnyMap.push(['_object_plainObject_', Object.create(null)]);
localAnyMap.push(['_object_namedObject', new TestClass()]);

// function
// https://tc39.es/ecma262/#sec-function-objects
localAnyMap.push(['_function_anonymousFunction_', () => null]);
localAnyMap.push(['_function_namedFunction_', () => TestFunction]);

// Array
// https://tc39.es/ecma262/#sec-array-objects
localAnyMap.push(['_object_Array_iterable_', []]);

// TypedArray
// https://tc39.es/ecma262/#sec-typedarray-objects
localAnyMap.push(['_object_TypedArray_Int8Array_iterable_', new Int8Array(0)]);
localAnyMap.push(['_object_TypedArray_Int16Array_iterable_', new Int16Array(0)]);
localAnyMap.push(['_object_TypedArray_Int32Array_iterable_', new Int32Array(0)]);
localAnyMap.push(['_object_TypedArray_Uint8Array_iterable_', new Uint8Array(0)]);
localAnyMap.push(['_object_TypedArray_Uint8ClampedArray_iterable_', new Uint8ClampedArray(0)]);
localAnyMap.push(['_object_TypedArray_Uint16Array_iterable_', new Uint16Array(0)]);
localAnyMap.push(['_object_TypedArray_Uint32Array_iterable_', new Uint32Array(0)]);
localAnyMap.push(['_object_TypedArray_Float32Array_iterable_', new Float32Array(0)]);
localAnyMap.push(['_object_TypedArray_Float64Array_iterable_', new Float64Array(0)]);
localAnyMap.push(['_object_TypedArray_BigInt64Array_iterable_', new BigInt64Array(0)]);
localAnyMap.push(['_object_TypedArray_BigUint64Array_iterable_', new BigUint64Array(0)]);

// ArrayBuffer
// https://tc39.es/ecma262/#sec-arraybuffer-objects
localAnyMap.push(['_object_ArrayBuffer_', new ArrayBuffer(0)]);

// SharedArrayBuffer
// https://tc39.es/ecma262/#sec-sharedarraybuffer-objects
localAnyMap.push(['_object_SharedArrayBuffer_', new SharedArrayBuffer(0)]);

// DataView
// https://tc39.es/ecma262/#sec-dataview-objects
localAnyMap.push(['_object_DataView_', new DataView(new ArrayBuffer(0))]);

// Atomics
// https://tc39.es/ecma262/#sec-atomics-object
localAnyMap.push(['_object_Atomics_', Atomics]);

// JSON
// https://tc39.es/ecma262/#sec-json-object
localAnyMap.push(['_object_JSON_', JSON]);

// Map
// https://tc39.es/ecma262/#sec-map-objects
localAnyMap.push(['_object_Map_iterable_', new Map()]);

// Set
// https://tc39.es/ecma262/#sec-set-objects
localAnyMap.push(['_object_Set_iterable_', new Set()]);

// WeakMap
// https://tc39.es/ecma262/#sec-weakmap-objects
localAnyMap.push(['_object_WeakMap_', new WeakMap()]);

// WeakSet
// https://tc39.es/ecma262/#sec-weakset-objects
localAnyMap.push(['_object_WeakSet_', new WeakSet()]);

// Date
// https://tc39.es/ecma262/#sec-date-objects
localAnyMap.push(['_object_Date_', new Date()]);

// RegExp
// https://tc39.es/ecma262/#sec-regexp-regular-expression-objects
localAnyMap.push(['_object_RegExp_', new RegExp('')]);

// Error
// https://tc39.es/ecma262/#sec-error-objects
localAnyMap.push(['_object_Error_', new Error()]);
localAnyMap.push(['_object_Error_EvalError_', new EvalError()]);
localAnyMap.push(['_object_Error_RangeError_', new RangeError()]);
localAnyMap.push(['_object_Error_ReferenceError_', new ReferenceError()]);
localAnyMap.push(['_object_Error_SyntaxError_', new SyntaxError()]);
localAnyMap.push(['_object_Error_TypeError_', new TypeError()]);
localAnyMap.push(['_object_Error_URIError_', new URIError()]);

export const ANY_MAP: ReadonlyArray<AnyMapValue> = localAnyMap;

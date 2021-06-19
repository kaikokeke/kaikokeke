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
localAnyMap.push(['_primitive_boolean_falsy_', false, 'false']);
localAnyMap.push(['_primitive_boolean_', true, 'true']);
localAnyMap.push(['_object_namedObject_Boolean_', new Boolean(false), 'Boolean false']);
localAnyMap.push(['_object_namedObject_Boolean_', new Boolean(true), 'Boolean true']);

// undefined
// https://tc39.es/ecma262/#sec-ecmascript-language-types-undefined-type
localAnyMap.push(['_primitive_undefined_falsy_nullish_', undefined, 'undefined']);

// null
// https://tc39.es/ecma262/#sec-ecmascript-language-types-null-type
localAnyMap.push(['_primitive_object_null_falsy_nullish_', null, 'null']);

// string
// https://tc39.es/ecma262/#sec-ecmascript-language-types-string-type
// https://tc39.es/ecma262/#sec-string-objects
localAnyMap.push(['_primitive_string_falsy_iterable_', '', "string ''"]);
localAnyMap.push(['_primitive_string_iterable_', 'a', 'string']);
localAnyMap.push(['_object_namedObject_String_iterable_', new String(''), 'String']);

// symbol
// https://tc39.es/ecma262/#sec-ecmascript-language-types-symbol-type
// https://tc39.es/ecma262/#sec-symbol-objects
localAnyMap.push(['_primitive_symbol_', Symbol(), 'Symbol']);

// number
// https://tc39.es/ecma262/#sec-ecmascript-language-types-number-type
// https://tc39.es/ecma262/#sec-number-objects
localAnyMap.push(['_primitive_number_infinity_', Number.POSITIVE_INFINITY, 'Infinity']);
localAnyMap.push(['_primitive_number_infinity_negative_', Number.NEGATIVE_INFINITY, '-Infinity']);
localAnyMap.push(['_primitive_number_NaN_falsy_', Number.NaN, 'NaN']);
localAnyMap.push(['_primitive_number_integer_', Number.MAX_SAFE_INTEGER, 'integer']);
localAnyMap.push(['_primitive_number_integer_negative_', Number.MIN_SAFE_INTEGER, 'integer negative']);
localAnyMap.push(['_primitive_number_integer_falsy_', 0, 'number 0']);
localAnyMap.push(['_primitive_number_decimal_', 0.1, 'number decimal']);
localAnyMap.push(['_primitive_number_binary_', 0b1, 'number binary']);
localAnyMap.push(['_primitive_number_octal_', 0o1, 'number octal']);
localAnyMap.push(['_primitive_number_hexadecimal_', 0x1, 'number hexadecimal']);
localAnyMap.push(['_primitive_number_exponent_', 1e1, 'number exponent']);
localAnyMap.push(['_object_namedObject_Number_', new Number(0), 'Number']);

// bigint
// https://tc39.es/ecma262/#sec-ecmascript-language-types-bigint-type
// https://tc39.es/ecma262/#sec-bigint-objects
localAnyMap.push(['_primitive_bigint_falsy_', BigInt(0), 'bigint 0n']);
localAnyMap.push(['_primitive_bigint_', BigInt(1), 'bigint']);
localAnyMap.push(['_primitive_bigint_negative_', BigInt(-1), 'bigint negative']);

// Math
// https://tc39.es/ecma262/#sec-math-object
localAnyMap.push(['_object_namedObject_Math_', Math, 'Math']);

// Object
// https://tc39.es/ecma262/#sec-object-objects
localAnyMap.push(['_object_plainObject_', {}, 'object {}']);
localAnyMap.push(['_object_plainObject_', Object.create(null), 'Object.create(null)']);
localAnyMap.push(['_object_namedObject_', new TestClass(), 'object custom']);

// function
// https://tc39.es/ecma262/#sec-function-objects
localAnyMap.push(['_function_anonymousFunction_', () => null, 'anonymous function']);
localAnyMap.push(['_function_namedFunction_', testFunction, 'named function']);

// Array
// https://tc39.es/ecma262/#sec-array-objects
localAnyMap.push(['_object_namedObject_Array_iterable_', [], 'Array']);

// TypedArray
// https://tc39.es/ecma262/#sec-typedarray-objects
localAnyMap.push(['_object_namedObject_TypedArray_Int8Array_iterable_', new Int8Array(0), 'Int8Array']);
localAnyMap.push(['_object_namedObject_TypedArray_Int16Array_iterable_', new Int16Array(0), 'Int16Array']);
localAnyMap.push(['_object_namedObject_TypedArray_Int32Array_iterable_', new Int32Array(0), 'Int32Array']);
localAnyMap.push(['_object_namedObject_TypedArray_Uint8Array_iterable_', new Uint8Array(0), 'Uint8Array']);
localAnyMap.push([
  '_object_namedObject_TypedArray_Uint8ClampedArray_iterable_',
  new Uint8ClampedArray(0),
  'Uint8ClampedArray',
]);
localAnyMap.push(['_object_namedObject_TypedArray_Uint16Array_iterable_', new Uint16Array(0), 'Uint16Array']);
localAnyMap.push(['_object_namedObject_TypedArray_Uint32Array_iterable_', new Uint32Array(0), 'Uint32Array']);
localAnyMap.push(['_object_namedObject_TypedArray_Float32Array_iterable_', new Float32Array(0), 'Float32Array']);
localAnyMap.push(['_object_namedObject_TypedArray_Float64Array_iterable_', new Float64Array(0), 'Float64Array']);
localAnyMap.push(['_object_namedObject_TypedArray_BigInt64Array_iterable_', new BigInt64Array(0), 'BigInt64Array']);
localAnyMap.push(['_object_namedObject_TypedArray_BigUint64Array_iterable_', new BigUint64Array(0), 'BigUint64Array']);

// ArrayBuffer
// https://tc39.es/ecma262/#sec-arraybuffer-objects
localAnyMap.push(['_object_namedObject_ArrayBuffer_', new ArrayBuffer(0), 'ArrayBuffer']);

// SharedArrayBuffer
// https://tc39.es/ecma262/#sec-sharedarraybuffer-objects
localAnyMap.push(['_object_namedObject_SharedArrayBuffer_', new SharedArrayBuffer(0), 'SharedArrayBuffer']);

// DataView
// https://tc39.es/ecma262/#sec-dataview-objects
localAnyMap.push(['_object_namedObject_DataView_', new DataView(new ArrayBuffer(0)), 'DataView']);

// Atomics
// https://tc39.es/ecma262/#sec-atomics-object
localAnyMap.push(['_object_namedObject_Atomics_', Atomics, 'Atomics']);

// JSON
// https://tc39.es/ecma262/#sec-json-object
localAnyMap.push(['_object_namedObject_JSON_', JSON, 'JSON']);

// Map
// https://tc39.es/ecma262/#sec-map-objects
localAnyMap.push(['_object_namedObject_Map_iterable_', new Map(), 'Map']);

// Set
// https://tc39.es/ecma262/#sec-set-objects
localAnyMap.push(['_object_namedObject_Set_iterable_', new Set(), 'Set']);

// WeakMap
// https://tc39.es/ecma262/#sec-weakmap-objects
localAnyMap.push(['_object_namedObject_WeakMap_', new WeakMap(), 'WeakMap']);

// WeakSet
// https://tc39.es/ecma262/#sec-weakset-objects
localAnyMap.push(['_object_namedObject_WeakSet_', new WeakSet(), 'WeakSet']);

// Date
// https://tc39.es/ecma262/#sec-date-objects
localAnyMap.push(['_object_namedObject_Date_', new Date(), 'Date']);

// RegExp
// https://tc39.es/ecma262/#sec-regexp-regular-expression-objects
localAnyMap.push(['_object_namedObject_RegExp_', new RegExp(''), 'RegExp']);

// Error
// https://tc39.es/ecma262/#sec-error-objects
localAnyMap.push(['_object_namedObject_Error_', new Error(), 'Error']);
localAnyMap.push(['_object_namedObject_Error_EvalError_', new EvalError(), 'EvalError']);
localAnyMap.push(['_object_namedObject_Error_RangeError_', new RangeError(), 'RangeError']);
localAnyMap.push(['_object_namedObject_Error_ReferenceError_', new ReferenceError(), 'ReferenceError']);
localAnyMap.push(['_object_namedObject_Error_SyntaxError_', new SyntaxError(), 'SyntaxError']);
localAnyMap.push(['_object_namedObject_Error_TypeError_', new TypeError(), 'TypeError']);
localAnyMap.push(['_object_namedObject_Error_URIError_', new URIError(), 'URIError']);

// Element
// https://developer.mozilla.org/en-US/docs/Web/API/Element
localAnyMap.push(['_object_namedObject_Element_', document.body, 'Element']);

// DOM
// https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model
// TODO: add DOM interfaces

export const ANY_MAP: ReadonlyArray<AnyMapValue> = sortAnyMapValue(localAnyMap);

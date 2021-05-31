/* istanbul ignore file */

class TestClass {}

export const ANY_MAP: [string, any][] = [];

// boolean
ANY_MAP.push(['_primitive_boolean_falsy_', false]);
ANY_MAP.push(['_primitive_boolean_', true]);
ANY_MAP.push(['_object_Boolean_', new Boolean(false)]);
ANY_MAP.push(['_object_Boolean_', new Boolean(true)]);

// string
ANY_MAP.push(['_primitive_string_falsy_iterable_', '']);
ANY_MAP.push(['_primitive_string_iterable_', 'a']);
ANY_MAP.push(['_object_String_iterable_', new String('')]);

// number
ANY_MAP.push(['_primitive_number_infinity_', Number.POSITIVE_INFINITY]);
ANY_MAP.push(['_primitive_number_infinity_negative_', Number.NEGATIVE_INFINITY]);
ANY_MAP.push(['_primitive_number_NaN_falsy_', Number.NaN]);
ANY_MAP.push(['_primitive_number_integer_', Number.MAX_SAFE_INTEGER]);
ANY_MAP.push(['_primitive_number_integer_negative_', Number.MIN_SAFE_INTEGER]);
ANY_MAP.push(['_primitive_number_integer_falsy_', 0]);
ANY_MAP.push(['_primitive_number_integer_falsy_negative_', -0]);
ANY_MAP.push(['_primitive_number_decimal_', Number.MAX_VALUE]);
ANY_MAP.push(['_primitive_number_decimal_negative_', Number.MIN_VALUE]);
ANY_MAP.push(['_primitive_number_decimal_falsy_', 0.0]);
ANY_MAP.push(['_primitive_number_binary_', 0b1]);
ANY_MAP.push(['_primitive_number_binary_falsy_', 0b0]);
ANY_MAP.push(['_primitive_number_binary_falsy_negative_', -0b0]);
ANY_MAP.push(['_primitive_number_octal_', 0o1]);
ANY_MAP.push(['_primitive_number_octal_falsy_', 0o0]);
ANY_MAP.push(['_primitive_number_octal_falsy_negative_', -0o0]);
ANY_MAP.push(['_primitive_number_hexadecimal_', 0x1]);
ANY_MAP.push(['_primitive_number_hexadecimal_falsy_', 0x0]);
ANY_MAP.push(['_primitive_number_hexadecimal_falsy_negative_', -0x0]);
ANY_MAP.push(['_primitive_number_exponent_', 1e1]);
ANY_MAP.push(['_primitive_number_exponent_falsy_', 0e1]);
ANY_MAP.push(['_primitive_number_exponent_falsy_negative_', -0e1]);
ANY_MAP.push(['_object_Number_', new Number(0)]);

// bigint
ANY_MAP.push(['_primitive_bigint_falsy_', BigInt(0)]);
ANY_MAP.push(['_primitive_bigint_falsy_negative_', BigInt(-0)]);
ANY_MAP.push(['_primitive_bigint_', BigInt(1)]);
ANY_MAP.push(['_primitive_bigint_negative_', BigInt(-1)]);

// symbol
ANY_MAP.push(['_primitive_symbol_', Symbol()]);

// void
ANY_MAP.push(['_primitive_object_null_falsy_nullish_', null]);
ANY_MAP.push(['_primitive_undefined_falsy_nullish_', undefined]);

// function
ANY_MAP.push(['_function_', () => null]);

// object
ANY_MAP.push(['_object_plainobject_', {}]);
ANY_MAP.push(['_object_plainobject_', Object.create(null)]);
ANY_MAP.push(['_object_', new TestClass()]);

// array
ANY_MAP.push(['_object_Array_iterable_', []]);

// TypedArray
ANY_MAP.push(['_object_TypedArray_Int8Array_iterable_', new Int8Array(0)]);
ANY_MAP.push(['_object_TypedArray_Int16Array_iterable_', new Int16Array(0)]);
ANY_MAP.push(['_object_TypedArray_Int32Array_iterable_', new Int32Array(0)]);
ANY_MAP.push(['_object_TypedArray_Uint8Array_iterable_', new Uint8Array(0)]);
ANY_MAP.push(['_object_TypedArray_Uint8ClampedArray_iterable_', new Uint8ClampedArray(0)]);
ANY_MAP.push(['_object_TypedArray_Uint16Array_iterable_', new Uint16Array(0)]);
ANY_MAP.push(['_object_TypedArray_Uint32Array_iterable_', new Uint32Array(0)]);
ANY_MAP.push(['_object_TypedArray_Float32Array_iterable_', new Float32Array(0)]);
ANY_MAP.push(['_object_TypedArray_Float64Array_iterable_', new Float64Array(0)]);
ANY_MAP.push(['_object_TypedArray_BigInt64Array_iterable_', new BigInt64Array(0)]);
ANY_MAP.push(['_object_TypedArray_BigUint64Array_iterable_', new BigUint64Array(0)]);

// ArrayBuffer
ANY_MAP.push(['_object_ArrayBuffer_', new ArrayBuffer(0)]);
ANY_MAP.push(['_object_DataView_', new DataView(new ArrayBuffer(0))]);

// collections
ANY_MAP.push(['_object_Map_iterable_', new Map()]);
ANY_MAP.push(['_object_Set_iterable_', new Set()]);
ANY_MAP.push(['_object_WeakMap_', new WeakMap()]);
ANY_MAP.push(['_object_WeakSet_', new WeakSet()]);

// date
ANY_MAP.push(['_object_Date_', new Date()]);

// regexp
ANY_MAP.push(['_object_RegExp_', new RegExp('')]);

// error
ANY_MAP.push(['_object_Error_', new Error()]);
ANY_MAP.push(['_object_Error_EvalError_', new EvalError()]);
ANY_MAP.push(['_object_Error_RangeError_', new RangeError()]);
ANY_MAP.push(['_object_Error_ReferenceError_', new ReferenceError()]);
ANY_MAP.push(['_object_Error_SyntaxError_', new SyntaxError()]);
ANY_MAP.push(['_object_Error_TypeError_', new TypeError()]);
ANY_MAP.push(['_object_Error_URIError_', new URIError()]);

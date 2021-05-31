/* istanbul ignore file */

class TestClass {}

const localAnyMap: [string, any][] = [];

// boolean
localAnyMap.push(['_primitive_boolean_falsy_', false]);
localAnyMap.push(['_primitive_boolean_', true]);
localAnyMap.push(['_object_Boolean_', new Boolean(false)]);
localAnyMap.push(['_object_Boolean_', new Boolean(true)]);

// string
localAnyMap.push(['_primitive_string_falsy_iterable_', '']);
localAnyMap.push(['_primitive_string_iterable_', 'a']);
localAnyMap.push(['_object_String_iterable_', new String('')]);

// number
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
localAnyMap.push(['_primitive_bigint_falsy_', BigInt(0)]);
localAnyMap.push(['_primitive_bigint_falsy_negative_', BigInt(-0)]);
localAnyMap.push(['_primitive_bigint_', BigInt(1)]);
localAnyMap.push(['_primitive_bigint_negative_', BigInt(-1)]);

// symbol
localAnyMap.push(['_primitive_symbol_', Symbol()]);

// void
localAnyMap.push(['_primitive_object_null_falsy_nullish_', null]);
localAnyMap.push(['_primitive_undefined_falsy_nullish_', undefined]);

// function
localAnyMap.push(['_function_', () => null]);

// object
localAnyMap.push(['_object_plainobject_', {}]);
localAnyMap.push(['_object_plainobject_', Object.create(null)]);
localAnyMap.push(['_object_', new TestClass()]);

// array
localAnyMap.push(['_object_Array_iterable_', []]);

// TypedArray
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
localAnyMap.push(['_object_ArrayBuffer_', new ArrayBuffer(0)]);
localAnyMap.push(['_object_DataView_', new DataView(new ArrayBuffer(0))]);

// collections
localAnyMap.push(['_object_Map_iterable_', new Map()]);
localAnyMap.push(['_object_Set_iterable_', new Set()]);
localAnyMap.push(['_object_WeakMap_', new WeakMap()]);
localAnyMap.push(['_object_WeakSet_', new WeakSet()]);

// date
localAnyMap.push(['_object_Date_', new Date()]);

// regexp
localAnyMap.push(['_object_RegExp_', new RegExp('')]);

// error
localAnyMap.push(['_object_Error_', new Error()]);
localAnyMap.push(['_object_Error_EvalError_', new EvalError()]);
localAnyMap.push(['_object_Error_RangeError_', new RangeError()]);
localAnyMap.push(['_object_Error_ReferenceError_', new ReferenceError()]);
localAnyMap.push(['_object_Error_SyntaxError_', new SyntaxError()]);
localAnyMap.push(['_object_Error_TypeError_', new TypeError()]);
localAnyMap.push(['_object_Error_URIError_', new URIError()]);

export const ANY_MAP: ReadonlyArray<[string, any]> = localAnyMap;

import { JSONValue } from './json-value.type';

/**
 * A native JavaScript object literal resulting from the deserialization of a JavaScript Object Notation (JSON).
 */
export type DeserializedJSON = { [key: string]: JSONValue } | { [key: string]: JSONValue }[];

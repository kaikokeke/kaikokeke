import { JSONValue } from './json-value.type';

/**
 * A native JavaScript object literal resulting from the parse of a JavaScript Object Notation (JSON).
 */
export type ParsedJSON = Record<string, JSONValue> | JSONValue[];

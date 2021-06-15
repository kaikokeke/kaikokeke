/**
 * A valid JavaScript Object Notation (JSON) value type.
 */
export type JSONValue = string | number | boolean | null | JSONValue[] | { [key: string]: JSONValue };

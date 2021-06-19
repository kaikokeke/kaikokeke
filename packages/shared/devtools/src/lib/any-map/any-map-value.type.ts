/**
 * A tuple with the keyword, the value and the description.
 *
 * All keywords must be surrounded by the character `_` to allow searching for complete keyword.
 * @example
 * const value: AnyMapValue = ['_string_falsy_': '', "string ''"];
 */
export type AnyMapValue = [string, any, string];

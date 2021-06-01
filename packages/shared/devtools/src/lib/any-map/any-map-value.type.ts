/**
 * A tuple with the value keywords and the value.
 *
 * All keywords must be surrounded by the character `_` to allow searching for complete keyword.
 * @example
 * const value: AnyMapValue = ['_string_falsy_': ''];
 */
export type AnyMapValue = [string, any];

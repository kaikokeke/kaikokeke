/**
 * A filter to match a value of type `any` using a full string, a regular expresion or a predicate.
 */
export type AnyMapFilter = string | RegExp | ((key: string) => boolean);

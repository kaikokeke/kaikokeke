/**
 * Type to ensure that an array has at least one alement.
 */
export type AtLeastOne<T> = [T, ...T[]];

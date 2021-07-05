/**
 * An environment property value.
 */
export type Property = string | number | boolean | null | Property[] | { [key: string]: Property };

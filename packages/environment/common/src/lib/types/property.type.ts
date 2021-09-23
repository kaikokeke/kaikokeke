/**
 * An environment property value.
 */
export type Property =
  | string
  | number
  | boolean
  | null
  | Property[]
  | readonly Property[]
  | { [key: string]: Property };

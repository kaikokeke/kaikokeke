/**
 * The any map value.
 */
export interface AnyMapValue {
  /**
   * The any map value keyword.
   * Must be surrounded by the character `_` to allow searching for complete keyword.
   */
  key: string;
  /**
   * The any value.
   */
  value: any;
  /**
   * The any map value description.
   */
  description: string;
}

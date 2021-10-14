/**
 * A lifecycle hook that is called before start the properties sources load.
 */
export interface OnBeforeLoad {
  /**
   * Handles any additional tasks before start the properties sources load.
   */
  onBeforeLoad(): void;
}

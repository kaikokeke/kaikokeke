/**
 * A lifecycle hook that is called after all properties sources complete.
 */
export interface OnAfterComplete {
  /**
   * Handles any additional tasks after all properties sources complete.
   */
  onAfterComplete(): void;
}

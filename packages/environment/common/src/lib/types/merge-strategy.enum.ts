/**
 * Property source merge strategy.
 */
export enum MergeStrategy {
  /**
   * Recursively merge own and inherited enumerable values into the properties.
   */
  MERGE = 'merge',
  /**
   * Overwrite the properties enumerable root values.
   */
  OVERWRITE = 'overwrite',
}

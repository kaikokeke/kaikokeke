export interface PropertyLoader {
  /**
   * Loads the environment properties from sources.
   * @returns A promise to report the loading of properties.
   */
  load(): Promise<void>;

  /**
   * Loads the environment properties for lazy loaded modules.
   * @returns A promise to report the loading of properties.
   */
  loadChild(): Promise<void>;
}

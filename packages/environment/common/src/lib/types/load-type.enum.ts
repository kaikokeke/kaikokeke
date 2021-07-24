/**
 * Defines how source affects the loading of the application.
 */
export enum LoadType {
  /**
   * The application will load immediately after loading all the initialization sources.
   * Will emit once and will complete after the first load.
   */
  INITIALIZATION = 'initialization',

  /**
   * The referred sources will not affect the loading of the application.
   * Can emit multiple time and will be completed on loader destroy.
   */
  DEFERRED = 'deferred',
}

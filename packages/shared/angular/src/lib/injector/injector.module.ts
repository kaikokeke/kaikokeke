import { Inject, Injector, NgModule } from '@angular/core';

/**
 * Exposes the Angular's implemented Injector.
 */
@NgModule()
export class InjectorModule {
  private static _injector: Injector;

  /**
   * Gets the Angular's implemented Injector.
   */
  static get injector(): Injector {
    return InjectorModule._injector;
  }

  constructor(@Inject(Injector) protected readonly injector: Injector) {
    InjectorModule._injector = this.injector;
  }
}

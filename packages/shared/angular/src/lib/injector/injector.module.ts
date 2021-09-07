import { Inject, Injector, NgModule, Optional } from '@angular/core';

/**
 * Exposes the Angular's implemented Injector.
 */
@NgModule()
export class InjectorModule {
  private static _injector?: Injector;

  /**
   * Gets the Angular's implemented Injector.
   */
  static get injector(): Injector | undefined {
    return InjectorModule._injector;
  }

  constructor(@Optional() @Inject(Injector) protected readonly injector: Injector) {
    InjectorModule._injector = this.injector;
  }
}

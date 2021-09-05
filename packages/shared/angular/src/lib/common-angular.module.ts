import { NgModule, Type } from '@angular/core';

import { ServiceInjectorModule } from './service-injector';

const sharedImports: (unknown[] | Type<unknown>)[] = [ServiceInjectorModule];

@NgModule({
  imports: [...sharedImports],
  exports: [...sharedImports],
})
export class KaikokekeCommonAngularModule {}

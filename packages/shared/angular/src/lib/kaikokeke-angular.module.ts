import { NgModule, Type } from '@angular/core';

import { InjectorModule } from './injector';

const sharedImports: (unknown[] | Type<unknown>)[] = [InjectorModule];

@NgModule({
  imports: [...sharedImports],
  exports: [...sharedImports],
})
export class KaikokekeAngularModule {}

/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { NgModule, Type } from '@angular/core';

import { ServiceInjectorModule } from './service-injector';

const sharedImports: (any[] | Type<any>)[] = [ServiceInjectorModule];

@NgModule({
  imports: [CommonModule, ...sharedImports],
  exports: [...sharedImports],
})
export class KaikokekeCommonAngularModule {}

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ServiceInjectorModule } from './service-injector';

@NgModule({
  imports: [CommonModule, ServiceInjectorModule],
})
export class KaikokekeCommonAngularModule {}

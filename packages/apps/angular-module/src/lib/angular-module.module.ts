import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { EnvironmentLoader } from '@kaikokeke/environment';
import { EnvironmentModule } from '@kaikokeke/environment-angular';

import { AngularModuleRouting } from './angular-module.routing';
import { PROPERTIES_SOURCE_PROVIDERS } from './environment/properties.sources';
import { EnvironmentComponent } from './pages/environment/environment.component';

@NgModule({
  imports: [CommonModule, AngularModuleRouting, EnvironmentModule.forChild()],
  declarations: [EnvironmentComponent],
  providers: [...PROPERTIES_SOURCE_PROVIDERS],
})
export class AngularModuleModule {
  constructor(protected readonly loader: EnvironmentLoader) {
    this.loader.load();
  }
}

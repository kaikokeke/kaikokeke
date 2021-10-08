import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ModuleNeededPropertiesGuard } from './guards/needed-properties.guard';
import { EnvironmentComponent } from './pages/environment/environment.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: EnvironmentComponent,
    canActivate: [ModuleNeededPropertiesGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AngularModuleRouting {}

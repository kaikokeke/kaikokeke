import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { EnvironmentComponent } from './pages/environment/environment.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', component: EnvironmentComponent },
  {
    path: 'module',
    loadChildren: () => import('@kaikokeke/apps/angular-module').then((m) => m.AngularModuleModule),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRouting {}

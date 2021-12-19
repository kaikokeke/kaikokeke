import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { KaikokekeAngularModule } from '@kaikokeke/angular';

import { AppComponent } from './app.component';
import { AppRouting } from './app.routing';
import { RxjsEnvironmentModule } from './environment/rxjs-environment.module';
import { EnvironmentComponent } from './pages/environment/environment.component';

@NgModule({
  declarations: [AppComponent, EnvironmentComponent],
  imports: [BrowserModule, AppRouting, KaikokekeAngularModule, RxjsEnvironmentModule],
  bootstrap: [AppComponent],
})
export class AppModule {}

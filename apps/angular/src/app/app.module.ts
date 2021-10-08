import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AkitaNgDevtools } from '@datorama/akita-ngdevtools';
import { KaikokekeAngularModule } from '@kaikokeke/angular';

import { environment } from '../environments/environment';
import { AppComponent } from './app.component';
import { AppRouting } from './app.routing';
import { AkitaEnvironmentModule } from './environment/akita-environment.module';
import { EnvironmentComponent } from './pages/environment/environment.component';

@NgModule({
  declarations: [AppComponent, EnvironmentComponent],
  imports: [
    BrowserModule,
    AppRouting,
    KaikokekeAngularModule,
    AkitaEnvironmentModule,
    environment.production ? [] : AkitaNgDevtools.forRoot(),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}

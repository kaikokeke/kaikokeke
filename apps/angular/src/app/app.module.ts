import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AkitaNgDevtools } from '@datorama/akita-ngdevtools';
import { KaikokekeAngularModule } from '@kaikokeke/angular';

import { environment } from '../environments/environment';
import { AppComponent } from './app.component';
import { AkitaEnvironmentModule } from './environment/akita-environment.module';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    KaikokekeAngularModule,
    AkitaEnvironmentModule,
    environment.production ? [] : AkitaNgDevtools.forRoot(),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}

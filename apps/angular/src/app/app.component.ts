import { Component } from '@angular/core';
import { serviceInjector } from '@kaikokeke/angular';
import { EnvironmentQuery } from '@kaikokeke/environment';

@Component({
  selector: 'kaikokeke-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'angular';
  env: EnvironmentQuery = serviceInjector(EnvironmentQuery);
}

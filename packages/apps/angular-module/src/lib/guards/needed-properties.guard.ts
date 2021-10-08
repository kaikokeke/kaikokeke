import { Injectable } from '@angular/core';
import { AtLeastOne } from '@kaikokeke/common';
import { Path } from '@kaikokeke/environment';
import { KPropertiesGuard } from '@kaikokeke/environment-angular';

@Injectable({ providedIn: 'root' })
export class ModuleNeededPropertiesGuard extends KPropertiesGuard {
  neededPaths: AtLeastOne<Path> = ['post2'];
  dueTime: number | Date = 10000;
  urlOnError = '/';
}

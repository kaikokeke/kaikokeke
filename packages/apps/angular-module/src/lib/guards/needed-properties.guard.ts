import { Injectable } from '@angular/core';
import { AtLeastOne, Path } from '@kaikokeke/common';
import { KPropertiesGuard } from '@kaikokeke/environment-angular';

@Injectable({ providedIn: 'root' })
export class ModuleNeededPropertiesGuard extends KPropertiesGuard {
  neededPaths: AtLeastOne<Path> = ['post2'];
  dueTime: number | Date = 10000;
  urlOnError = '/';
}

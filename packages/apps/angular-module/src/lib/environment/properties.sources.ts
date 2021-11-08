import { HttpClient } from '@angular/common/http';
import { Injectable, Provider } from '@angular/core';
import { firstNonNil } from '@kaikokeke/common';
import { EnvironmentQuery, Properties, PropertiesSource, Property } from '@kaikokeke/environment';
import { ENVIRONMENT_SOURCES } from '@kaikokeke/environment-angular';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class Post2Source extends PropertiesSource {
  readonly name = 'Post2Source';
  readonly requiredToLoad = true;
  readonly path = 'post2';

  readonly collection = 'posts';
  readonly postId = 2;

  constructor(protected readonly http: HttpClient, protected readonly query: EnvironmentQuery) {
    super();
  }

  load(): Observable<Properties> {
    const basePath$: Observable<Property> = this.query.get$('basePath').pipe(firstNonNil());

    return basePath$.pipe(
      switchMap((basePath) => this.http.get<Properties>(`${basePath}/${this.collection}/${this.postId}`)),
    );
  }
}

export const PROPERTIES_SOURCE_PROVIDERS: Provider[] = [
  { provide: ENVIRONMENT_SOURCES, useClass: Post2Source, multi: true },
];

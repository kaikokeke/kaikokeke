import { HttpClient } from '@angular/common/http';
import { Injectable, Provider } from '@angular/core';
import { firstNonNil } from '@kaikokeke/common';
import { EnvironmentQuery, EnvironmentService, Properties, PropertiesSource, Property } from '@kaikokeke/environment';
import { ENVIRONMENT_SOURCES } from '@kaikokeke/environment-angular';
import { combineLatest, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AngularEnvironmentSource extends PropertiesSource {
  readonly name = 'AngularEnvironmentSource';
  readonly requiredToLoad = true;

  load(): Properties[] {
    return [environment];
  }
}

@Injectable({ providedIn: 'root' })
export class LocalJsonSource extends PropertiesSource {
  readonly name = 'LocalJsonSource';
  readonly requiredToLoad = true;

  readonly jsonPath = 'assets/environment.json';

  constructor(protected readonly http: HttpClient) {
    super();
  }

  load(): Observable<Properties> {
    return this.http.get<Properties>(this.jsonPath);
  }
}

@Injectable({ providedIn: 'root' })
export class PostSource extends PropertiesSource {
  readonly name = 'PostSource';
  readonly requiredToLoad = true;
  readonly path = 'post';

  readonly collection = 'posts';
  readonly postId = 1;
  readonly timeout = 5000;

  constructor(protected readonly http: HttpClient, protected readonly query: EnvironmentQuery) {
    super();
  }

  load(): Observable<Properties> {
    const basePath$: Observable<Property> = this.query.get$('basePath').pipe(firstNonNil(this.timeout));

    return basePath$.pipe(
      switchMap((basePath: Property) => this.http.get<Properties>(`${basePath}/${this.collection}/${this.postId}`)),
    );
  }
}

@Injectable({ providedIn: 'root' })
export class UserSource extends PropertiesSource {
  readonly name = 'UserSource';
  readonly requiredToLoad = true;
  readonly path = 'post.user';

  readonly collection = 'users';
  readonly timeout = 5000;

  constructor(
    protected readonly http: HttpClient,
    protected readonly query: EnvironmentQuery,
    protected readonly service: EnvironmentService,
  ) {
    super();
  }

  load(): Observable<Properties> {
    const basePath$: Observable<Property> = this.query.get$('basePath').pipe(firstNonNil(this.timeout));
    const userId$: Observable<Property> = this.query.get$('post.userId').pipe(firstNonNil(this.timeout));

    return combineLatest([basePath$, userId$]).pipe(
      switchMap(([basePath, userId]: [Property, Property]) =>
        this.http.get<Properties>(`${basePath}/${this.collection}/${userId}`),
      ),
    );
  }
}

export const PROPERTIES_SOURCE_PROVIDERS: Provider[] = [
  { provide: ENVIRONMENT_SOURCES, useClass: AngularEnvironmentSource, multi: true },
  { provide: ENVIRONMENT_SOURCES, useClass: LocalJsonSource, multi: true },
  { provide: ENVIRONMENT_SOURCES, useClass: PostSource, multi: true },
  { provide: ENVIRONMENT_SOURCES, useClass: UserSource, multi: true },
];

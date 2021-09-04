import { Injectable } from '@angular/core';
import { Properties, PropertiesSource } from '@kaikokeke/environment';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class TestSources extends PropertiesSource {
  readonly loadInOrder = true;
  readonly requiredToLoad = false;
  readonly loadImmediately = true;

  load(): Observable<Properties> {
    return of({ a: 0 }).pipe(delay(3000));
  }
}

@Injectable({ providedIn: 'root' })
export class TestSources2 extends PropertiesSource {
  readonly loadInOrder = true;
  readonly requiredToLoad = false;

  load(): Observable<Properties> {
    return of({ b: 0 }).pipe(delay(3000));
  }
}

@Injectable({ providedIn: 'root' })
export class TestSources3 extends PropertiesSource {
  readonly loadInOrder = true;
  readonly requiredToLoad = true;

  load(): Observable<Properties> {
    return of({ c: 0 }).pipe(delay(3000));
  }
}

@Injectable({ providedIn: 'root' })
export class TestSources4 extends PropertiesSource {
  readonly loadInOrder = false;
  readonly requiredToLoad = false;

  load(): Observable<Properties> {
    return of({ d: 0 }).pipe(delay(5000));
  }
}

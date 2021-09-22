# Environment Loader

## Examples of use

### Completes after error

Is a common requirement to complete all sources after application load error and reset the environment store.
It's easy to do by overriding `onError()`.

```ts
import { EnvironmentLoader, EnvironmentService, PropertiesSource } from '@kaikokeke/environment';

class CompletesOnErrorEnvironmentLoader extends EnvironmentLoader {
  constructor(
    protected readonly service: EnvironmentService,
    protected readonly sources?: PropertiesSource | PropertiesSource[],
  ) {
    super(service, sources);
  }

  protected onError(index: number, error: Error): void {
    this.onDestroySources(index);
    this.service.reset();
  }
}
```

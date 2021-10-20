# Environment Config Factory

Returns the environment configuration with all default values for the Environment module.

```ts
export function environmentConfigFactory(config?: Partial<EnvironmentConfig>): EnvironmentConfig;
```

Returns the environment configuration with all default values.

## Example of use

```ts
import { environmentConfigFactory } from '@kaikokeke/environment';

environmentConfigFactory();
// { interpolation: ['{{', '}}'], useEnvironmentToTranspile: false }

environmentConfigFactory({ interpolation: ['(', ')'] });
// { interpolation: ['(', ')'], useEnvironmentToTranspile: false }

environmentConfigFactory({ useEnvironmentToTranspile: true });
// { interpolation: ['{{', '}}'], useEnvironmentToTranspile: true }

environmentConfigFactory({ interpolation: ['(', ')'], useEnvironmentToTranspile: true });
// { interpolation: ['(', ')'], useEnvironmentToTranspile: true }
```

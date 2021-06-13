# Has Changed

Checks if a SimpleChange has a new value using deep comparison.

## API

### `function hasChanged(simpleChange: SimpleChange): boolean`

```ts
import { hasChanged } from '@kaikokeke/common-angular';

hasChanged(new SimpleChange({ a: 0 }, { a: 1 }, true)); // true
hasChanged(new SimpleChange({ a: 0 }, { a: 0 }, true)); // false
```

## Example of use

```ts
import { OnChanges, SimpleChanges } from '@angular/core';
import { hasChanged } from '@kaikokeke/common-angular';

@Component({ template: '' })
class TestComponent implements OnChanges {
  @Input() id: any;

  ngOnChanges(changes: SimpleChanges): void {
    if(hasChanged(changes.id)) {...}
  }
}
```

# Has Changed Skip First

Checks if a SimpleChange has a new value using deep comparison and it's not the first change.

## API

### Function

#### `function hasChangedSkipFirst(simpleChange: SimpleChange): boolean`

```ts
import { hasChangedSkipFirst } from '@kaikokeke/common-angular';

hasChangedSkipFirst(new SimpleChange({ a: 0 }, { a: 1 }, false)); // true
hasChangedSkipFirst(new SimpleChange({ a: 0 }, { a: 1 }, true)); // false
hasChangedSkipFirst(new SimpleChange({ a: 0 }, { a: 0 }, false)); // false
```

## Example of use

```ts
import { OnChanges, SimpleChanges } from '@angular/core';
import { hasChangedSkipFirst } from '@kaikokeke/common-angular';

@Component({ template: '' })
class TestComponent implements OnChanges {
  @Input() id: any;

  ngOnChanges(changes: SimpleChanges): void {
    if(hasChangedSkipFirst(changes.id)) {...}
  }
}
```

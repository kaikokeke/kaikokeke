import { LoaderPropertiesSource } from './loader-properties-source.type';
import { Properties } from './properties.type';

export interface OnBeforeSourceEmit {
  onBeforeSourceEmit(properties: Properties, source: LoaderPropertiesSource): void;
}

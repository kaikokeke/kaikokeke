import { LoaderPropertiesSource } from './loader-properties-source.type';
import { Properties } from './properties.type';

export interface OnAfterSourceEmit {
  onAfterSourceEmit(properties: Properties, source: LoaderPropertiesSource): void;
}

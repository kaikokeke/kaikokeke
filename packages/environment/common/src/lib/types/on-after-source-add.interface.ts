import { LoaderPropertiesSource } from './loader-properties-source.type';
import { Properties } from './properties.type';

export interface OnAfterSourceAdd {
  onAfterSourceAdd(properties: Properties, source: LoaderPropertiesSource): void;
}

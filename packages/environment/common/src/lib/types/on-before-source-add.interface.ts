import { LoaderPropertiesSource } from './loader-properties-source.type';
import { Properties } from './properties.type';

export interface OnBeforeSourceAdd {
  onBeforeSourceAdd(properties: Properties, source: LoaderPropertiesSource): void;
}

import { Properties } from './properties.type';

export interface PropertyStore {
  getProperties(): Properties;
  updateProperties(newProperties: Properties): void;
}

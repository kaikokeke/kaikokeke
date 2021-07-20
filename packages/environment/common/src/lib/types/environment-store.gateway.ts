import { Properties } from './properties.type';

export interface EnvironmentStoreGateway {
  getProperties(): Properties;
  updateProperties(newProperties: Properties): void;
  resetProperties(): void;
}

import { Properties } from '../types';

export interface EnvironmentStoreGateway {
  getProperties(): Properties;
  updateProperties(newProperties: Properties): void;
  resetProperties(): void;
}

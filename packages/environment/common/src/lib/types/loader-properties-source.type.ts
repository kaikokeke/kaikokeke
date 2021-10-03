import { MarkOptional } from 'ts-essentials';

import { PropertiesSource } from '../application';

/**
 * A properties source with all the default values to be used by the EnvironmentLoader.
 */
export type LoaderPropertiesSource = MarkOptional<Required<PropertiesSource>, 'path'> & { readonly id: string };

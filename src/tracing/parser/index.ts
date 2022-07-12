import { ParserBundle } from '../types';
import { landEventParser } from './land';

export const eventParser: ParserBundle = {
  ...landEventParser,
};

import { ParserBundle } from '../types';
import { apostleEventParser } from './apostle';
import { landEventParser } from './land';

export const eventParser: ParserBundle = {
  ...landEventParser,
  ...apostleEventParser,
};

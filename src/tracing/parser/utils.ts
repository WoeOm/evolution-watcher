import { DBClient } from '../db/client';
import { LogsCollection, Parser } from '../types';
import { logger } from '../utils/logger';

export const getParserHandle = (parser: Parser, log: LogsCollection) => {
  const logDescription = parser.interface.parseLog({ data: log.data, topics: log.topics });
  const hundle = parser.events[logDescription.signature];
  return { logDescription, hundle };
};

export const getEvolutionLandDB = async (uri) => {
  const client = new DBClient(uri);
  const connect = await client.connect();
  return connect.db('evo');
};

export const loggerError = (module: string, log: LogsCollection, tokenId: string) => {
  logger.error(`❤️ | ${module} | matchedCount != 1 | logTx: ${log.transaction_hash} logIndex: ${log.log_index} tokenId: ${tokenId}`);
};

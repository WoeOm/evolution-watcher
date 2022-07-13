import { DBClient } from '../db/client';
import { collections, LogsCollection, Parser } from '../types';
import { logger } from '../utils/logger';
import { BigNumber } from 'ethers';

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

export function parseTokenId(tokenId: string): string {
  const tokenIdBn = BigNumber.from(tokenId);
  const typeCode = tokenIdBn.shr(192).and(BigNumber.from(255));

  switch (typeCode.toNumber()) {
    case 1:
      return collections.LAND;
    case 2:
      return collections.APOSTLE;
    case 3:
      return collections.MIRRORKITTY;
    case 4:
    case 5:
      // 4 - drill
      // 5 - synthesis drill
      return collections.DRILL;
    case 6:
      return collections.EQUIPMENT;
    default:
      return collections.OTHER;
  }
}

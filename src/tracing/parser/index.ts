import { LogDescription } from 'ethers/lib/utils';
import { BigNumber } from 'ethers';
import { BulkWriteOptions, Db, MongoDBNamespace, Timestamp } from 'mongodb';
import { collections, ERC721Collection, ParserBundle, ParserHandle } from '../types';
import { isZeroAddress } from '../utils/address';
import { ObjectOwnershipIface } from './abi/interface';

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

export const eventParser: ParserBundle = {
  // OBJECTOWNERSHIP
  '0x3788df4fdc026f5ea91a333fcf7ced7a52c92471': {
    interface: ObjectOwnershipIface,
    events: {
      'Transfer(address,address,uint256)': async (db, description, log, options: BulkWriteOptions = {}) => {
        const from = description.args[0].toLowerCase();
        const to = description.args[1].toLowerCase();
        const tokenId = description.args[2].toHexString();
        const nftType = parseTokenId(tokenId);
        const collection = db.collection<ERC721Collection>(nftType);

        if (isZeroAddress(from)) {
          await collection.insertOne(
            {
              owner: to,
              token_id: tokenId,
              updated_at: log.transaction_hash,
            },
            { ...options },
          );
          return;
        }

        await collection.updateOne(
          { token_id: tokenId },
          [
            {
              $set: {
                owner: to,
                updated_at: log.transaction_hash,
              },
            },
          ],
          { upsert: true, ...options },
        );
      },
    },
  },
};

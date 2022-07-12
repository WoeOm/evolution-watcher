import { LogDescription } from 'ethers/lib/utils';
import { BigNumber } from 'ethers';
import { BulkWriteOptions, Db, MongoDBNamespace, Timestamp } from 'mongodb';
import { collections, ERC721Collection, LandAuctionCollection, ParserBundle, ParserHandle } from '../types';
import { isZeroAddress } from '../utils/address';
import { ObjectOwnershipIface, ClockAuctionV3Iface } from './abi/interface';
import { address } from './address/crabtest';
import { logger } from '../utils/logger';
import { loggerError } from './utils';

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

export const landEventParser: ParserBundle = {
  [address.OBJECTOWNERSHIP.toLowerCase()]: {
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

        const result = await collection.updateOne(
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

        if (result.matchedCount !== 1) {
          loggerError('LAND_CLOCK_AUCTION::Transfer', log, tokenId);
        }
      },
    },
  },

  // LAND_CLOCK_AUCTION
  [address.LAND_CLOCK_AUCTION.toLowerCase()]: {
    interface: ClockAuctionV3Iface,
    events: {
      'AuctionCreated(uint256,address,uint256,uint256,uint256,address)': async (db, description, log, options: BulkWriteOptions = {}) => {
        const tokenId = description.args.tokenId.toHexString();
        const seller = description.args.seller.toLowerCase();
        const startingPriceInToken = description.args.startingPriceInToken.toString();
        const endingPriceInToken = description.args.endingPriceInToken.toString();
        const duration = description.args.duration.toString();
        const token = description.args.token.toLowerCase();

        const collection = db.collection<LandAuctionCollection>(collections.LAND_AUCTION);

        await collection.insertOne(
          {
            token_id: tokenId,
            seller: seller,
            starting_price_in_token: startingPriceInToken,
            ending_price_in_token: endingPriceInToken,
            duration: duration,
            token: token,
            updated_at: log.transaction_hash,
            status: 'created',
          },
          { ...options },
        );
        return;
      },
      'AuctionSuccessful(uint256,uint256,address)': async (db, description, log, options: BulkWriteOptions = {}) => {
        const collection = db.collection<LandAuctionCollection>(collections.LAND_AUCTION);
        const tokenId = description.args.tokenId.toHexString();
        const totalPrice = description.args.totalPrice.toString();
        const winner = description.args.winner.toLowerCase();

        const result = await collection.updateOne(
          { token_id: tokenId, status: 'created' },
          [
            {
              $set: {
                status: 'successful',
                total_price: totalPrice,
                winner: winner,
                updated_at: log.transaction_hash,
              },
            },
          ],
          { upsert: true, ...options },
        );

        if (result.matchedCount !== 1) {
          loggerError('LAND_CLOCK_AUCTION::AuctionSuccessful', log, tokenId);
        }
      },
      'AuctionCancelled(uint256)': async (db, description, log, options: BulkWriteOptions = {}) => {
        const collection = db.collection<LandAuctionCollection>(collections.LAND_AUCTION);
        const tokenId = description.args.tokenId.toHexString();

        const result = await collection.updateOne(
          { token_id: tokenId, status: 'created' },
          [
            {
              $set: {
                status: 'cancelled',
                updated_at: log.transaction_hash,
              },
            },
          ],
          { upsert: true, ...options },
        );

        if (result.matchedCount !== 1) {
          loggerError('LAND_CLOCK_AUCTION::AuctionCancelled', log, tokenId);
        }
      },
      'NewBid(uint256,address,address,uint256,address,uint256,uint256)': async (db, description, log, options: BulkWriteOptions = {}) => {
        const collection = db.collection<LandAuctionCollection>(collections.LAND_AUCTION);

        const tokenId = description.args.tokenId.toHexString();
        const lastBidder = description.args.lastBidder.toLowerCase();
        const lastReferer = description.args.lastReferer.toLowerCase();
        const lastRecord = description.args.lastRecord.toString();
        const tokenAddress = description.args.tokenAddress.toLowerCase();
        const bidStartAt = description.args.bidStartAt.toString();
        const returnToLastBidder = description.args.returnToLastBidder.toString();

        const result = await collection.updateOne(
          { token_id: tokenId, status: 'created' },
          {
            $push: {
              bids: {
                token_id: tokenId,
                last_bidder: lastBidder,
                last_referer: lastReferer,
                last_record: lastRecord,
                token_address: tokenAddress,
                bid_start_at: bidStartAt,
                return_to_last_bidder: returnToLastBidder,
                updated_at: log.transaction_hash,
              },
            },
          },
          { upsert: true, ...options },
        );

        if (result.matchedCount !== 1) {
          loggerError('LAND_CLOCK_AUCTION::NewBid', log, tokenId);
        }
      },
    },
  },
};

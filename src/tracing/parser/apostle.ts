import { BulkWriteOptions } from 'mongodb';
import { ApostleAuctionCollection, collections, ParserBundle } from '../types';
import { ClockAuctionV3Iface } from './abi/interface';
import { address } from './address/crabtest';
import { loggerError } from './utils';

export const apostleEventParser: ParserBundle = {
  // APOSTLE_CLOCK_AUCTION
  [address.APOSTLE_CLOCK_AUCTION.toLowerCase()]: {
    interface: ClockAuctionV3Iface,
    events: {
      'AuctionCreated(uint256,address,uint256,uint256,uint256,address)': async (db, description, log, options: BulkWriteOptions = {}) => {
        const tokenId = description.args.tokenId.toHexString();
        const seller = description.args.seller.toLowerCase();
        const startingPriceInToken = description.args.startingPriceInToken.toString();
        const endingPriceInToken = description.args.endingPriceInToken.toString();
        const duration = description.args.duration.toString();
        const token = description.args.token.toLowerCase();
        const startedAt = description.args.startedAt.toString();

        const collection = db.collection<ApostleAuctionCollection>(collections.APOSTLE_AUCTION);

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
            start_at: startedAt,
          },
          { ...options },
        );
        return;
      },
      'AuctionSuccessful(uint256,uint256,address)': async (db, description, log, options: BulkWriteOptions = {}) => {
        const collection = db.collection<ApostleAuctionCollection>(collections.APOSTLE_AUCTION);
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
          loggerError('APOSTLE_CLOCK_AUCTION::AuctionSuccessful', log, tokenId);
        }
      },
      'AuctionCancelled(uint256)': async (db, description, log, options: BulkWriteOptions = {}) => {
        const collection = db.collection<ApostleAuctionCollection>(collections.APOSTLE_AUCTION);
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
          loggerError('APOSTLE_CLOCK_AUCTION::AuctionCancelled', log, tokenId);
        }
      },
      'NewBid(uint256,address,address,uint256,address,uint256,uint256)': async (db, description, log, options: BulkWriteOptions = {}) => {
        const collection = db.collection<ApostleAuctionCollection>(collections.APOSTLE_AUCTION);

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
          loggerError('APOSTLE_CLOCK_AUCTION::NewBid', log, tokenId);
        }
      },
    },
  },
};

import { eventParser } from './index';
import { address } from './address/crabtest';
import { getEvolutionLandDB, getParserHandle } from './utils';

const mongodbURI = process.env.MONGODBURI;

describe('Parser', () => {
  describe('LAND_CLOCK_AUCTION', () => {
    it.skip('AuctionCreated(uint256,address,uint256,uint256,uint256,address)', async () => {
      const log = {
        address: '0x42866eb5fc4d0e2789d7b4646e3026ae06336863',
        block_hash: '0xe0a2d9080eb1bf7470e31149ad41a58bea4a3fc30fbac68fa1a42ae89e670a5c',
        block_number: 9094302,
        data: '0x2a030001030001010000000000000003000000000000000000000000000007af000000000000000000000000735182c782cb8e7806f8903de7913e6880cbf82e000000000000000000000000000000000000000000000000002bd84974a8f400000000000000000000000000000000000000000000000000002bd84974a8f40000000000000000000000000000000000000000000000000000000000000151800000000000000000000000009ac276fbcb568eb9f4679b238efd1b6ea1898435',
        log_index: 0,
        removed: false,
        topics: ['0x41cd13b2421d127cf0c8c95e20200e38997684f55d105ee04e50b1cab9a803ea'],
        transaction_hash: '0xe47f290e0ef33664a3001664913ddae9293018da3537b08d805a081be89040cf',
        transaction_index: 0,
      };
      const parser = eventParser[address.LAND_CLOCK_AUCTION.toLowerCase()];
      const { logDescription, hundle } = getParserHandle(parser, log);

      expect(logDescription.args.startingPriceInToken.toString()).toBe('12341234000000000');
      expect(logDescription.args.endingPriceInToken.toString()).toBe('12341234000000000');
      expect(logDescription.args.duration.toString()).toBe('86400');
      expect(logDescription.args.tokenId.toHexString()).toBe('0x2a030001030001010000000000000003000000000000000000000000000007af');
      expect(logDescription.args.token).toBe('0x9aC276FBcb568Eb9f4679B238efd1b6eA1898435');
      expect(logDescription.args.seller).toBe('0x735182c782CB8e7806F8903dE7913e6880CbF82E');
      if (mongodbURI) {
        const db = await getEvolutionLandDB(mongodbURI);
        hundle(db, logDescription, log);
      }
    });

    it.skip('AuctionSuccessful(uint256,uint256,address)', async () => {
      const log = {
        address: '0x42866eb5fc4d0e2789d7b4646e3026ae06336863',
        block_hash: '0x7e279ca3afcb85ad6e83f8f5ef2b04c261c15f5d38f0853cb71e4e35239b2526',
        block_number: 10936197,
        data: '0x2a030001030001010000000000000003000000000000000000000000000007af000000000000000000000000000000000000000000000000000001d1a94a2000000000000000000000000000d172c9c051f0c5514a14d7585c29bb80c6012745',
        log_index: 0,
        removed: false,
        topics: ['0x4fcc30d90a842164dd58501ab874a101a3749c3d4747139cefe7c876f4ccebd2'],
        transaction_hash: '0x2409fb8c5bd6ef5ba0e4cc3179643a48128066f602cf9709e810883925780192',
        transaction_index: 0,
      };
      const parser = eventParser[address.LAND_CLOCK_AUCTION.toLowerCase()];
      const { logDescription, hundle } = getParserHandle(parser, log);

      expect(logDescription.args.tokenId.toHexString()).toBe('0x2a030001030001010000000000000003000000000000000000000000000007af');
      expect(logDescription.args.totalPrice.toString()).toBe('2000000000000');
      expect(logDescription.args.winner.toLowerCase()).toBe('0xd172c9c051f0c5514a14d7585c29bb80c6012745');

      if (mongodbURI) {
        const db = await getEvolutionLandDB(mongodbURI);
        hundle(db, logDescription, log);
      }
    });

    it.skip('AuctionCancelled(uint256)', async () => {
      const log = {
        address: '0x42866eb5fc4d0e2789d7b4646e3026ae06336863',
        block_hash: '0x7e279ca3afcb85ad6e83f8f5ef2b04c261c15f5d38f0853cb71e4e35239b2526',
        block_number: 10936197,
        data: '0x2a030001030001010000000000000003000000000000000000000000000007af',
        log_index: 0,
        removed: false,
        topics: ['0x2809c7e17bf978fbc7194c0a694b638c4215e9140cacc6c38ca36010b45697df'],
        transaction_hash: '0x2409fb8c5bd6ef5ba0e4cc3179643a48128066f602cf9709e810883925780192',
        transaction_index: 0,
      };
      const parser = eventParser[address.LAND_CLOCK_AUCTION.toLowerCase()];
      const { logDescription, hundle } = getParserHandle(parser, log);

      expect(logDescription.args.tokenId.toHexString()).toBe('0x2a030001030001010000000000000003000000000000000000000000000007af');

      if (mongodbURI) {
        const db = await getEvolutionLandDB(mongodbURI);
        hundle(db, logDescription, log);
      }
    });

    it('NewBid(uint256,address,address,uint256,address,uint256,uint256)', async () => {
      const log = {
        address: '0x42866eb5fc4d0e2789d7b4646e3026ae06336863',
        block_hash: '0x7e279ca3afcb85ad6e83f8f5ef2b04c261c15f5d38f0853cb71e4e35239b2526',
        block_number: 10936197,
        data: '0x000000000000000000000000ec2e4318944570e3ef44842cd196da288a8584440000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001d1a94a20000000000000000000000000009ac276fbcb568eb9f4679b238efd1b6ea18984350000000000000000000000000000000000000000000000000000000062ba75c40000000000000000000000000000000000000000000000000000000000000000',
        log_index: 0,
        removed: false,
        topics: ['0xf86b8f45461d587c6b72cb760aff37ff72027093c426dad66142e60accf26fa7', '0x2a030001030001010000000000000003000000000000000000000000000007af'],
        transaction_hash: '0x2409fb8c5bd6ef5ba0e4cc3179643a48128066f602cf9709e810883925780192',
        transaction_index: 0,
      };
      const parser = eventParser[address.LAND_CLOCK_AUCTION.toLowerCase()];
      const { logDescription, hundle } = getParserHandle(parser, log);

      expect(logDescription.args.tokenId.toHexString()).toBe('0x2a030001030001010000000000000003000000000000000000000000000007af');

      if (mongodbURI) {
        const db = await getEvolutionLandDB(mongodbURI);
        hundle(db, logDescription, log);
      }
    });
  });
});

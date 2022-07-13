import { Interface, LogDescription } from 'ethers/lib/utils';
import { BulkWriteOptions, Db, Timestamp } from 'mongodb';

export const landId = {
  LAND_1: 'land_1',
  LAND_2: 'land_2',
  LAND_3: 'land_3',
  LAND_4: 'land_4',
  LAND_5: 'land_5',

  LAND_1_DEV: 'land_1_dev',
  LAND_2_DEV: 'land_2_dev',
  LAND_3_DEV: 'land_3_dev',
  LAND_4_DEV: 'land_4_dev',
  LAND_5_DEV: 'land_5_dev',
} as const;

export const collections = {
  CONFIG: 'config',
  LOGS: 'logs',

  LAND: 'land',
  APOSTLE: 'apostle',
  DRILL: 'drill',
  SYNTHESISDRILL: 'synthesis_drill',
  MIRRORKITTY: 'mirrorkitty',
  EQUIPMENT: 'equipment',
  OTHER: 'other',
  LAND_AUCTION: 'land_auction',
  APOSTLE_AUCTION: 'apostle_auction',
} as const;

export type LandId = typeof landId[keyof typeof landId];

export interface ConfigCollection {
  instance_id: string;
  name: string;
  key: string;
  value: number;
}

export const configKey = {
  indexerBlockBumber: 'indexer_block_number',
  subIndexerBlockBumber: 'sub_indexer_block_number',
  latestBlockBumber: 'latest_block_number',
  parserBlockBumber: 'parser_block_number',
} as const;

export type ConfigKey = typeof configKey[keyof typeof configKey];

export interface PRCWrapper {
  jsonrpc: 'string';
  id: number;
}

export interface UpdatedAt {
  updated_at: string;
}
export interface RPCLogsCollection {
  address: string;
  blockHash: string;
  blockNumber: number;
  data: string;
  logIndex: number;
  removed: boolean;
  topics: string[];
  transactionHash: string;
  transactionIndex: number;
}

export interface LogsCollection {
  address: string;
  block_hash: string;
  block_number: number;
  data: string;
  log_index: number;
  removed: boolean;
  topics: string[];
  transaction_hash: string;
  transaction_index: number;
}

export interface LandCollection extends UpdatedAt {
  token_id: string;
  owner: string;
  lon?: number;
  lat?: number;
  resource?: number[];
  continent?: number;
  meta_intr?: string;
  meta_cover?: string;
  meta_link?: string;
}

export interface LandAuctionCollection extends UpdatedAt {
  token_id: string;
  seller: string;
  starting_price_in_token: string;
  ending_price_in_token: string;
  duration: string; // in second
  token: string;
  status: 'created' | 'successful' | 'cancelled';
  winner?: string;
  total_price?: string;
  start_at?: string; // TODO
  bids?: Array<LandAuctionBidCollection>;
}

export interface LandAuctionBidCollection extends UpdatedAt {
  token_id: string;
  last_bidder: string;
  last_referer: string;
  last_record: string;
  token_address: string;
  bid_start_at: string;
  return_to_last_bidder: string;
}

export interface ApostleAuctionCollection extends UpdatedAt {
  token_id: string;
  seller: string;
  starting_price_in_token: string;
  ending_price_in_token: string;
  duration: string; // in second
  token: string;
  status: 'created' | 'successful' | 'cancelled';
  winner?: string;
  total_price?: string;
  start_at: string;
  bids?: Array<ApostleAuctionBidCollection>;
}

export interface ApostleAuctionBidCollection extends UpdatedAt {
  token_id: string;
  last_bidder: string;
  last_referer: string;
  last_record: string;
  token_address: string;
  bid_start_at: string;
  return_to_last_bidder: string;
}

export interface ERC721Collection extends UpdatedAt {
  token_id: string;
  owner: string;
}

export type ParserHandle = (db: Db, description: LogDescription, log: LogsCollection, options?: BulkWriteOptions) => Promise<any>;

export interface Parser {
  interface: Interface;
  events: Record<string, ParserHandle>;
}

export type ParserBundle = Record<
  string, // address lowercase
  Parser
>;

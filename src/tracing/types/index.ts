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
  MIRRORKITTY: 'mirrorkitty',
  OTHER: 'other',
} as const;

export type LandId = typeof landId[keyof typeof landId];

export interface ConfigCollection {
  instance_id: string;
  name: string;
  key: string;
  value: number;
}

export const configKey = {
  indexerBlockBumber: 'indexer_block_number', // not included
  latestBlockBumber: 'latest_block_number',
  parserBlockBumber: 'parser_block_number',
} as const;

export type ConfigKey = typeof configKey[keyof typeof configKey];

export interface PRCWrapper {
  jsonrpc: 'string';
  id: number;
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

export interface LandCollection {
  token_id: string;
  owner: string;
  lon?: number;
  lat?: number;
  resource?: number[];
  continent?: number;
  meta_intr?: string;
  meta_cover?: string;
  meta_link?: string;
  updated_at: string;
}

export interface ERC721Collection {
  token_id: string;
  owner: string;
  updated_at: string;
}

export type ParserHandle = (db: Db, description: LogDescription, log: LogsCollection, options?: BulkWriteOptions) => Promise<void>;

export type ParserBundle = Record<
  string,
  {
    interface: Interface;
    events: Record<string, ParserHandle>;
  }
>;

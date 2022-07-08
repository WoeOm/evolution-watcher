import { BulkWriteOptions, Collection, DeleteResult, FindCursor, InsertManyResult, MongoClient, WithId } from 'mongodb';
import { collections, LogsCollection, LandId, RPCLogsCollection } from '../types';
import { BigNumber } from 'ethers';

export class LogsDatabase {
  _client: MongoClient;
  _logsCollection: Collection<LogsCollection>;

  constructor(client: MongoClient) {
    this._client = client;
    this._logsCollection = this._client.db('evo').collection<LogsCollection>(collections.LOGS);
  }

  async getLogs(fromBlock: number, toBlock: number): Promise<FindCursor<WithId<LogsCollection>>> {
    const result = await this._logsCollection.find(
      {
        block_number: {
          $gte: fromBlock,
          $lte: toBlock,
        },
      },
      {
        sort: {
          block_number: 1,
          transaction_index: 1,
          log_index: 1,
        },
      },
    );

    return result;
  }

  async removeLogs(fromBlock: number, toBlock: number, options: BulkWriteOptions = {}): Promise<DeleteResult> {
    const result = await this._logsCollection.deleteMany(
      {
        block_number: {
          $gte: fromBlock,
          $lte: toBlock,
        },
      },
      {
        ...options,
      },
    );
    return result;
  }

  async insertLogs(logs: LogsCollection[], options: BulkWriteOptions = {}): Promise<InsertManyResult<LogsCollection>> {
    const result = await this._logsCollection.insertMany(logs, {
      ordered: true,
      ...options,
    });
    return result;
  }

  async getBlockNumberByCount(fromBlock: number, toBlock: number, limit: number) {
    const result = await this._logsCollection.find(
      {
        block_number: {
          $gte: fromBlock,
          $lte: toBlock,
        },
      },
      {
        sort: {
          block_number: 1,
          transaction_index: 1,
          log_index: 1,
        },
        limit,
      },
    );

    const logs = await result.toArray();
    if (logs.length) {
      const lastest = logs[logs.length - 1];
      return lastest.block_number;
    }
    return null;
  }

  rpcLogsConvert(rpcLog: RPCLogsCollection): LogsCollection {
    return {
      address: rpcLog.address,
      block_hash: rpcLog.blockHash,
      block_number: BigNumber.from(rpcLog.blockNumber).toNumber(),
      data: rpcLog.blockHash,
      log_index: BigNumber.from(rpcLog.logIndex).toNumber(),
      removed: rpcLog.removed,
      topics: rpcLog.topics,
      transaction_hash: rpcLog.transactionHash,
      transaction_index: BigNumber.from(rpcLog.transactionIndex).toNumber(),
    };
  }
}

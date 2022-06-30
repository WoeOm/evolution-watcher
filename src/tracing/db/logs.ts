import { BulkWriteOptions, Collection, FindCursor, InsertManyResult, MongoClient, WithId } from 'mongodb';
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

  async insertLogs(logs: LogsCollection[], options: BulkWriteOptions = {}): Promise<InsertManyResult<LogsCollection>> {
    const result = await this._logsCollection.insertMany(logs, {
      ordered: true,
      ...options,
    });
    return result;
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

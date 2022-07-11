import { DBClient } from '../db/client';
import { ConfigDatabase } from '../db/config';
import { configKey, LandId, landId, LogsCollection } from '../types';
import { rpc_getBlockNumber, rpc_getFilterLogs, rpc_getLogs, rpc_newFilter, wss_getLogs } from '../utils/rpc';
import { BigNumber } from 'ethers';
import { logger } from '../utils/logger';
import { LogsDatabase } from '../db/logs';
import { eventParser } from '../parser';
import { BulkWriteOptions, Db, ReadConcernLevel, WithId } from 'mongodb';

export interface TracingBootstrapParam {
  mongodbURI: string;
  instanceId: string;
  name: string;
  rpc: string;
  address: string[];
}

export class TracingBootstrap {
  _mongodbURI: string;
  _instanceId: string;
  _name: string;
  _address: string[];
  _rpc: string;

  _getBlockNumberWait = 7000;
  _scanContractLogsWait = 1000;
  _parseLogsWait = 6000;
  // _parseLogsWait = [1000, 7000]; // syncing, synced

  _scanContractLogsStep = 200;
  _parseLogsStep = 500;
  _parseLogsBatchSize = 100; // logs count

  _configDatabase: ConfigDatabase;
  _logsDatabase: LogsDatabase;
  _db: Db;
  _client: DBClient;

  constructor({ mongodbURI, instanceId, name, rpc, address = [] }: TracingBootstrapParam) {
    this._mongodbURI = mongodbURI;
    this._instanceId = instanceId;
    this._name = name;
    this._rpc = rpc;
    this._address = address;
  }

  async init() {
    // connect mongodb
    const uri = this._mongodbURI;
    const client = new DBClient(uri);
    const connect = await client.connect();
    this._client = client;
    this._db = connect.db('evo');

    // init database
    this._configDatabase = new ConfigDatabase(connect);
    this._logsDatabase = new LogsDatabase(connect);
  }

  starter() {
    this.getBlockNumber();
    this.scanContractLogs();
    this.parseLogs();
  }

  async getBlockNumber() {
    try {
      const data = await rpc_getBlockNumber(this._rpc);
      const blockNumber = BigNumber.from(data.result);

      this._configDatabase.updateValue(this._instanceId, configKey.latestBlockBumber, blockNumber.toNumber());
      logger.info(`⏱️ | ${this._name} | latestBlockNumber | ${blockNumber.toNumber()}`);
    } catch (error) {
      logger.error(`❤️ | ${this._name} | getBlockNumber | ${error} `);
    } finally {
      setTimeout(() => this.getBlockNumber(), this._getBlockNumberWait);
    }
  }

  async scanContractLogs() {
    const session = this._client.getClient().startSession();

    try {
      const step = this._scanContractLogsStep;
      const indexerConfig = await this._configDatabase.findConfig(this._instanceId, configKey.indexerBlockBumber);
      const lastestBlockConfig = await this._configDatabase.findConfig(this._instanceId, configKey.latestBlockBumber);

      const indexerBlockNumber = indexerConfig.value;
      const lastestBlockNumber = lastestBlockConfig.value;

      const fromBlock = indexerBlockNumber + 1;
      const toBlock = fromBlock + step - 1 >= lastestBlockNumber ? lastestBlockNumber : fromBlock + step - 1;

      // check is touch lateast
      if (fromBlock > lastestBlockNumber) {
        logger.info(`⛏️ | ${this._name} | scanContractLogs | ${fromBlock} is latest, waiting...`);
        return;
      }

      session.startTransaction();

      logger.info(`⛏️ | ${this._name} | scanContractLogs | ${fromBlock} - ${toBlock}, diff ${lastestBlockConfig.value - toBlock}`);

      await this.scanContractLogsHandle(fromBlock, toBlock, this._address, { session });

      await this._configDatabase.updateValue(this._instanceId, configKey.indexerBlockBumber, toBlock, { session });
      await session.commitTransaction();
    } catch (error) {
      console.error('scanContractLogs', error);
      await session.abortTransaction();
    } finally {
      await session.endSession();
      setTimeout(() => this.scanContractLogs(), this._scanContractLogsWait);
    }
  }

  async subScanContractLogs(address: string[]) {
    const session = this._client.getClient().startSession();

    try {
      const step = this._scanContractLogsStep;
      const indexerConfig = await this._configDatabase.findConfig(this._instanceId, configKey.subIndexerBlockBumber);
      const lastestBlockConfig = await this._configDatabase.findConfig(this._instanceId, configKey.latestBlockBumber);

      const indexerBlockNumber = indexerConfig.value;
      const lastestBlockNumber = lastestBlockConfig.value;

      const fromBlock = indexerBlockNumber + 1;
      const toBlock = fromBlock + step - 1 >= lastestBlockNumber ? lastestBlockNumber : fromBlock + step - 1;

      // check is touch lateast
      if (fromBlock > lastestBlockNumber) {
        logger.info(`⛏️ | ${this._name} | subScanContractLogs | ${fromBlock} is latest, waiting...`);
        return;
      }

      session.startTransaction();

      logger.info(`⛏️ | ${this._name} | subScanContractLogs | ${fromBlock} - ${toBlock}, diff ${lastestBlockConfig.value - toBlock}`);

      await this.scanContractLogsHandle(fromBlock, toBlock, address, { session });

      await this._configDatabase.updateValue(this._instanceId, configKey.subIndexerBlockBumber, toBlock, { session });
      await session.commitTransaction();
    } catch (error) {
      logger.error(`❤️ | ${this._name} | subScanContractLogs, ${error} `);
      await session.abortTransaction();
    } finally {
      await session.endSession();
      setTimeout(() => this.subScanContractLogs(address), this._scanContractLogsWait);
    }
  }

  async parseLogs() {
    const session = this._client.getClient().startSession();
    try {
      session.startTransaction();

      const indexerConfig = await this._configDatabase.findConfig(this._instanceId, configKey.indexerBlockBumber);
      const parserConfig = await this._configDatabase.findConfig(this._instanceId, configKey.parserBlockBumber);

      const indexerBlockNumber = indexerConfig.value;
      const parserBlockNumber = parserConfig.value;

      const fromBlock = parserBlockNumber + 1;
      // let toBlock = fromBlock + step - 1 >= indexerBlockNumber ? indexerBlockNumber : fromBlock + step - 1;

      if (fromBlock > indexerBlockNumber) {
        logger.info(`✍️ | ${this._name} | parseLogs | ${fromBlock} is latest, waiting...`);
        return;
      }

      const toBlock = await this._logsDatabase.getBlockNumberByCount(fromBlock, indexerBlockNumber, this._parseLogsBatchSize);
      if (toBlock) {
        await this.parseLogsHandle(fromBlock, toBlock, { session });
        await this._configDatabase.updateValue(this._instanceId, configKey.parserBlockBumber, toBlock, { session });
      } else {
        await this._configDatabase.updateValue(this._instanceId, configKey.parserBlockBumber, indexerBlockNumber, { session });
      }

      logger.info(
        `✍️ | ${this._name} | parseLogs | ${fromBlock} - ${toBlock || indexerBlockNumber}, diff ${indexerBlockNumber - (toBlock || indexerBlockNumber)}`,
      );
      await session.commitTransaction();
    } catch (error) {
      logger.error(`❤️ | ${this._name} | parseLogs, ${error} `);
      await session.abortTransaction();
    } finally {
      await session.endSession();
      setTimeout(() => this.parseLogs(), this._parseLogsWait);
    }
  }

  async parseLogsHandle(fromBlock, toBlock, options?: BulkWriteOptions) {
    const logsCursor = await this._logsDatabase.getLogs(fromBlock, toBlock);
    let logsCount = 0;
    while (await logsCursor.hasNext()) {
      const log = await logsCursor.next();
      // logger.info(`✍️ | ${this._name} | parseLogs | blockNumber:${log.block_number} logIndex: ${log.log_index} `);
      logsCount++;
      const parser = eventParser[log.address.toLowerCase()];
      if (parser) {
        try {
          const logDescription = parser.interface.parseLog({ data: log.data, topics: log.topics });
          const hundle = parser.events[logDescription.signature];
          if (hundle) {
            await hundle(this._db, logDescription, log, options);
          }
        } catch (error) {
          logger.error(`❤️ | ${this._name} | parseLogs::hundle | blockNumber:${log.block_number} logIndex: ${log.log_index}, ${error} `);
        }
      }
    }
    if (logsCount > 0) {
      logger.info(`✍️ | ${this._name} | parseLogs | get ${logsCount} logs`);
    }
  }

  async scanContractLogsHandle(fromBlock, toBlock, address, options?: BulkWriteOptions) {
    const logs = await rpc_getLogs(this._rpc, [
      {
        fromBlock,
        toBlock,
        address,
      },
    ]);
    const dbLogs = logs.result.map((log) => this._logsDatabase.rpcLogsConvert(log));

    logger.info(`⛏️ | ${this._name} | scanContractLogs | find ${logs?.result.length} logs`);
    const removeLogsResult = await this._logsDatabase.removeLogs(fromBlock, toBlock, address, options);
    if (removeLogsResult.deletedCount) {
      logger.info(`⛏️ | ${this._name} | scanContractLogs | ${fromBlock} - ${toBlock} | remove ${removeLogsResult.deletedCount} logs`);
    }
    if (dbLogs && dbLogs.length > 0) {
      await this._logsDatabase.insertLogs(dbLogs, options);
    }
  }
}

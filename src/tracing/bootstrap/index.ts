import { Client } from '../db/client';
import { ConfigDatabase } from '../db/config';
import { configKey, LandId, landId, LogsCollection } from '../types';
import { rpc_getBlockNumber, rpc_getFilterLogs, rpc_getLogs, rpc_newFilter } from '../utils/rpc';
import { BigNumber } from 'ethers';
import { logger } from '../utils/logger';
import { LogsDatabase } from '../db/logs';
import { eventParser } from '../parser';
import { Db, ReadConcernLevel, WithId } from 'mongodb';

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

  _wait = 60000;
  _getLogsWait = 5000;
  _parseLogsWait = 500;
  _configDatabase: ConfigDatabase;
  _logsDatabase: LogsDatabase;
  _step = 500;
  _db: Db;
  _client: Client;

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
    const client = new Client(uri);
    const connect = await client.connect();
    this._client = client;
    this._db = connect.db('evo');

    // init database
    this._configDatabase = new ConfigDatabase(connect);
    this._logsDatabase = new LogsDatabase(connect);

    // configDatabase.updateIndexerBlockNumber(landId.LAND_1, 20000000);
    // this.getBlockNumber();
    this.starter();
  }

  starter() {
    // this.getBlockNumber();
    // this.getContractLogs('0x1');
    // this.scanContractLogs();
    // this.newFilter()
    this.parseLogs();
  }

  async getBlockNumber() {
    try {
      const data = await rpc_getBlockNumber(this._rpc);
      const blockNumber = BigNumber.from(data.result);

      this._configDatabase.updateValue(this._instanceId, configKey.latestBlockBumber, blockNumber.toNumber());
      logger.info(`⏱️ | ${this._name} | latestBlockNumber | ${blockNumber.toNumber()}`);
    } catch (error) {
      console.error('getBlockNumber', error);
    } finally {
      setTimeout(() => this.getBlockNumber(), this._wait);
    }
  }

  async scanContractLogs() {
    const session = this._client.getClient().startSession();

    try {
      const indexerConfig = await this._configDatabase.findConfig(this._instanceId, configKey.indexerBlockBumber);
      const lastestBlockConfig = await this._configDatabase.findConfig(this._instanceId, configKey.latestBlockBumber);
      const fromBlock = indexerConfig.value;
      const toBlock = indexerConfig.value + this._step - 1;

      // check is touch lateast
      if (toBlock > lastestBlockConfig.value) {
        logger.info(
          `⛏️ | ${this._name} | scanContractLogs | ${lastestBlockConfig.value} - ${fromBlock} = ${
            lastestBlockConfig.value - fromBlock
          }, Less than one step limit (${this._step})`,
        );
      } else {
        session.startTransaction();

        logger.info(`⛏️ | ${this._name} | scanContractLogs | ${fromBlock} - ${toBlock} = ${lastestBlockConfig.value - fromBlock}`);

        const logs = await rpc_getLogs(this._rpc, [
          {
            fromBlock,
            toBlock,
            address: this._address,
          },
        ]);

        const dbLogs = logs.result.map((log) => this._logsDatabase.rpcLogsConvert(log));

        logger.info(`⛏️ | ${this._name} | scanContractLogs | find ${logs?.result.length} logs`);

        if (dbLogs && dbLogs.length > 0) {
          await this._logsDatabase.insertLogs(dbLogs, { session });
        }

        await this._configDatabase.updateValue(this._instanceId, configKey.indexerBlockBumber, toBlock + 1, { session });
        await session.commitTransaction();
      }
    } catch (error) {
      console.error('scanContractLogs', error);
      await session.abortTransaction();
    } finally {
      await session.endSession();
      setTimeout(() => this.scanContractLogs(), this._getLogsWait);
    }
  }

  async parseLogs() {
    const session = this._client.getClient().startSession();
    try {
      session.startTransaction();

      const step = 30;
      const indexerConfig = await this._configDatabase.findConfig(this._instanceId, configKey.indexerBlockBumber);
      const parserConfig = await this._configDatabase.findConfig(this._instanceId, configKey.parserBlockBumber);

      const indexerBlockNumber = indexerConfig.value;
      const parserBlockNumber = parserConfig.value;

      const fromBlock = parserBlockNumber + 1;
      const toBlock = fromBlock + step - 1 >= indexerBlockNumber ? indexerBlockNumber - 1 : fromBlock + step - 1;

      if (fromBlock > indexerBlockNumber) {
        logger.info(`✍️ | ${this._name} | parseLogs | ${fromBlock} is latest, waiting...`);
        return;
      }

      logger.info(`✍️ | ${this._name} | parseLogs | from: ${fromBlock}, to: ${toBlock}`);

      const logsCursor = await this._logsDatabase.getLogs(fromBlock, toBlock);
      while (await logsCursor.hasNext()) {
        const log = await logsCursor.next();
        logger.info(`✍️ | ${this._name} | parseLogs | blockNumber:${log.block_number} logIndex: ${log.log_index} `);

        const parser = eventParser[log.address.toLowerCase()];
        if (parser) {
          try {
            const logDescription = parser.interface.parseLog({ data: log.data, topics: log.topics });
            const hundle = parser.events[logDescription.signature];
            if (hundle) {
              await hundle(this._db, logDescription, log, { session });
            }
          } catch (error) {
            logger.error(`❤️ | ${this._name} | parseLogs::hundle | blockNumber:${log.block_number} logIndex: ${log.log_index}, ${error} `);
          }
        }
      }

      await this._configDatabase.updateValue(this._instanceId, configKey.parserBlockBumber, toBlock, { session });
      await session.commitTransaction();
    } catch (error) {
      logger.error(`❤️ | ${this._name} | parseLogs, ${error} `);
      await session.abortTransaction();
    } finally {
      await session.endSession();
      setTimeout(() => this.parseLogs(), this._parseLogsWait);
    }
  }

  // async newFilter() {
  //   const indexerConfig = await this._configDatabase.findConfig(this._landId);
  //   logger.info(indexerConfig);
  //   const filterId = await rpc_newFilter(this._rpc, [
  //     {
  //       fromBlock: indexerConfig.indexer_block_number,
  //       toBlock: indexerConfig.indexer_block_number + 500,
  //       address: this._address,
  //     },
  //   ]);

  //   logger.info(filterId);
  // }
}

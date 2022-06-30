import { BulkWriteOptions, Collection, MongoClient } from 'mongodb';
import { collections, ConfigCollection, ConfigKey, LandId } from '../types';

export class ConfigDatabase {
  _client: MongoClient;
  _configCollection: Collection<ConfigCollection>;

  constructor(client: MongoClient) {
    this._client = client;
    this._configCollection = this._client.db('evo').collection<ConfigCollection>(collections.CONFIG);
  }

  async findConfig(instanceId: string, configKey: ConfigKey) {
    const config = await this._configCollection.findOne(
      {
        instance_id: instanceId,
        key: configKey,
      },
      {
        projection: { _id: 0 },
      },
    );

    return config;
  }

  async updateValue(instanceId: string, configKey: ConfigKey, blockNumber: number, options: BulkWriteOptions = {}) {
    const result = await this._configCollection.updateOne(
      { instance_id: instanceId, key: configKey },
      {
        $set: {
          value: blockNumber,
        },
      },
      { upsert: true, ...options },
    );
  }
}

import { MongoClient, MongoClientOptions } from 'mongodb';

export class Client {
  _client: MongoClient;

  constructor(uri: string, options?: MongoClientOptions) {
    const client = new MongoClient(uri, options);
    this._client = client;
  }

  async connect(): Promise<MongoClient> {
    // Connect the client to the server
    await this._client.connect();
    // Establish and verify connection
    await this._client.db('admin').command({ ping: 1 });
    console.log('Connected successfully to server');

    return this._client;
  }

  async disconnect(): Promise<void> {
    await this._client.close();
  }

  getClient() {
    return this._client;
  }
}

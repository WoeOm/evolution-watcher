import { MongoDataSource } from 'apollo-datasource-mongodb';
import { LandCollection } from 'src/tracing/types';

export default class Land extends MongoDataSource<LandCollection> {
  getLands(args) {
    return this.findByFields(args);
  }
}

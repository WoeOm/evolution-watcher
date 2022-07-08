import { DBClient } from './client';

export class LandDatabase extends DBClient {
  constructor(uri: string) {
    super(uri);
  }
}

import { getEvolutionLandDB } from './utils';
import { collections } from '../types';

const mongodbURI = process.env.MONGODBURI;

describe('FOR TEST', () => {
  describe('Drop Collection', () => {
    it.skip('Drop Not (Logs, Config)', async () => {
      if (mongodbURI) {
        const db = await getEvolutionLandDB(mongodbURI);
        await db.collection(collections.LAND).drop();
        await db.collection(collections.APOSTLE).drop();
        await db.collection(collections.DRILL).drop();
        await db.collection(collections.SYNTHESISDRILL).drop();
        await db.collection(collections.MIRRORKITTY).drop();
        await db.collection(collections.EQUIPMENT).drop();
        await db.collection(collections.OTHER).drop();
        await db.collection(collections.LAND_AUCTION).drop();
      }
    });
  });
});

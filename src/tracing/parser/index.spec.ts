import { collections } from '../types';
import { parseTokenId } from './land';

describe('Parser', () => {
  describe('parseTokenId', () => {
    it('should return Land', () => {
      expect(parseTokenId('0x2a030001030001010000000000000003000000000000000000000000000007b4')).toBe(collections.LAND);
    });

    it('should return Apostle', () => {
      expect(parseTokenId('0x2a0300010300010200000000000000030000000000000000000000000000077d')).toBe(collections.APOSTLE);
    });

    it('should return Drill', () => {
      expect(parseTokenId('0x2a03000103000104000000000000000300010000000000000000000000000003')).toBe(collections.DRILL);
    });

    it('should return MirrorKitty', () => {
      expect(parseTokenId('0x2a03000103000103000000000000000300010000000000000000000000000003')).toBe(collections.MIRRORKITTY);
    });

    it('should return Apostle', () => {
      expect(parseTokenId('0x01')).toBe(collections.OTHER);
    });
  });
});

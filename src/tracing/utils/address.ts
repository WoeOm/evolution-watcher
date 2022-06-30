const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export const isZeroAddress = (address: string): boolean => {
  return ZERO_ADDRESS === address;
};

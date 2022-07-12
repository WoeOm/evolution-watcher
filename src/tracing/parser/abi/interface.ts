import { Interface } from 'ethers/lib/utils';
import ObjectOwnership from './abi-objectOwnership.json';
import clockAuctionV3 from './abi-clockAuctionV3.json';

export const ObjectOwnershipIface = new Interface(ObjectOwnership);
export const ClockAuctionV3Iface = new Interface(clockAuctionV3);

export const GetIfcae = (abi) => {
  return new Interface(abi);
};

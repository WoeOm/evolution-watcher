import { Interface } from 'ethers/lib/utils';
import ObjectOwnership from './abi-objectOwnership.json';

export const ObjectOwnershipIface = new Interface(ObjectOwnership);

export const GetIfcae = (abi) => {
  return new Interface(abi);
};

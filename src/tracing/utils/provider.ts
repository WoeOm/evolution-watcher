import { utils, getDefaultProvider, providers } from 'ethers';

export const getCustomProvider = (network?: providers.Networkish, options?: any): providers.BaseProvider => {
  const provider = getDefaultProvider(network, options);
  return provider;
};

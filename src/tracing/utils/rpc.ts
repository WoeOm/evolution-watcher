import axios from 'axios';
import { PRCWrapper, RPCLogsCollection } from '../types';
import { BigNumber, providers, EventFilter } from 'ethers';

const ETHEREUM_RPC_HEADER = {
  'Content-Type': 'application/json',
};

export interface RPCGetLogsResult extends PRCWrapper {
  result: RPCLogsCollection[];
}

const rpcCall = async (rpc, method, params = []) => {
  const { status, data } = await axios.post(
    rpc,
    { jsonrpc: '2.0', method, params, id: 1 },
    {
      headers: ETHEREUM_RPC_HEADER,
    },
  );
  if (status !== 200) {
    throw new Error(`${method} status: ${status}`);
  }

  return data;
};

export const rpc_getBlockNumber = (rpc) => {
  return rpcCall(rpc, 'eth_blockNumber');
};

export const rpc_getLogs = (rpc: string, params: any[]): Promise<RPCGetLogsResult> => {
  return rpcCall(rpc, 'eth_getLogs', params);
};

export const wss_getLogs = (provider: providers.BaseProvider, params: providers.Filter): Promise<Array<providers.Log>> => {
  return provider.getLogs(params);
};

export const rpc_getFilterLogs = (rpc: string, params: any[]) => {
  return rpcCall(rpc, 'eth_getFilterLogs', params);
};

export const rpc_newFilter = (rpc: string, params: any[]) => {
  return rpcCall(rpc, 'eth_newFilter', params);
};

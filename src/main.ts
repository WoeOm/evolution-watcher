import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TracingBootstrap } from './tracing/bootstrap';
import { landId } from './tracing/types';
import { apolloServer } from './graphql/bootstrap';
import { addressArray } from './tracing/parser/address/crabtest';

const mongodbURI = process.env.MONGODBURI;

const tracingBootstrap = new TracingBootstrap({
  mongodbURI: mongodbURI,
  instanceId: landId.LAND_3_DEV,
  name: 'Land_3_DEV',
  rpc: 'https://darwinia-crab.api.onfinality.io/public/',
  address: addressArray,
});

const tracingServer = async () => {
  await tracingBootstrap.init();
  // tracingBootstrap.starter();
  // tracingBootstrap.subScanContractLogs(subContractAddress);
  // tracingBootstrap.scanContractLogsHandle(10598000, 10598499, address);
};

tracingServer();

// apolloServer('');

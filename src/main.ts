import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TracingBootstrap } from './tracing/bootstrap';
import { landId } from './tracing/types';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3003);
}
bootstrap();

const tracingBootstrap = new TracingBootstrap({
  mongodbURI: '',
  instanceId: landId.LAND_3_DEV,
  name: 'Land_3_DEV',
  rpc: 'https://crab-rpc.darwinia.network',
  address: [
    '0x3788df4fdC026f5Ea91a333fCf7CeD7a52c92471',
    '0x42866eb5Fc4d0e2789d7b4646e3026ae06336863',
    '0xaDBf03caF28eE80ff939F726d6c53c51Ffff3aa9',
    '0x2a7cCbE451C876b3f461C06527EeAe157752d913',
    '0xE94df9BC3cdB5b455Be4157D9Bed0B11D6DFC89e',
    '0xEE25d900b1cF9f261Bba614695fb6e987d1bc6A2',
  ],
});

tracingBootstrap.init();

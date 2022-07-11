import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TracingBootstrap } from './tracing/bootstrap';
import { landId } from './tracing/types';
import { apolloServer } from './graphql/bootstrap';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);
//   await app.listen(3003);
// }
// bootstrap();

const address = [
  '0x3788df4fdC026f5Ea91a333fCf7CeD7a52c92471', // OBJECTOWNERSHIP - 9094164
  '0x42866eb5Fc4d0e2789d7b4646e3026ae06336863', // LAND_CLOCK_AUCTION
  '0xaDBf03caF28eE80ff939F726d6c53c51Ffff3aa9', // APOSTLE_CLOCK_AUCTION
  '0x2a7cCbE451C876b3f461C06527EeAe157752d913', // SIRING_CLOCK_AUCTION
  '0xE94df9BC3cdB5b455Be4157D9Bed0B11D6DFC89e', // APOSTLE_BASE
  '0xEE25d900b1cF9f261Bba614695fb6e987d1bc6A2', // TOKEN_USER_POINTS
];

const tracingBootstrap = new TracingBootstrap({
  mongodbURI: '',
  instanceId: landId.LAND_3_DEV,
  name: 'Land_3_DEV',
  rpc: 'https://darwinia-crab.api.onfinality.io/public/',
  address: address,
});

const crabAddress = {
  // TOKEN_RING: '0x9aC276FBcb568Eb9f4679B238efd1b6eA1898435',
  // TOKEN_KTON: '0x6A5926005585a3B6937b058dDa92Aa528604Cd52',
  // TOKEN_WETH: '0xD4C2F962B8b94cdD2e0B2e8E765d39f32980a1c1',

  // ELEMENT_GOLD: '0xB2aA34fDE97Ffdb6197dD5a2be23c2121405cc12',
  // ELEMENT_WOOD: '0xed0A42dF138a94581C388D2E69775D21cF75dF6C',
  // ELEMENT_WATER: '0xb2ea733eFC0F2decf774d59373fAc650421B7E04',
  // ELEMENT_FIRE: '0x912860cfD0FA33cF78F35ebf3671bE0b960cf575',
  // ELEMENT_SOIL: '0x033C27472f6fA0a789Ce04efA04e3B367757f138',

  // GOLD_RUSH_RAFFLE: '',

  PVETEAM_PROXY: '0xa0f04a1782Bd051171348c6eC59815845fdA888a',
  MATERIAL_PROXY: '0x764b50Fc5d6E3FE71e2b18c40cBf62262f2D92b8',
  MATERIALTAKEBACK_PROXY: '0x527560d6a509ddE7828D598BF31Fc67DA50c8093',
  CRAFTBASE_PROXY: '0x12225Fa4a20b13ccA0773E1D5f08BbC91f16f927',

  // LAND_CLOCK_AUCTION: '0x42866eb5Fc4d0e2789d7b4646e3026ae06336863',
  // APOSTLE_CLOCK_AUCTION: '0xaDBf03caF28eE80ff939F726d6c53c51Ffff3aa9',
  // SIRING_CLOCK_AUCTION: '0x2a7cCbE451C876b3f461C06527EeAe157752d913',
  // APOSTLE_BASE: '0xE94df9BC3cdB5b455Be4157D9Bed0B11D6DFC89e',
  LAND_RESOURCE: '0xa0aaFf128C1dCBB5fE95Ff021927622fA165014E',
  TOKEN_USE: '0x105aBa2B1d6ac5Fff3D52a85b00941ec5650203b',

  // OBJECTOWNERSHIP: '0x3788df4fdC026f5Ea91a333fCf7CeD7a52c92471',

  // SETTINGSREGISTRY: '0xbc378EE890A675B5a26Cf0bd05f1aEDb32424c3c',

  POINTS_REWARD_POOL: '0x827ABd28b276E6fA2AF82EC003744b96c2e4D391', // PointsRewardPool
  // TOKEN_USER_POINTS: '0xEE25d900b1cF9f261Bba614695fb6e987d1bc6A2', // UserPoints

  FURNACE_TREASURE: '0xaC62f6A54A972615ABc3931788aAE9a7d2100174', // DrillLuckyBox
  FURNACE_ITEM_BASE: '0x34f1124A986402fBf685Ac5A5C65d22257bd113E', // ItemBase_Proxy
  FURNACE_TAKEBACK: '0x9933B84D08eAD3020F589861442dBc4BDA91b16C', // DrillTakeBack

  // UNISWAP_EXCHANGE: '0xAF5cAa87a7d3718622604268C43fF6cE9d2cEc3C', // UniswapRouter

  STAKINGREWARDSFACTORY: '0x8023217549a707122CF3c6f7aeE1513fbACde165',

  // GOLDRAFFLEPOOL_PROXY: '0xEF9CFb1065C1CC0115892F66006361d42A7D1706',
  // WOODRAFFLEPOOL_PROXY: '0x4Ee0d401f713D86C5aBe24feA762099CFEb17913',
  // WATERRAFFLEPOOL_PROXY: '0xDfDAa1159C466cC237dc34D18C70574C15cc0008',
  // FIRERAFFLEPOOL_PROXY: '0x5F0dA02f792C9f4Cb862Dc07309B89CF7eEF9c26',
  // SOILRAFFLEPOOL_PROXY: '0x050Ecb8767921dAaE8857e1F826c8A2176b31359',
};
const subContractAddress = Object.keys(crabAddress).map((o) => crabAddress[o]);
console.log('🚀 ~ file: main.ts ~ line 77 ~ subContractAddress', subContractAddress);

const tracingServer = async () => {
  await tracingBootstrap.init();
  // tracingBootstrap.starter();
  tracingBootstrap.subScanContractLogs(subContractAddress);
  // tracingBootstrap.scanContractLogsHandle(10598000, 10598499, address);
};

tracingServer();

// apolloServer('');

import { createConnection, getRepository, Like } from 'typeorm';
import { databaseConfig } from './config';
import { DeliveryInfo } from './entity/DeliveryInfo';
import { Cart } from './entity/Cart';
import { Category } from './entity/Category';
import { Goods } from './entity/Goods';
import { GoodsImg } from './entity/GoodsImg';
import { OrderItem } from './entity/OrderItem';
import { OrderList } from './entity/OrderList';
import { Payment } from './entity/Payment';
import { Promotion } from './entity/Promotion';
import { User } from './entity/User';
import { UserAddress } from './entity/UserAddress';
import { Wish } from './entity/Wish';
import { CategoryRepository } from './repository/category.repository';
import { UserRepository } from './repository/user.repository';
import { UserAddressRepository } from './repository/user.address.repository';
import { GoodsRepository } from './repository/goods.repository';
import { GoodsStateMap } from './controller/goods.controller';

export default async function () {
  await createConnection({
    type: 'mysql',
    ...databaseConfig,
    entities: [
      User,
      UserAddress,
      DeliveryInfo,
      Cart,
      OrderItem,
      OrderList,
      Goods,
      GoodsImg,
      Category,
      Payment,
      Promotion,
      Wish,
    ], // TODO: add entities
  });
  await populate();
}

async function populate() {
  await createDefaultUser('아이유');
  await createDefaultAddress();
  const categories = ['문구', '잡화', '생필품'];
  categories.forEach((name) => createCategory(name));
  createDefaultGoods();
}

async function createDefaultUser(name: string) {
  const result = await UserRepository.findByGitHubId('1');
  if (!result) {
    await UserRepository.create('1', name);
  }
}

async function createCategory(name: string) {
  const res = await CategoryRepository.getCategoryByName(name);
  if (!res) {
    await CategoryRepository.createCategory(name);
  }
}

async function createDefaultAddress() {
  const body = {
    name: '아이유',
    receiver: '아이유',
    zipCode: '08123',
    address: '서울 특별시 강남구',
    subAddress: '역삼동',
    isDefault: true,
    amount: 13,
  };
  const addresses = await UserAddressRepository.getAddressesById(1);
  if (addresses.length > 0) return;
  await UserAddressRepository.createDefaultAddress(1, body);
}

async function createDefaultOrderList() {}

async function createDefaultPayment() {}

// TODO 100개가 너무 적다면 300개? :)
async function createDefaultGoods() {
  const DUMMY_LENGTH = 100;
  const goodsList = createDummy(DUMMY_LENGTH);
  const skip = await getRepository(Goods).find({ where: { title: Like('%상품명 랜덤%') } });
  if (skip.length >= DUMMY_LENGTH) return;
  for (const goods of goodsList) {
    const newGoods = await getRepository(Goods).save(goods);
    console.log(`초기 상품 데이터 삽입 : name - ${newGoods.title}, id - ${newGoods.id}`);
  }
}

function createDummy(length: number) {
  const THUMBNAIL_URLS = [
    'https://user-images.githubusercontent.com/20085849/128866958-900ad32a-cd32-4b97-be79-1dbbc9dcb02d.jpeg',
    'https://user-images.githubusercontent.com/45394360/129675520-751e7b2a-0d8c-48dd-b737-dcfcad3c91ca.jpg',
    'https://user-images.githubusercontent.com/45394360/129675522-0223efb9-8229-4639-943e-b23b524954e9.jpg',
    'https://user-images.githubusercontent.com/45394360/129675523-355ce30a-fe04-458f-8de0-a29991be3b36.jpg',
    'https://user-images.githubusercontent.com/45394360/129675525-d45554e9-b9a9-43f3-90de-1ca636f16e4e.jpg',
    'https://user-images.githubusercontent.com/45394360/129675528-80e08a25-5ff8-4510-9fb6-ef450ac23922.png',
    'https://user-images.githubusercontent.com/45394360/129675529-f90e2e73-222b-4815-9495-98e4b1647cb9.png',
    'https://user-images.githubusercontent.com/45394360/129675531-1b643050-5565-457f-a039-289d47fb3507.jpg',
    'https://user-images.githubusercontent.com/45394360/129675532-6502598c-3c55-4275-b7db-2e78f1adcfcb.png',
    'https://user-images.githubusercontent.com/45394360/129675533-4623cae5-461c-4f9a-91bd-1ffd13e0d952.jpg',
    'https://user-images.githubusercontent.com/45394360/129675534-460d3843-9e25-43f3-ac66-43ccc55413d3.png',
    'https://user-images.githubusercontent.com/45394360/129675535-e4c8f4cd-a1de-44a6-b3b5-92d4edb58cda.png',
    'https://user-images.githubusercontent.com/45394360/129675537-7c4e1d7d-6477-4dee-bd2d-2d0aeb30f7c7.png',
    'https://user-images.githubusercontent.com/45394360/129675539-001126ce-f551-4180-8259-21b5950c0117.jpg',
    'https://user-images.githubusercontent.com/45394360/129675543-ca18f56d-b39f-4444-b581-fa1df49f0f1c.jpg',
    'https://user-images.githubusercontent.com/45394360/129676346-46cd54dc-d557-42bd-8eba-5f65660b0550.png',
    'https://user-images.githubusercontent.com/45394360/129676351-5a2ef39f-7f35-4f35-81f0-f1aef92c9d78.png',
    'https://user-images.githubusercontent.com/45394360/129676353-48760f6f-4008-4c9e-84f8-73b8fb2b47af.png',
    'https://user-images.githubusercontent.com/45394360/129676354-1fcde62d-7e8a-4f2f-961c-93caaaccdff4.jpg',
    'https://user-images.githubusercontent.com/45394360/129676355-15c47cee-5afe-4f17-9a0d-2ebb932a8b46.jpg',
  ];
  const TITLE_SUFFIX = 10000;
  const result = Array(length)
    .fill('')
    .map((_) => {
      return {
        thumbnailUrl: THUMBNAIL_URLS[Math.floor(Math.random() * THUMBNAIL_URLS.length)],
        countOfSell: Math.floor(Math.random() * 100 + 1),
        isGreen: !Math.round(Math.random()),
        title: `상품명 랜덤 - ${Math.floor(Math.random() * TITLE_SUFFIX)}`,
        price: Math.floor(Math.random() * 100 + 1),
        stock: 1 * Math.round(Math.random() * 50),
        discountRate: Math.floor(Math.random() * 50 + 1),
        state: GoodsStateMap.sale,
        category: Math.ceil(Math.random() * 3),
        delivery: 1,
      };
    });
  return result;
}

import { GoodsImg } from './../entity/GoodsImg';
import { getConnection, MoreThan } from 'typeorm';
import { Goods } from '../entity/Goods';
import { GoodsRepository } from '../repository/goods.repository';
import {
  DetailGoodsResponse,
  GoodsListResponse,
  GoodsListMetaData,
  TaggedGoodsType,
} from '../types/response/goods.response';
import { WishRepository } from '../repository/wish.repository';
import {
  FindAllCategoryProps,
  FindAllColumnNameProps,
  FindAllKeywordProps,
  GetAllByCategoryProps,
  GetAllByKeywordProps,
} from '../types/Goods';
import { pagination } from '../utils/pagination';
import { BadRequestError } from '../errors/client.error';
import { GOODS_DB_ERROR } from '../constants/database-error-name';
import { CategoryRepository } from '../repository/category.repository';
import { GoodsStateMap } from '../controller/goods.controller';
import { CreateGoodsBody } from '../types/request/goods.request';

async function createGoods(body: CreateGoodsBody, uploadFileUrls: string[]) {
  return await getConnection().transaction(async (transactionalEntityManager) => {
    const goods = await transactionalEntityManager.save(Goods, { ...body, thumbnailUrl: uploadFileUrls[0] });
    await Promise.all(
      uploadFileUrls.map(async (url) => await transactionalEntityManager.save(GoodsImg, { goods: goods.id, url }))
    );
    return goods;
  });
}

async function getDetailById(id: number): Promise<DetailGoodsResponse> {
  const data = await GoodsRepository.findGoodsDetailById({ id });
  const imgs = data?.goodsImgs.map((goodsImg) => goodsImg.url);
  const res = JSON.parse(JSON.stringify(data));
  delete res.goodsImgs;
  return { ...res, goodsImgs: imgs };
}

async function getAllSaleGoodsByCategory({
  categoryName,
  page,
  flag,
  limit,
  userId,
}: GetAllByCategoryProps): Promise<GoodsListResponse> {
  // TODO: 함수로 빼도 될듯?
  const category = await CategoryRepository.getCategoryByName(categoryName);
  if (!category) throw new BadRequestError(GOODS_DB_ERROR);
  const totalCount = await GoodsRepository.findTotalCountByCategory(category.id);
  page = Math.min(getTotalPage(totalCount, limit), page);
  const option: FindAllCategoryProps = setAllByCategoryOption(category.id, page, limit, flag);
  const wishSet = userId && new Set(await WishRepository.findWishByUserId(userId));
  const goodsSellCountAverage = await GoodsRepository.findSellCountAverage();
  const goodsList = await GoodsRepository.findAllByCategory(option);
  if (!goodsList) throw new BadRequestError(GOODS_DB_ERROR);

  goodsList.forEach((goods) => {
    if (wishSet) goods.isWish = wishSet.has(goods.id);
    goods.isBest = goodsSellCountAverage < goods.countOfSell;
    goods.isNew = checkNewGoods(goods.createdAt);
  });

  return {
    meta: getListGoodsMeta(page, limit, totalCount),
    goodsList,
  };
}

async function getAllSaleGoodsByKeyword({
  keyword,
  page,
  limit,
  userId,
}: GetAllByKeywordProps): Promise<GoodsListResponse> {
  const option: FindAllKeywordProps = {
    keyword,
    offset: pagination.calculateOffset(page, limit),
    limit,
  };
  const totalCount = await GoodsRepository.findTotalCountByKeyword(keyword);
  page = Math.min(getTotalPage(totalCount, limit), page);
  const wishSet = userId && new Set(await WishRepository.findWishByUserId(userId));
  const goodsSellCountAverage = await GoodsRepository.findSellCountAverage();
  const goodsList = await GoodsRepository.findAllByKeyword(option);
  if (!goodsList) throw new BadRequestError(GOODS_DB_ERROR);

  goodsList.forEach((goods) => {
    if (wishSet) goods.isWish = wishSet.has(goods.id);
    goods.isBest = goodsSellCountAverage < goods.countOfSell;
    goods.isNew = checkNewGoods(goods.createdAt);
  });

  return {
    meta: getListGoodsMeta(page, limit, totalCount),
    goodsList,
  };
}

// TODO: 각 조회를 하나의 함수로 분리?
async function getMainGoodsListMap(): Promise<{
  bestGoodsList: TaggedGoodsType[];
  latestGoodsList: TaggedGoodsType[];
  discountGoodsList: TaggedGoodsType[];
}> {
  const bestProps: FindAllColumnNameProps = {
    columnName: 'countOfSell',
    limit: 4,
  };
  const latestProps: FindAllColumnNameProps = {
    columnName: 'createdAt',
    limit: 8,
  };
  const discountProps: FindAllColumnNameProps = {
    columnName: 'discountRate',
    limit: 8,
  };

  const bestGoodsList = await GoodsRepository.findAllByColumnName(bestProps);
  const latestGoodsList = await GoodsRepository.findAllByColumnName(latestProps);
  const discountGoodsList = await GoodsRepository.findAllByColumnName(discountProps);
  return {
    bestGoodsList,
    latestGoodsList,
    discountGoodsList,
  };
}

// 백오피스용 목록 조회 함수입니다, 추가적인 작업 예정 :)
async function getAllByCategory({ categoryName, page, flag, limit, state }: GetAllByCategoryProps) {
  // TODO: 함수로 빼도 될듯?
  const category = await CategoryRepository.getCategoryByName(categoryName);
  if (!category) throw new BadRequestError(GOODS_DB_ERROR);
  const totalCount = await GoodsRepository.findTotalCountByCategory(category.id);
  page = Math.min(getTotalPage(totalCount, limit), page);

  const option: FindAllCategoryProps = {
    category: category.id,
    offset: pagination.calculateOffset(page, limit),
    limit: limit,
    where: {
      state,
      stock: MoreThan(0),
    },
    order: getCategoryByFlag(flag),
    sort: getSortByFlag(flag),
  };

  const goodsList = await GoodsRepository.findAllByCategory(option);
  if (!goodsList) throw new BadRequestError(GOODS_DB_ERROR);

  const goodsSellCountAverage = await GoodsRepository.findSellCountAverage();

  goodsList.forEach((goods) => {
    goods.isBest = goodsSellCountAverage < goods.countOfSell;
    goods.isNew = checkNewGoods(goods.createdAt);
  });

  return {
    meta: getListGoodsMeta(page, limit, totalCount),
    goods: goodsList,
  };
}

function setAllByCategoryOption(category: number, page: number, limit: number, flag: string): FindAllCategoryProps {
  return {
    category: category,
    offset: pagination.calculateOffset(page, limit),
    limit: limit,
    where: {
      state: GoodsStateMap.sale,
      stock: MoreThan(0),
    },
    order: getCategoryByFlag(flag),
    sort: getSortByFlag(flag),
  };
}

function getCategoryByFlag(flag: string): keyof Goods {
  switch (flag) {
    case 'low':
    case 'high':
      return 'price';
    case 'best':
      return 'countOfSell';
    case 'latest':
      return 'createdAt';
    default:
      return 'createdAt';
  }
}

function getSortByFlag(flag: string): 'DESC' | 'ASC' {
  return flag === 'low' ? 'ASC' : 'DESC';
}

function checkNewGoods(date: Date): boolean {
  const DAY_DIVIDE = 1000 / 60 / 60 / 24;
  const NEW_PRODUCT_BASE_DAY = 7;
  const nowTime = new Date().getTime();
  return (nowTime - date.getTime()) / DAY_DIVIDE < NEW_PRODUCT_BASE_DAY;
}

function getListGoodsMeta(page: number, limit: number, totalCount: number): GoodsListMetaData {
  return {
    page,
    limit,
    totalPage: getTotalPage(totalCount, limit),
    totalCount,
  };
}

function getTotalPage(totalCount: number, limit: number): number {
  return Math.ceil(totalCount / limit);
}

export const GoodsService = {
  createGoods,
  getDetailById,
  getAllByCategory,
  getAllSaleGoodsByKeyword,
  getAllSaleGoodsByCategory,
  getMainGoodsListMap,
};

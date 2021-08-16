import { Request, Response } from 'express';
import WishService from '../service/wish.service';

async function createWish(req: Request, res: Response) {
  const userId = req.userId;
  const goodsId = req.body.goodsId;
  const result = await WishService.createWish(userId, goodsId);
  res.status(201).json({ result });
}

async function deleteWish(req: Request, res: Response) {
  const userId = req.userId;
  const wishId = Number(req.params.wishId);
  await WishService.deleteWish(userId, wishId);
  res.sendStatus(204);
}

export default {
  createWish,
  deleteWish,
};

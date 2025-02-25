import { Request, Response } from 'express';
import { DeliveryService } from '../service/delivery.service';
import { CreateDeliveryRequest } from '../types/request/delivery.request';

async function createDeliveryInfo(req: CreateDeliveryRequest, res: Response) {
  const body = req.body;
  const result = await DeliveryService.createDeliveryInfo(body);
  res.status(201).json({ result });
}

async function getDeliveryInfos(req: Request, res: Response) {
  const result = await DeliveryService.getDeliveryInfos();
  res.status(200).json({ result });
}

export const DeliveryController = {
  createDeliveryInfo,
  getDeliveryInfos,
};

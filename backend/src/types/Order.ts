export interface OrderGoods {
  id: number;
  amount: number;
}

export interface CreateOrderItem {
  amount: number;
  price: number;
  discountRate: number;
  state: string;
}

export interface GetAllOrderByUserIdProps {
  page: number;
  limit: number;
}

import styled from 'styled-components';
import React, { useEffect, useMemo, useState } from 'react';

import { useRecoilState, useRecoilValue } from 'recoil';
import { orderState } from '@src/recoil/orderState';

import PageHeader from '@src/components/PageHeader/PageHeader';
import Layout from '@src/pages/Cart/Layout/Layout';
import Divider from '@src/components/Divider/Divider';
import Button from '@src/components/PrimaryButton/PrimaryButton';
import CheckButtonWithLabel from '@src/components/CheckButtonWithLabel/CheckButtonWithLabel';
import HighlightedText from '@src/components/HighlightedText/HighlightedText';
import Topic from '@src/components/Topic/Topic';
import { AddressInfo } from '@src/types/Address';
import { getDiscountedPrice, getPriceText } from '@src/utils/price';
import OrderGoodsList from './OrderGoodsList/OrderGoodsList';
import AddressSection from './AddressSection/AddressSection';
import { usePushHistory } from '@src/lib/CustomRouter';
import PaymentRadioSelector from './PaymentRadioSelector/PaymentRadioSelector';
import { submitOrder } from '@src/apis/orderAPI';
import AfterOrder from './AfterOrder/AfterOrder';
import { usePushToast } from '@src/lib/ToastProvider/ToastProvider';
import withLoggedIn from '@src/utils/withLoggedIn';
import withScrollToTopOnMount from '@src/utils/withScrollToTopOnMount';
import composeComponent from '@src/utils/composeComponent';
import theme from '@src/theme/theme';
import { cartState } from '@src/recoil/cartState';

const NEED_ADDRESS_MESSAGE = '배송지를 입력해주세요!';
const NEED_PAYMENT_MESSAGE = '결제수단을 선택해주세요!';
const NEED_AGREEMENT_MESSAGE = '결제 진행에 필요한 사항을 동의해주세요!';
const DEFAULT_ORDER_MEMO = '부재 시 연락바랍니다.';

const OrderPage: React.FC = () => {
  const { goodsList: orderGoodsList, cartIds } = useRecoilValue(orderState);
  const [carts, setCarts] = useRecoilState(cartState);
  const [selectedAddress, setSelectedAddress] = useState<AddressInfo | null>(null);
  const [selectedPaymentId, setSelectedPaymentId] = useState<number | null>(null);
  const [isAgreementChecked, setIsAgreementChecked] = useState(false);
  const [isOrdered, setIsOrdered] = useState(false);

  const pushHistory = usePushHistory();
  const pushToast = usePushToast();

  const reducedPrice = useMemo(
    () =>
      orderGoodsList.reduce(
        (prev, cartGoods) =>
          prev + cartGoods.amount * getDiscountedPrice(cartGoods.goods.price, cartGoods.goods.discountRate),
        0
      ),
    [orderGoodsList]
  );

  // TODO: 배송비 정책 결정하고 대응 수정하기
  // 임시적으로 30000원 이상이면 배송비 0원, 아니면 2500원 부여
  const deliveryPrice = orderGoodsList.length !== 0 && reducedPrice < 30000 ? 2500 : 0;
  const totalPrice = reducedPrice + deliveryPrice;

  const handleSubmit = async () => {
    if (!selectedAddress) return pushToast({ text: NEED_ADDRESS_MESSAGE, color: theme.error });
    if (!selectedPaymentId) return pushToast({ text: NEED_PAYMENT_MESSAGE, color: theme.error });
    if (!isAgreementChecked) return pushToast({ text: NEED_AGREEMENT_MESSAGE, color: theme.error });

    const { receiver, zipCode, address, subAddress } = selectedAddress;
    const submitOrderBody = {
      receiver,
      zipCode,
      address,
      subAddress,
      orderMemo: DEFAULT_ORDER_MEMO,
      paymentId: selectedPaymentId,
      goodsList: orderGoodsList.map(({ amount, goods }) => ({ amount, id: goods.id })),
      cartIds,
    };

    await submitOrder(submitOrderBody);
    if (cartIds) setCarts((currentCarts) => currentCarts.filter((cart) => !cartIds.includes(cart.id)));
    setIsOrdered(true);
  };

  const redirectCondition = orderGoodsList.length === 0;
  useEffect(() => {
    if (redirectCondition) {
      pushHistory('/');
    }
  }, [orderGoodsList]);
  if (redirectCondition) {
    return null;
  }

  if (isOrdered) {
    return <AfterOrder orderGoodsList={orderGoodsList} />;
  }

  return (
    <Layout
      pageHeader={<PageHeader>주문/결제</PageHeader>}
      contentLeft={
        <FlexColumn gap='4rem'>
          <div>
            <Topic>배송정보</Topic>
            <AddressSection onChangeSelectedAddress={setSelectedAddress} />
          </div>
          <div>
            <Topic>주문 상품 ({orderGoodsList.length}건)</Topic>
            <OrderGoodsList orderGoodsList={orderGoodsList} />
          </div>
        </FlexColumn>
      }
      contentRight={
        <BorderBox>
          <PaddingBox>
            <FlexColumn gap='1.5rem'>
              <Topic>결제금액</Topic>
              <FlexRowSpaceBetween>
                <div>상품금액</div>
                <div>{getPriceText(reducedPrice)}원</div>
              </FlexRowSpaceBetween>
              <FlexRowSpaceBetween>
                <div>배송비</div>
                <div>+{getPriceText(deliveryPrice)}원</div>
              </FlexRowSpaceBetween>
              <Divider lineStyle='dashed' />
              <FlexRowSpaceBetween>
                <HighlightedText>총 결제금액</HighlightedText>
                <HighlightedText>{getPriceText(totalPrice)}원</HighlightedText>
              </FlexRowSpaceBetween>
            </FlexColumn>
          </PaddingBox>
          <Divider size={8} color='#eee' />
          <PaddingBox>
            <FlexColumn gap='1.5rem'>
              <Topic>결제수단 선택</Topic>
              <PaymentRadioSelector selectedPaymentId={selectedPaymentId} onSelectPayment={setSelectedPaymentId} />
            </FlexColumn>
          </PaddingBox>
          <Divider size={8} color='#eee' />
          <PaddingBox>
            <FlexColumn gap='1rem'>
              <CheckButtonWithLabel
                isChecked={isAgreementChecked}
                onClick={() => {
                  setIsAgreementChecked(!isAgreementChecked);
                }}
                label='결제 진행에 필요한 사항 동의'
              />
              <Button fullWidth onClick={handleSubmit}>
                {getPriceText(totalPrice)}원 결제하기
              </Button>
            </FlexColumn>
          </PaddingBox>
        </BorderBox>
      }
    />
  );
};

const BorderBox = styled.div`
  box-sizing: border-box;
  border: 1px solid #ddd;
`;

const PaddingBox = styled.div`
  padding: 1.5rem;
`;

const FlexColumn = styled.div<{ gap?: string }>`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.gap ?? 'initial'};
`;

const FlexRowSpaceBetween = styled.div`
  display: flex;
  justify-content: space-between;
`;

export default composeComponent(withLoggedIn, withScrollToTopOnMount)(OrderPage);

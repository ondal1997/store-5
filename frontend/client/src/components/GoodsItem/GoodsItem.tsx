import { usePushHistory } from '@src/lib/CustomRouter';
import React from 'react';
import styled from 'styled-components';
import { BestTag, GreenTag, NewTag, SaleTag } from '../Tag';

interface Props {
  id: number;
  thumbnailImg?: string;
  title: string;
  price: number;
  isBest?: boolean;
  isGreen?: boolean;
  isNew?: boolean;
  isSale?: boolean;
  discountRate?: number;
}

const GoodsItem: React.FC<Props> = ({
  id,
  thumbnailImg = '',
  title,
  price,
  isBest = false,
  isNew = false,
  isGreen = false,
  isSale = false,
  discountRate = 0,
}) => {
  const push = usePushHistory();
  const handleClickGoodsItem = (e: React.MouseEvent) => {
    push('/detail/' + id);
  };
  return (
    <GoodsItemContainer onClick={handleClickGoodsItem}>
      <TagContainer>
        {isBest && <BestTag />}
        {isGreen && <GreenTag />}
        {isNew && <NewTag />}
        {isSale && <SaleTag />}
      </TagContainer>

      <GoodsImageContainer>
        {thumbnailImg ? <GoodsImage src={thumbnailImg} /> : <GoodsEmptyImage />}
      </GoodsImageContainer>

      {discountRate && discountRate > 0 ? <GoodsDiscountLabel> {discountRate} % </GoodsDiscountLabel> : ''}
      <GoodsTitle>{title}</GoodsTitle>
      <GoodsPriceLabel>{price} 원</GoodsPriceLabel>
    </GoodsItemContainer>
  );
};

const TagContainer = styled.div`
  position: absolute;
  display: flex;
  left: 0;
  top: 0;
  padding: 15px;
  width: 100%;
  z-index: 1;
  & > *:not(:last-child) {
    margin-right: 10px;
  }
`;

const GoodsItemContainer = styled.div`
  position: relative;
  flex-grow: 0;
  flex-shrink: 0;
  width: 300px;
  margin-top: 10px;
  margin-bottom: 10px;
  padding: 10px;
  display: flex;
  flex-direction: column;
`;

interface GoodsEmptyImageProps {
  theme: {
    label: string;
  };
}
const GoodsEmptyImage = styled.div<GoodsEmptyImageProps>`
  width: 100%;
  height: 350px;
  opacity: 0.5;
  background-color: ${(props) => props.theme.label};
  // TODO: add backgrond-img;
`;

const GoodsImageContainer = styled.div`
  width: 100%;
  height: 350px;
  overflow: hidden;
`;

const GoodsImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(1);
  filter: blur(1px);
  -webkit-filter: blur(1px);

  &:hover {
    opacity: 1;
    transform: scale(1.1);
    filter: blur(0px);
    -webkit-filter: blur(0px);
    animation-name: imgZoomEffect;
    animation-duration: 0.2s;
  }

  @keyframes imgZoomEffect {
    from {
      filter: blur(0.5px);
      -webkit-filter: blur(0.5px);
      transform: scale(1);
    }

    to {
      filter: blur(0px);
      -webkit-filter: blur(0px);
      transform: scale(1.1);
    }
  }
`;

const GoodsTitle = styled.strong`
  margin-top: 10px;
  font-size: 16px;
`;

const GoodsPriceLabel = styled.span`
  margin-top: 5px;
  font-size: 16px;
`;

const GoodsDiscountLabel = styled.span`
  margin-top: 10px;
  font-size: 20px;
  font-weight: 800;
  color: red; // TODO: change color as theme
`;

export default GoodsItem;

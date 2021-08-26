import React from 'react';
import { styled } from '@src/lib/CustomStyledComponent';
import { theme } from '@src/theme/theme';
import { HeaderIconProps } from '@src/types/Header';
import { usePushHistory } from '@src/lib/CustomRouter';
import { ADMIN_ORDER_PATH } from '@src/constants/adminPath';

import { FaCartArrowDown } from '@react-icons/all-files/fa/FaCartArrowDown';

const OrderAdminIcon: React.FC<HeaderIconProps> = ({ currentPath }) => {
  const push = usePushHistory();
  return (
    <HeaderIconContainer onClick={() => push(ADMIN_ORDER_PATH)} disabled={currentPath !== ADMIN_ORDER_PATH}>
      <FaCartArrowDown size='2em' />
      <HeaderIconTitle>주문관리</HeaderIconTitle>
    </HeaderIconContainer>
  );
};
interface IconContainerProps {
  disabled: boolean;
}

export const HeaderIconContainer = styled('div')<IconContainerProps>`
  display: flex;
  align-items: center;
  margin-bottom: 48px;
  padding: 12px;
  color: ${(props) => (props.disabled ? 'lightgray' : '#fff')};
  background-color: ${(props) => (props.disabled ? 'transparent' : theme.greenColor)};
  border-radius: 12px;
  cursor: pointer;
`;

export const HeaderIconTitle = styled('span')`
  margin-left: 12px;
  user-select: none;
`;

export default OrderAdminIcon;

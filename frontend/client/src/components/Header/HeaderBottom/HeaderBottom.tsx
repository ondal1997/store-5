import React from 'react';
import styled from 'styled-components';
import CategoryToggle from './CategoryToggle/CategoryToggle';
import HeaderLogo from './HeaderLogo/HeaderLogo';
import HeaderIconContainer from './HeaderIconContainer/HeaderIconContainer';

const HeaderBottom = () => {
  return (
    <HeaderBottomContainer>
      <CategoryToggle />
      <HeaderLogo />
      <HeaderIconContainer />
    </HeaderBottomContainer>
  );
};

const HeaderBottomContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 65%;
  padding: 0 15% 0 15%;
  border-bottom: 1px solid lightgray;
  border-top: 1px solid lightgray;
`;

export default HeaderBottom;

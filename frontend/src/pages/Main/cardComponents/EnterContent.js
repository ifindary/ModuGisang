import React from 'react';
import styled from 'styled-components';

const EnterContent = () => {
  return <Wrapper>챌린지 참여하기</Wrapper>;
};

export default EnterContent;

const Wrapper = styled.div`
  ${({ theme }) => theme.flex.center};
  ${({ theme }) => theme.fonts.JuaSmall};

  width: 100%;
  height: 100%;

  padding: 10px 10px 6px 10px;

  background: ${({ theme }) => theme.gradient.largerEmerald};
  border-radius: ${({ theme }) => theme.radius.medium};
`;

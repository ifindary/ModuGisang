import React from 'react';
import styled from 'styled-components';

const MissionInst = ({ text }) => {
  return <Wrapper>{text}</Wrapper>;
};

export default MissionInst;

const Wrapper = styled.div`
  ${({ theme }) => theme.fonts.IBMsmall}
  font-size: 15px;

  color: ${({ theme }) => theme.colors.primary.white};
  text-align: center;
`;

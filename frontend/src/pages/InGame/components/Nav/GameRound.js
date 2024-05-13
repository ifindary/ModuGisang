import React from 'react';
import styled from 'styled-components';

const GameRound = ({ text }) => {
  return (
    <Wrapper>
      <Text>Round</Text>
      <NumberCircle>
        <Number>{text}</Number>
      </NumberCircle>
    </Wrapper>
  );
};

export default GameRound;

const Wrapper = styled.div`
  margin-top: -14px;

  ${({ theme }) => theme.flex.center}
  flex-direction: column;
`;

const Text = styled.div`
  ${({ theme }) => theme.fonts.IBMsmall}
  font-size: 14px;
  color: ${({ theme }) => theme.colors.primary.purple};
`;

const NumberCircle = styled.div`
  ${({ theme }) => theme.flex.center}

  width: 40px;
  height: 40px;

  border-radius: 50%;

  background-color: ${({ theme }) => theme.colors.primary.purple};
`;

const Number = styled.span`
  margin-bottom: -5px;
  ${({ theme }) => theme.fonts.JuaSmall};
  color: ${({ theme }) => theme.colors.primary.white};
`;

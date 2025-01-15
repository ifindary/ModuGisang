import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const CreateContent = () => {
  const navigate = useNavigate();
  const moveToCreateChallenge = () => {
    navigate('/createChallenge');
  };
  return <Wrapper onClick={moveToCreateChallenge}>챌린지 생성하기</Wrapper>;
};

export default CreateContent;

const Wrapper = styled.button`
  ${({ theme }) => theme.flex.center};
  ${({ theme }) => theme.fonts.JuaSmall};

  width: 300px;
  height: 56px;

  padding: 10px 10px 6px 10px;

  border-radius: ${({ theme }) => theme.radius.medium};

  border: 1px solid var(--Gradient-Emerald, #836fff);
  background: rgba(13, 10, 45, 0.75);
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(2px);

  color: white;

  z-index: 2000;

  cursor: pointer;
`;

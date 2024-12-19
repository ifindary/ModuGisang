import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LongBtn, StyledLink } from './';
import useNavigateWithState from '../hooks/useNavigateWithState';
import * as S from '../styles/common';
import styled from 'styled-components';

const ErrorPage = () => {
  const navigate = useNavigate();
  const navigateWithState = useNavigateWithState();
  const location = useLocation();
  const { errorCode } = location.state || {};

  let errorMessage;
  switch (errorMessage) {
    // case 400:
    //   errorMessage = '잘못된 요청입니다.';
    //   break;
    // case 403:
    //   errorMessage = '접근이 거부되었습니다.';
    //   break;
    // case 404:
    //   errorMessage = '페이지를 찾을 수 없습니다.';
    //   break;
    case 500:
      errorMessage = '서버에 오류가 발생했습니다.';
      break;
    default:
      errorMessage = '알 수 없는 오류가 발생했습니다.';
  }

  return (
    <S.PageWrapper>
      <Text>
        {errorMessage}
        <br />
        같은 문제가 계속해서 반복된다면{' '}
        <StyledLink
          onClick={() => navigateWithState('/customerService', 'main')}
        >
          고객센터
        </StyledLink>
        를 통해 문의해주세요.
      </Text>
      <LongBtn btnName="홈으로" onClickHandler={() => navigate('/main')} />
    </S.PageWrapper>
  );
};

export default ErrorPage;

const Text = styled.p`
  line-height: 1.6;

  margin-bottom: 10px;
`;

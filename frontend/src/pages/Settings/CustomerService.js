import React from 'react';
import { NavBar, StyledLink } from '../../components';
import { ContentWrapper } from './components';
import { useNavigate } from 'react-router-dom';
import * as S from '../../styles/common';
import styled from 'styled-components';

const CustomerService = () => {
  const navigate = useNavigate();

  const goToDeleteUser = () => {
    navigate('/deleteUser');
  };

  return (
    <>
      <NavBar />
      <S.PageWrapper>
        <ContentWrapper>
          <Section>
            <h2>문의하기</h2>
            <p>모두기상 관련 문의사항은 아래의 이메일로 보내주시기 바랍니다.</p>
            <p>
              <StyledLink href="mailto:jungle4th.nmm3@gmail.com">
                jungle4th.nmm3@gmail.com
              </StyledLink>
            </p>
          </Section>
          <Section>
            <h2>회원 탈퇴</h2>
            <p>
              회원 탈퇴를 원하실 경우,{' '}
              <StyledLink onClick={goToDeleteUser}>여기</StyledLink>를 클릭해
              주세요.
            </p>
          </Section>
        </ContentWrapper>
      </S.PageWrapper>
    </>
  );
};

export default CustomerService;

const Section = styled.section`
  margin-bottom: 30px;

  h2 {
    ${({ theme }) => theme.fonts.JuaSmall}
    color: ${({ theme }) => theme.colors.primary.purple};
  }

  p {
    line-height: 1.6;
  }
`;

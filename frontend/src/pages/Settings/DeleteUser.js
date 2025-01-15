import React, { useRef, useState } from 'react';
import {
  InputLine,
  LongBtn,
  NavBar,
  StyledLink,
  LoadingWithText,
} from '../../components';
import useAuth from '../../hooks/useAuth';
import useNavigateWithState from '../../hooks/useNavigateWithState';
import * as S from '../../styles/common';
import { Section, SectionTitle, Text } from './components';
import styled from 'styled-components';

const DeleteAccount = () => {
  const navigateWithState = useNavigateWithState();
  const { handleDeleteAccount } = useAuth();

  const [password, setPassword] = useState('');
  const [isNoticeChecked, setIsNoticeChecked] = useState(false);
  const [isDeleteUserLoading, setIsDeleteUserLoading] = useState(false);

  const passwordInputRef = useRef(null);

  const handlePasswordChange = e => {
    const newPassword = e.target.value;
    setPassword(newPassword);
  };

  const handleKeyDownPassword = async e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (passwordInputRef.current) {
        passwordInputRef.current.blur();
      }
    }
  };

  if (isDeleteUserLoading) {
    return (
      <S.LoadingWrapper>
        <LoadingWithText loadingMSG="탈퇴 처리 중..." />
      </S.LoadingWrapper>
    );
  }

  return (
    <>
      <NavBar />
      <S.PageWrapper>
        <Section>
          <SectionTitle>탈퇴 전 유의사항을 확인해주세요.</SectionTitle>
          <Text style={{ marginBottom: '0px' }}>
            - 회원 탈퇴 시 참여 중인 챌린지에서 제외되며 챌린지의 호스트라면
            호스트 권한이 다른 사용자에게 위임됩니다.
            <br />
            - 탈퇴 후 회원 정보와 서비스 이용 기록이 삭제되며 복구가
            불가능합니다.
            <br />
            - 동일한 이메일로 30일 이내에 재가입이 불가능하며, 회원 탈퇴와
            관련한 문의 사항은 고객센터를 통해 부탁드립니다.
            <br />- 모두기상의 개인정보보호방침은{' '}
            <StyledLink
              onClick={() => navigateWithState('/privacyPolicy', 'deleteUser')}
            >
              여기
            </StyledLink>
            를 통해 확인해주세요.
          </Text>
        </Section>
        <FormSection>
          <Title>현재 비밀번호</Title>
          <InputLine
            ref={passwordInputRef}
            hasIcon={false}
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={handlePasswordChange}
            onKeyDown={handleKeyDownPassword}
          />
        </FormSection>
        <CheckboxWrapper>
          <CheckboxLabel>
            <input
              type="checkbox"
              checked={isNoticeChecked}
              onChange={e => setIsNoticeChecked(e.target.checked)}
            />
            <span>유의사항을 모두 확인했으며 동의합니다.</span>
          </CheckboxLabel>
        </CheckboxWrapper>
        <FormSection>
          <LongBtn
            type="submit"
            btnName="탈퇴하기"
            onClickHandler={async e =>
              await handleDeleteAccount({
                e,
                password,
                setIsDeleteUserLoading,
              })
            }
            disabled={!password || !isNoticeChecked}
          />
        </FormSection>
      </S.PageWrapper>
    </>
  );
};

export default DeleteAccount;

const Title = styled.div`
  ${({ theme }) => theme.fonts.JuaSmall}
  ${({ theme }) => theme.flex.left}
  width: 100%;
  color: ${({ theme }) => theme.colors.primary.purple};
`;

const FormSection = styled.div`
  width: 100%;
  ${({ theme }) => theme.flex.left}
  flex-direction: column;
  gap: 5px;
`;

const ErrorText = styled.p`
  color: ${({ theme }) => theme.colors.system.red};
  font-size: 1em;
`;

const CheckboxWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: left;
  flex-direction: column;
  margin-bottom: 10px;
`;

const CheckboxLabel = styled.label`
  ${({ theme }) => theme.fonts.IBMsamll};
  color: ${({ theme }) => theme.colors.neutral.black};
  cursor: pointer;

  input {
    margin-right: 8px;
  }
`;

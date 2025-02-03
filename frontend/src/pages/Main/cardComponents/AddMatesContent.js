import React, { useContext, useEffect, useState } from 'react';
import { LongBtn, InputLine } from '../../../components';
import useFetch from '../../../hooks/useFetch';
import { AccountContext, ChallengeContext } from '../../../contexts';
import { challengeServices } from '../../../apis';
import { LoadingWithText } from '../../../components';
import styled from 'styled-components';

const AddMatesContent = () => {
  const { fetchData } = useFetch();
  const [mates, setMates] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const { accessToken, userId } = useContext(AccountContext);
  const { challengeData } = useContext(ChallengeContext);
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    if (Object.keys(challengeData).length !== 0) {
      setIsDataLoading(false);
    }
  }, [challengeData]);

  const handleEmailChange = e => {
    setEmailInput(e.target.value);
    setMates(e.target.value);
  };

  const checkEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (emailInput === '') {
      alert('이메일을 입력해주세요.');
      return false;
    }

    if (!emailRegex.test(emailInput)) {
      alert('유효한 이메일 주소를 입력해주세요.');
      return false;
    } else {
      return true;
    }
  };

  const canSubmit = () => {
    return userId;
  };

  const sendInvitation = async () => {
    if (checkEmail()) {
      const response = await fetchData(() =>
        challengeServices.sendInvitationToMates({
          accessToken,
          challengeId: challengeData.challengeId,
          mateEmail: mates,
        }),
      );

      const { status, error } = response;

      if (status === 201) {
        alert('초대 메일이 전송되었습니다.');
        setEmailInput('');
        setMates('');
      } else if (error) {
        alert(error);
      }
    }
  };

  return (
    <>
      <PageWrapper>
        {isDataLoading ? (
          <LoadingWrapper>
            <LoadingWithText />
          </LoadingWrapper>
        ) : (
          <>
            <Title>미라클 메이트 초대</Title>
            <InputLine
              hasIcon={false}
              type="email"
              value={emailInput}
              onChange={handleEmailChange}
            />
            <LongBtn
              type="submit"
              btnName="친구 초대"
              onClickHandler={sendInvitation}
              isDisabled={!canSubmit()}
            />
          </>
        )}
      </PageWrapper>
    </>
  );
};

export default AddMatesContent;

const Title = styled.div`
  ${({ theme }) => theme.fonts.JuaSmall}
  ${({ theme }) => theme.flex.left}
  width:100%;
  color: ${({ theme }) => theme.colors.primary.purple};
`;

const LoadingWrapper = styled.div`
  width: 100%;

  ${({ theme }) => theme.flex.center}
`;

const PageWrapper = styled.div`
  ${({ theme }) => theme.flex.center}
  flex-direction: column;
  gap: 20px;

  width: calc(100vw-'48px');

  padding: 24px 24px 24px 24px;
`;

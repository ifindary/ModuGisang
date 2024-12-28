import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LongBtn, InputLine, Icon } from '../../../components';
import useFetch from '../../../hooks/useFetch';
import { AccountContext, ChallengeContext } from '../../../contexts';
import { challengeServices } from '../../../apis';
import { LoadingWithText } from '../../../components';
import styled from 'styled-components';

const AddMatesContent = () => {
  const navigate = useNavigate();
  const { fetchData } = useFetch();
  const [mates, setMates] = useState([]);
  const [emailInput, setEmailInput] = useState('');
  const { accessToken, userId } = useContext(AccountContext);
  const { handleCreateChallenge, challengeData } = useContext(ChallengeContext);
  const [isCreateChallengeLoading, setIsCreateChallengeLoading] =
    useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    if (Object.keys(challengeData).length !== 0) {
      setIsDataLoading(false);
    }
  }, [challengeData]);

  const handleEmailChange = e => {
    setEmailInput(e.target.value);
  };

  const checkEmail = async e => {
    e.preventDefault();

    if (emailInput === '') {
      alert('이메일을 입력해주세요.');
      return;
    }

    const response = await fetchData(() =>
      challengeServices.checkMateAvailability({
        accessToken,
        email: emailInput,
      }),
    );

    const { status, data, error } = response;
    if (status === 200) {
      if (!data.isEngaged) {
        const alreadyExists = mates.some(mate => mate === emailInput);
        if (alreadyExists) {
          alert('이미 추가한 메이트입니다.');
          setEmailInput('');
          return;
        }
        setMates([...mates, emailInput]);
        setEmailInput('');
      } else if (data.isEngaged) {
        alert('메이트가 이미 다른 챌린지에 참여 중입니다.');
        setEmailInput('');
      }
    } else if (error) {
      alert('사용자를 찾을 수 없습니다. 이메일을 확인해 주세요.');
      setEmailInput('');
    }
  };

  const deleteMate = index => {
    setMates(mates.filter((_, mateIndex) => mateIndex !== index));
  };

  const canSubmit = () => {
    return userId;
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (mates.length > 4) {
      alert('친구는 최대 4명까지 초대 가능합니다.');
      return;
    }

    const response = await handleCreateChallenge({
      newChallengeData: {
        hostId: userId,
        mates,
      },
    });
    setIsCreateChallengeLoading(false);
    if (response.data) {
      alert('챌린지가 생성되었습니다.');
      navigate('/main');
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
              hasIcon={true}
              type="email"
              icon="search"
              iconStyle={searchIcon}
              value={emailInput}
              onChange={handleEmailChange}
              onClickHandler={checkEmail}
            />

            <InvitedBox>
              <ul>
                {mates.map((mate, index) => (
                  <InvitedMate key={index}>
                    <MiniCircle /> {mate}
                    <button onClick={() => deleteMate(index)}>
                      <Icon icon="close" iconStyle={iconStyle} />
                    </button>
                  </InvitedMate>
                ))}
              </ul>
            </InvitedBox>
            <LongBtn
              type="submit"
              btnName="친구 초대"
              onClickHandler={handleSubmit}
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

const InvitedBox = styled.div`
  width: 100%;
  ${({ theme }) => theme.flex.left};
  flex-direction: column;
  align-items: flex-start;
`;

const InvitedMate = styled.li`
  border: 1px solid ${({ theme }) => theme.colors.primary.purple};
  padding-left: 10px;
  border-radius: 30px;
  margin-bottom: 12px;
  ${({ theme }) => theme.fonts.IBMsmall}
  ${({ theme }) => theme.flex.center};

  button {
    color: white;
  }
`;

const MiniCircle = styled.div`
  background-color: ${({ theme }) => theme.colors.primary.purple};
  width: 15px;
  height: 15px;
  border-radius: 50px;
  margin-right: 5px;
`;

const iconStyle = {
  size: 11,
  color: 'purple',
  hoverColor: 'white',
};

const searchIcon = {
  size: 20,
  color: 'purple',
  hoverColor: 'white',
};

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

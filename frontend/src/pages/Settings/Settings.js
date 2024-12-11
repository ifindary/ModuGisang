import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AccountContext, ChallengeContext, UserContext } from '../../contexts';
import { userServices } from '../../apis';
import useAuth from '../../hooks/useAuth';
import useFetch from '../../hooks/useFetch';
import useNavigateWithState from '../../hooks/useNavigateWithState';
import {
  NavBar,
  Icon,
  OutlineBox,
  StyledLink,
  // InputLine,
  // LongBtn,
} from '../../components';
import { AffirmationBox } from './components';
import * as S from '../../styles/common';
import styled from 'styled-components';

const Settings = () => {
  const { fetchData } = useFetch();
  const { handleSubmitLogout } = useAuth();
  const navigateWithState = useNavigateWithState();
  const navigate = useNavigate();

  const { getMyData } = useContext(UserContext);
  const user = useContext(UserContext);
  const { challengeData, handleGiveUpChallenge } = useContext(ChallengeContext);
  const { accessToken, userId } = useContext(AccountContext);

  const [isLogoutLoading, setIsLogoutLoading] = useState(false);
  const [affirmation, setAffirmation] = useState('');
  const [isAbleInput, setIsAbleInput] = useState(false);
  const [isExceeded30, setIsExceeded30] = useState(false);

  const [isHost, setIsHost] = useState(false);
  //////////////////////////////////////////
  // const [wakeTime, setWakeTime] = useState('');
  // const [challengeId, setChallengeId] = useState('');
  //////////////////////////////////////////
  const handleEditBtn = () => {
    if (!isAbleInput) {
      enableInput();
    } else {
      checkIsReadyToSave();
    }
  };

  const enableInput = () => {
    setIsAbleInput(true);
  };

  const checkIsReadyToSave = () => {
    if (!isExceeded30) {
      const isConfirmed = window.confirm('수정한 내용을 저장하시겠습니까?');
      if (isConfirmed) {
        saveNewAffirmation();
        setIsAbleInput(false);
      }
    } else {
      alert('30자를 넘길 수 없습니다.');
    }
  };

  const saveNewAffirmation = async () => {
    const response = await fetchData(() =>
      userServices.changeAffirmation({ accessToken, affirmation, userId }),
    );

    const {
      isLoading: isChangeAffirmationLoading,
      error: changeAffirmationError,
    } = response;
    if (!isChangeAffirmationLoading) {
      alert('성공적으로 변경되었습니다.');
      window.location.reload();
    } else if (changeAffirmationError) {
      alert(changeAffirmationError);
    }
  };

  const ON_CLICK_HANDLERS = [
    () => {
      handleGiveUpChallenge();
    },
    () => {
      console.log('host');
      navigate('/editChallenge');
    },
  ];

  //////////////////////////////////////////

  // const handleWakeTimeChange = e => {
  //   setWakeTime(e.target.value);
  // };

  // const handleChallengeIdChange = e => {
  //   setChallengeId(e.target.value);
  // };

  // const handlePractice = () => {
  //   console.log('연습 게임으로 이동~!');
  //   console.log(user.myData);
  // };

  // const handleChangeWakeTime = async () => {
  //   const response = await fetchData(() =>
  //     userServices.changeWakeTime({
  //       accessToken,
  //       wakeTime,
  //       userId,
  //       challengeId,
  //     }),
  //   );
  //   const { isLoading: isChangeWakeTimeLoading, error: changeWakeTimeError } =
  //     response;
  //   if (!isChangeWakeTimeLoading) {
  //     alert('기상 시간이 변경되었습니다.');
  //     // updateWakeTime(wakeTime);
  //     setWakeTime('');
  //   } else if (changeWakeTimeError) {
  //     alert(changeWakeTimeError);
  //   }
  // };

  //////////////////////////////////////////

  useEffect(() => {
    if (accessToken && userId) {
      getMyData();
    }
  }, [challengeData]);

  useEffect(() => {
    if (user.myData.affirmation) {
      setAffirmation(user.myData.affirmation);
    }
  }, [user.myData.affirmation]);

  useEffect(() => {
    if (challengeData && challengeData.hostId) {
      setIsHost(challengeData.hostId === userId);
    }
  }, [challengeData, userId]);

  return (
    <>
      <NavBar />
      <S.PageWrapper>
        <OutlineBox
          boxStyle={boxStyle}
          content={
            <UserWrapper>
              <Profile src={user.myData.profile} />
              <Text>{user.myData.userName}</Text>
            </UserWrapper>
          }
        />

        <OutlineBox
          boxStyle={boxStyle}
          content={
            <AffirmationWrapper>
              <AffirmationTitle>
                <Text isColor={true}>오늘의 다짐 문구</Text>
                <EditButton onClick={handleEditBtn}>
                  <Icon
                    icon={isAbleInput ? 'save' : 'edit'}
                    iconStyle={{
                      size: 24,
                      color: isAbleInput ? 'white' : 'purple',
                      hoverColor: isAbleInput ? 'white' : 'purple',
                    }}
                  />
                </EditButton>
              </AffirmationTitle>
              <AffirmationBox
                affirmation={affirmation}
                setAffirmation={setAffirmation}
                isAbleInput={isAbleInput}
                setIsExceeded30={setIsExceeded30}
              />
            </AffirmationWrapper>
          }
        />

        {/* <>
          <Text>챌린지 ID</Text>
          <InputLine
            label="챌린지 ID"
            type="text"
            value={challengeId}
            onChange={handleChallengeIdChange}
          />
          <Text>기상 시간</Text>

          <InputLine
            label="기상 시간"
            type="text"
            value={wakeTime}
            onChange={handleWakeTimeChange}
          />
          <LongBtn
            btnName="기상 시간 수정하기"
            onClickHandler={handleChangeWakeTime}
          />
        </> */}

        {/* <LongBtn btnName="연습 게임 진행하기" onClickHandler={handlePractice} /> */}
        <ChallengeEditWrapper onClick={ON_CLICK_HANDLERS[+isHost]}>
          {isHost ? <Text>챌린지 수정</Text> : <Text>챌린지 포기</Text>}
        </ChallengeEditWrapper>

        <ChangePasswordWrapper onClick={() => navigate('/changePassword')}>
          <Text>비밀번호 변경</Text>
          <Icon
            icon="key"
            iconStyle={{
              size: 24,
              color: 'white',
              hoverColor: 'white',
              disable: true,
            }}
          />
        </ChangePasswordWrapper>
        <LogoutWrapper
          onClick={async () =>
            await handleSubmitLogout({ setIsLogoutLoading, userId })
          }
        >
          <Text>로그아웃</Text>
          <Icon
            icon="logout"
            iconStyle={{
              size: 24,
              color: 'white',
              hoverColor: 'white',
              disable: true,
            }}
          />
        </LogoutWrapper>
        <FooterLinks>
          <StyledLink
            onClick={() => navigateWithState('/termsOfService', 'settings')}
          >
            이용약관
          </StyledLink>
          <p>|</p>
          <StyledLink
            onClick={() => navigateWithState('/privacyPolicy', 'settings')}
          >
            개인정보보호방침
          </StyledLink>
          <p>|</p>
          <StyledLink
            onClick={() => navigateWithState('/customerService', 'settings')}
          >
            고객센터
          </StyledLink>
        </FooterLinks>
      </S.PageWrapper>
    </>
  );
};

export default Settings;

const UserWrapper = styled.div`
  ${({ theme }) => theme.flex.center};
  justify-content: space-evenly;
  width: 100%;
  height: 170px;
`;

const AffirmationWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 281px;
`;

const AffirmationTitle = styled.div`
  ${({ theme }) => theme.flex.center};
  text-align: center;
  width: 100%;
  height: 55px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.primary.purple};
`;

const LogoutWrapper = styled.div`
  ${({ theme }) => theme.flex.center};
  font-weight: 500;
  width: 100%;
  height: 50px;
  padding: 10px;
  border: 2px solid ${({ theme }) => theme.colors.system.red};
  border-radius: 20px;
  ${({ theme }) => theme.fonts.JuaSmall};
  color: ${({ theme }) => theme.colors.primary.white};

  cursor: pointer;
`;

const ChangePasswordWrapper = styled(LogoutWrapper)`
  border: 2px solid ${({ theme }) => theme.colors.primary.emerald};
`;

const ChallengeEditWrapper = styled(LogoutWrapper)`
  border: 2px solid ${({ theme }) => theme.colors.primary.emerald};
`;

const Profile = styled.img`
  width: 93px;
  height: 93px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.primary.white};
`;

const Text = styled.div`
  margin-right: 10px;
  ${({ theme }) => theme.fonts.JuaSmall};
  color: ${({ isColor, theme }) =>
    isColor ? theme.colors.primary.purple : theme.colors.primary.white};
`;

const EditButton = styled.button`
  position: absolute;
  top: 8px;
  right: 5px;
`;

const FooterLinks = styled.div`
  margin-top: 10px;
  display: flex;
  justify-content: center;
  gap: 10px;
`;

const boxStyle = {
  isBold: false,
  lineColor: 'gradient',
};

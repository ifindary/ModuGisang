import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext, ChallengeContext, AccountContext } from '../../contexts';
import useCheckTime from '../../hooks/useCheckTime';
import {
  NavBar,
  OutlineBox,
  WarmUpModel,
  LoadingWithText,
  LongBtn,
} from '../../components';
import {
  StreakContent,
  InvitationsContent,
  CreateContent,
  ChallengeContent,
  EnterContent,
} from './cardComponents';
import { CARD_TYPES, CARD_STYLES } from './DATA';

import styled from 'styled-components';
import * as S from '../../styles/common';

const Main = () => {
  const navigate = useNavigate();

  // setUserData는 Test용으로 사용하는 함수
  const { accessToken, userId } = useContext(AccountContext);
  const { challengeId, getUserData } = useContext(UserContext);
  const { challengeData, setChallengeData } = useContext(ChallengeContext);
  const { isTooEarly, isTooLate } = useCheckTime(challengeData?.wakeTime);

  // ---------------현재 페이지에서 쓸 State---------------
  const [isWarmUpDone, setIsWarmUpDone] = useState(false);
  const hasChallenge = Number(challengeId) !== -1;
  const [isUserDataLoading, setIsUserDataLoading] = useState(true);
  const [isChallengeInfoLoading, setIsChallengeInfoLoading] = useState(true);

  const CARD_CONTENTS = {
    streak: <StreakContent />,
    invitations: <InvitationsContent />,
    create: <CreateContent />,
    challenge: <ChallengeContent />,
    enter: <EnterContent />,
  };

  const CARD_ON_CLICK_HANDLERS = {
    streak: () => navigate('/myStreak'),
    invitations: () => {
      // 초대받은 challenge 존재 여부에 따라 분기처리
      navigate('/joinChallenge');
    },
    create: () => navigate('/createChallenge'),
    challenge: null,
    enter: () => {
      // ================== ⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️ ==================
      // -------------⭐️ 개발 완료 후 주석 해제 필요 ⭐️ -------------
      // ================== ⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️ ==================

      // if (isTooEarly) {
      //   alert('너무 일찍 오셨습니다. 10분 전부터 입장 가능합니다.');
      // } else if (
      //   isTooLate
      //   // && !attended    ========> 오늘 챌린지 참여 못한 경우
      // ) {
      //   alert('챌린지 참여 시간이 지났습니다. 내일 다시 참여해주세요.');
      // } else if (
      //   isTooLate
      //   // && attended    ========> 오늘 챌린지 참여한 경우
      // ) {
      //   alert('멋져요! 오늘의 미라클 모닝 성공! 내일 또 만나요');
      // } else {
      navigate(`/startMorning`);
      // }
    },
  };
  // ⭐️⭐️⭐️⭐️ TEST 용 wake time 설정 ⭐️⭐️⭐️⭐️
  // ========challenge data setting=======
  const [wakeTime, setWakeTime] = useState('');
  const changeWakeTime = () => {
    setChallengeData(prev => ({ ...prev, wakeTime }));
    alert('세팅 완료!');
  };
  // ============ 나중에 지우기!! =============

  useEffect(() => {
    if (accessToken && userId) {
      getUserData();
    }
  }, [challengeData]);

  console.log(
    'userId: ',
    userId,
    ' challengeData: ',
    challengeData,
    'isWarmUpDone: ',
    isWarmUpDone,
  );

  if (!userId || !challengeData)
    return <LoadingWithText loadingMSG="페이지를 가져오고 있어요" />;
  return (
    <>
      {!isWarmUpDone ? (
        <LoadingWithText loadingMSG="페이지를 가져오고 있어요" />
      ) : (
        <>
          <NavBar />
          <S.PageWrapper>
            <input
              placeholder="00:00 형태로 입력"
              type="text"
              onChange={e => setWakeTime(e.target.value)}
              style={{
                marginTop: '20px',
                backgroundColor: 'white',
                padding: '15px',
                borderRadius: '5px',
              }}
            />
            <LongBtn onClickHandler={changeWakeTime} btnName="기상시간 세팅" />

            <CardsWrapper>
              {CARD_TYPES[hasChallenge ? 'hasChallenge' : 'noChallenge'].map(
                type => (
                  <OutlineBox
                    key={type}
                    content={CARD_CONTENTS[type]}
                    onClickHandler={CARD_ON_CLICK_HANDLERS[type]}
                    boxStyle={CARD_STYLES[type]}
                  />
                ),
              )}
            </CardsWrapper>
          </S.PageWrapper>
        </>
      )}
      <WarmUpModel
        isWarmUpDone={isWarmUpDone}
        setIsWarmUpDone={setIsWarmUpDone}
      />
    </>
  );
};

export default Main;

const CardsWrapper = styled.div`
  width: 100%;
  ${({ theme }) => theme.flex.center}
  flex-direction: column;
  gap: 33px;
`;

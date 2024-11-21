import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChallengeContext } from '../../../contexts';
import useCheckTime from '../../../hooks/useCheckTime';
import styled from 'styled-components';

const MESSAGES = {
  NOT_STARTED:
    '챌린지가 아직 시작되지 않았습니다. 당일 10분 전부터 입장 가능합니다.',
  TOO_EARLY: '너무 일찍 오셨습니다. 10분 전부터 입장 가능합니다.',
  TOO_LATE: '챌린지 참여 시간이 지났습니다. 내일 다시 참여해주세요.',
  SUCCESS: '멋져요! 오늘의 미라클 모닝 성공! 내일 또 만나요',
};

const EnterContent = () => {
  const navigate = useNavigate();
  const { checkTime } = useCheckTime();
  const { challengeData, isAttended } = useContext(ChallengeContext);
  const [checkTimeResult, setCheckTimeResult] = useState(null);

  useEffect(() => {
    if (!challengeData?.wakeTime) return;

    const { isTooEarly, isTooLate, diffDays } = checkTime(
      challengeData?.startDate,
      challengeData?.wakeTime,
    );
    setCheckTimeResult({ isTooEarly, isTooLate, diffDays });
  }, [challengeData]);

  const enterHandler = () => {
    if (!checkTimeResult) return;

    const { isTooEarly, isTooLate, diffDays } = checkTimeResult;
    if (diffDays > 0) {
      alert(MESSAGES.NOT_STARTED);
    } else if (isTooEarly) {
      alert(MESSAGES.TOO_EARLY);
    } else if (isTooLate && !isAttended) {
      alert(MESSAGES.TOO_LATE);
    } else if (isTooLate && isAttended) {
      alert(MESSAGES.SUCCESS);
    } else {
      navigate(`/startMorning`);
    }
  };

  return (
    <Wrapper $isLoading={!checkTimeResult} onClick={enterHandler}>
      챌린지 참여하기
    </Wrapper>
  );
};

export default EnterContent;

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

  z-index: 1000;

  cursor: ${({ $isLoading }) => ($isLoading ? 'not-allowed' : 'pointer')};
`;

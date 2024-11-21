import React, { useState, useEffect, useContext } from 'react';
import { ChallengeContext, UserContext } from '../../../contexts';
import useCheckTime from '../../../hooks/useCheckTime';
import EnterContent from './EnterContent';
import CreateContent from './CreateContent';
import { Icon } from '../../../components';

import { LoadingWithText } from '../../../components';
import styled from 'styled-components';

const BottomFixContent = () => {
  const { checkTime } = useCheckTime();
  const { challengeId } = useContext(UserContext);
  const { challengeData } = useContext(ChallengeContext);

  const [wakeTime, setWakeTime] = useState(challengeData?.wakeTime);
  const [diffDays, setDiffDays] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isChallengeIdLoading, setIsChallengeIdLoading] = useState(true);

  useEffect(() => {
    if (!challengeId) return;
    setIsChallengeIdLoading(false);
  }, [challengeId]);

  useEffect(() => {
    if (!challengeData?.wakeTime) return;
    setWakeTime(challengeData.wakeTime);

    const { diffDays } = checkTime(
      challengeData?.startDate,
      challengeData?.wakeTime,
    );
    setDiffDays(diffDays);
  }, [challengeData]);

  useEffect(() => {
    if (!wakeTime) return; // wakeTime이 없으면 실행하지 않음

    const [hours, minutes, seconds] = wakeTime.split(':').map(Number);
    const targetTime = new Date();
    targetTime.setHours(hours, minutes, seconds, 0);

    const countdown = () => {
      const interval = setInterval(() => {
        const now = new Date();
        const difference = targetTime - now;

        if (difference <= 0) {
          clearInterval(interval);
          setTimeLeft('00:00:00');
        } else {
          const remainingHours = String(
            Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          ).padStart(2, '0');
          const remainingMinutes = String(
            Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          ).padStart(2, '0');
          const remainingSeconds = String(
            Math.floor((difference % (1000 * 60)) / 1000),
          ).padStart(2, '0');
          setTimeLeft(
            `${remainingHours}:${remainingMinutes}:${remainingSeconds}`,
          );
        }
      }, 250);

      return () => clearInterval(interval);
    };

    countdown();
  }, [wakeTime]);

  return isChallengeIdLoading ? (
    <Wrapper>
      <LoadingWrapper>
        <LoadingWithText loadingMSG="정보를 불러오는 중입니다." />
      </LoadingWrapper>
    </Wrapper>
  ) : (
    <Wrapper>
      {challengeId === -1 ? (
        <>
          <ChallengeTitle>현재 참여중인 챌린지가 없어요 </ChallengeTitle>
          <BigText>챌린지를 직접 만들어 보세요!</BigText>
          {/* <SeperateLine /> */}
          <IconWrapper>
            {/* <Icon icon={'smile'} iconStyle={iconStyleSample} /> */}
          </IconWrapper>

          <CreateContent />
        </>
      ) : (
        <>
          <TimeDisplay>
            <TimeTitleWrapper>
              <Icon icon="timer" iconStyle={iconStyleSample} />
              <TimeTitle>기상까지 남은 시간</TimeTitle>
            </TimeTitleWrapper>
            <SeperateLine />
            <Timer>
              {diffDays ? (
                <TimerText>D-{diffDays}일 </TimerText>
              ) : (
                <>
                  {' '}
                  <TimerText>{timeLeft?.split(':')[0]}</TimerText>
                  {timeLeft && <TimerText2>:</TimerText2>}
                  <TimerText>{timeLeft?.split(':')[1]}</TimerText>
                  {timeLeft && <TimerText2>:</TimerText2>}
                  <TimerText>{timeLeft?.split(':')[2]}</TimerText>
                </>
              )}
            </Timer>
          </TimeDisplay>
          <EnterContent />
        </>
      )}
    </Wrapper>
  );
};

export default BottomFixContent;

const Wrapper = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  ${({ theme }) => theme.flex.center}
  flex-direction: column;

  background: ${({ theme }) => theme.gradient.largerEmerald};
  border-radius: 30px 30px 0 0;

  padding: 20px 0;
  z-index: 500;
`;

const LoadingWrapper = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  ${({ theme }) => theme.flex.center}
  flex-direction: column;

  background: ${({ theme }) => theme.gradient.largerEmerald};
  border-radius: 30px 30px 0 0;

  padding: 100px 0;
  z-index: 500;
`;

const TimeTitleWrapper = styled.div`
  ${({ theme }) => theme.flex.between};
`;

const TimeDisplay = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;

const TimeTitle = styled.div`
  ${({ theme }) => theme.fonts.IBMmedium};
  color: ${({ theme }) => theme.colors.primary.white};

  font-weight: 600;
  font-style: normal;
  line-height: 22px;
  letter-spacing: -0.45px;
`;

const ChallengeTitle = styled.div`
  ${({ theme }) => theme.fonts.IBMsmall};
  color: ${({ theme }) => theme.colors.primary.white};

  margin: 20px 10px 0 0;
  font-weight: 600;
  font-style: normal;
  line-height: 22px; /* 122.222% */
  letter-spacing: -0.45px;
`;

const BigText = styled.div`
  ${({ theme }) => theme.fonts.IBMlarge};
  margin: 20px 10px 0 0;
`;

const Timer = styled.div`
  ${({ theme }) => theme.flex.between}
  justify-content: center;
  width: 100%;
  padding: 0px 20px;

  color: ${({ theme }) => theme.colors.primary.white};
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5); /* 텍스트 그림자 추가 */
`;

const TimerText = styled.span`
  ${({ theme }) => theme.flex.center}
  ${({ theme }) => theme.fonts.JuaLarge};
  text-align: center;
  font-size: 55px;
  width: 80%;
`;

const TimerText2 = styled.span`
  ${({ theme }) => theme.flex.center}
  ${({ theme }) => theme.fonts.JuaLarge};
  text-align: center;
  font-size: 55px;
  width: 8px;
`;

const SeperateLine = styled.hr`
  width: 50%;
  height: 2px;
  background-color: rgba(240, 243, 255, 0.2);
  border: none;
`;

const IconWrapper = styled.div`
  margin: 20px;
`;

const iconStyleSample = {
  size: 24,
  color: 'white',
  hoverColor: 'white',
};

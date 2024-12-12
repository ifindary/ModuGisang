import React, { useContext } from 'react';
import { ChallengeContext } from '../../../../contexts';
import useCheckTime from '../../../../hooks/useCheckTime';
import Countdown from 'react-countdown';
import styled from 'styled-components';

const Timer = () => {
  const { challengeData } = useContext(ChallengeContext);
  const { checkTime } = useCheckTime();
  const { remainingTime } = checkTime(
    challengeData?.startDate,
    challengeData?.wakeTime,
  );

  const CountDownUI = props => {
    const { formatted, milliseconds, completed } = props;
    const { minutes, seconds } = formatted;
    const formattedMS =
      milliseconds / 10 > 10
        ? (milliseconds / 10).toFixed(0)
        : `0${(milliseconds / 10).toFixed(0)}`;

    if (completed) {
      return null;
    } else {
      return (
        <>
          <TimerText>{minutes}</TimerText>:<TimerText>{seconds}</TimerText>:
          <TimerText>{formattedMS}</TimerText>
        </>
      );
    }
  };

  return (
    <Wrapper>
      <Countdown
        date={Date.now() + remainingTime}
        intervalDelay={0}
        precision={2}
        zeroPadTime={2}
        renderer={CountDownUI}
      />
    </Wrapper>
  );
};

export default Timer;

const Wrapper = styled.div`
  ${({ theme }) => theme.flex.center}
  ${({ theme }) => theme.fonts.JuaMedium}
  color: ${({ theme }) => theme.colors.primary.emerald};
  margin-bottom: -3px;
`;

const TimerText = styled.div`
  width: 60px;
  text-align: center;
`;

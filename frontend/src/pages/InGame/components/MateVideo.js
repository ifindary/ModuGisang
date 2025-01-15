import React, { useEffect, useState, useContext, useRef } from 'react';
import {
  AccountContext,
  GameContext,
  OpenViduContext,
} from '../../../contexts';
import { userServices } from '../../../apis';
import useFetch from '../../../hooks/useFetch';
import styled from 'styled-components';

const MateVideo = ({ mateId, mateName, onClick }) => {
  const { fetchData } = useFetch();
  const mateVideoRef = useRef(null);
  const { accessToken } = useContext(AccountContext);
  const { mateStreams } = useContext(OpenViduContext);
  const { inGameMode, matesMissionStatus } = useContext(GameContext);
  const [thisMate, setThisMate] = useState(undefined);
  const [mateStatus, setMateStatus] = useState({
    online: false,
    missionCompleted: false,
  });
  const [mateData, setMateData] = useState(null);

  const getMateData = async ({ mateId: userId }) => {
    const response = await fetchData(() =>
      userServices.getUserInfo({ accessToken, userId }),
    );
    const { isLoading, data, error } = response;
    if (!isLoading && data) {
      setMateData(data);
    }
    if (error) {
      console.error(error);
      setMateData(null);
    }
  };

  useEffect(() => {
    if (mateId !== -1 && mateId === undefined) return;
    getMateData({ mateId });
  }, [mateId]);

  useEffect(() => {
    if (mateStreams.length > 0) {
      const thisMate = mateStreams.find(
        mate => JSON.parse(mate.stream.connection.data).userId === `${mateId}`,
      );
      if (thisMate) {
        setThisMate(thisMate);
        setMateStatus(prev => ({ ...prev, online: thisMate?.stream.hasVideo }));
      } else {
        setThisMate(null);
        setMateStatus(prev => ({ ...prev, online: false }));
      }
    } else {
      setThisMate(null);
      setMateStatus(prev => ({ ...prev, online: false }));
    }
  }, [mateStreams]);

  useEffect(() => {
    if (mateStatus.online) {
      thisMate.addVideoElement(mateVideoRef.current);
    }
  }, [thisMate]);

  useEffect(() => {
    if (matesMissionStatus[mateId]) {
      setMateStatus(prev => ({
        ...prev,
        missionCompleted: matesMissionStatus[mateId].missionCompleted,
      }));
    }
  }, [matesMissionStatus]);

  return (
    <Wrapper onClick={onClick} $isWaitingRoom={inGameMode === 0}>
      {mateStatus.online ? (
        <Video
          ref={mateVideoRef}
          autoPlay
          playsInline
          $isCompleted={mateStatus.missionCompleted}
          $isNotGame={inGameMode === 0 || inGameMode === 7}
          $isWaitingRoom={inGameMode === 0}
          $isHighStreak={mateData?.streakDays >= 300}
        />
      ) : (
        <EmptyVideo>Zzz...</EmptyVideo>
      )}

      <UserName>{mateName}</UserName>
    </Wrapper>
  );
};

export default MateVideo;

const Wrapper = styled.div`
  position: relative;

  width: 100%;
  height: 100%;

  display: flex;
  ${({ theme }) => theme.flex.center}
  justify-content: flex-start;
  flex-direction: column;

  box-shadow: ${({ theme }) => theme.boxShadow.basic};

  border-radius: ${({ theme }) => theme.radius.small};
`;

const Video = styled.video`
  z-index: 100;
  position: absolute;
  width: 100%;
  height: 66%;
  object-fit: cover;

  border-radius: ${({ theme }) => theme.radius.small};
  border: ${({ $isNotGame, $isCompleted, theme }) =>
    $isNotGame
      ? `3px solid ${theme.colors.primary.white}`
      : $isCompleted
        ? `3px solid ${theme.colors.primary.emerald}`
        : `3px solid ${theme.colors.system.red}`};

  @keyframes emeraldGlow {
    0% {
      box-shadow: 0 0 10px 0 rgba(21, 245, 186, 0.5);
    }
    50% {
      border-color: rgba(21, 245, 186, 1);
      box-shadow: 0 0 20px 0 rgba(21, 245, 186, 0.7);
    }
    100% {
      box-shadow: 0 0 10px 0 rgba(21, 245, 186, 0.5);
    }
  }

  animation: ${({ $isHighStreak, $isWaitingRoom }) =>
    $isHighStreak &&
    $isWaitingRoom &&
    `emeraldGlow 2s infinite alternate ease-in-out`};

  // mirror mode
  will-change: transform;
  transform: rotateY(180deg) translateZ(0);
  -webkit-transform: rotateY(180deg);
`;

const UserName = styled.span`
  position: fixed;
  bottom: 23px;
  width: 140%;

  color: ${({ theme }) => theme.colors.primary.white};
  ${({ theme }) => theme.fonts.IBMsmall};
  font-size: 13px;
  text-align: center;
`;

const EmptyVideo = styled.div`
  position: absolute;
  width: 100%;
  height: 66%;
  ${({ theme }) => theme.flex.center};
  margin: auto;

  border-radius: ${({ theme }) => theme.radius.small};
  border: 3px solid ${({ theme }) => theme.colors.neutral.gray};

  background-color: ${({ theme }) => theme.colors.translucent.white};

  color: ${({ theme }) => theme.colors.neutral.gray};
  font-size: 20px;
`;

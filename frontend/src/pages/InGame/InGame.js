import React, { useState, useEffect, useContext } from 'react';
import { Capacitor } from '@capacitor/core';
import { useNavigate } from 'react-router-dom';
import {
  ChallengeContext,
  GameContext,
  OpenViduContext,
  MediaPipeContext,
  AccountContext,
} from '../../contexts';
import useCheckTime from '../../hooks/useCheckTime';
import { userServices } from '../../apis';
import useFetch from '../../hooks/useFetch';

import InGameNav from './components/Nav/InGameNav';
import { MyVideo, MateVideo } from './components';
import { Result } from './';
import FriendStreak from '../InGame/Waiting/FriendStreak';

import { MusicController } from './Sound';

import styled, { css } from 'styled-components';

const GAME_MODE = {
  100: 'loadModel',
  0: 'waiting',
  1: 'mission1',
  2: 'mission2',
  3: 'mission3',
  4: 'mission4',
  5: 'mission5',
  6: 'affirmation',
  7: 'result',
};

const InGame = () => {
  const navigate = useNavigate();
  const { userId: myId } = useContext(AccountContext);
  const { challengeData } = useContext(ChallengeContext);
  const { checkTime } = useCheckTime();
  const { isTooLate, isTooEarly } = checkTime(challengeData?.wakeTime);
  const { inGameMode, isEnteredTimeSent, sendEnteredTime } =
    useContext(GameContext);
  const { myStream, myVideoRef } = useContext(OpenViduContext);
  const {
    poseModel,
    holisticModel,
    setIsPoseLoaded,
    setIsPoseInitialized,
    setIsHolisticLoaded,
    setIsHolisticInitialized,
    setIsWarmUpDone,
  } = useContext(MediaPipeContext);
  const [redirected, setRedirected] = useState(false);
  const { accessToken } = useContext(AccountContext);
  const { fetchData } = useFetch();
  const [platform, setPlatform] = useState('web');

  const [mateList, setMateList] = useState([]);
  const [isMateSelected, setIsMateSelected] = useState(false);
  const [isMateDataLoading, setIsMateDataLoading] = useState(true);
  const [mateData, setMateData] = useState(null);

  useEffect(() => {
    if (challengeData) {
      setMateList(challengeData?.mates?.filter(mate => mate.userId !== myId));
    } else return;
  }, [challengeData]);

  useEffect(() => {
    if (GAME_MODE[inGameMode] === 'waiting') {
      if (isTooLate) {
        alert('챌린지 참여 시간이 지났습니다.');
        setRedirected(true);
        navigate('/main');
      } else if (isTooEarly) {
        alert('챌린지 시작 시간이 아닙니다.');
        setRedirected(true);
        navigate('/main');
      }
    }
  }, [inGameMode, isTooEarly, isTooLate, redirected]);

  useEffect(() => {
    if (GAME_MODE[inGameMode] === 'waiting') {
      if (isEnteredTimeSent) {
        return;
      } else {
        sendEnteredTime();
      }
    }
    if (GAME_MODE[inGameMode] === 'result') {
      poseModel.current = null;
      holisticModel.current = null;
      setIsPoseLoaded(false);
      setIsPoseInitialized(false);
      setIsHolisticLoaded(false);
      setIsHolisticInitialized(false);
      setIsWarmUpDone(false);
    }
  }, [inGameMode, isEnteredTimeSent]);

  useEffect(() => {
    // inGame unmount될 때 poseModel, holisticModel 초기화
    return () => {
      poseModel.current = null;
      holisticModel.current = null;
      setIsPoseLoaded(false);
      setIsPoseInitialized(false);
      setIsHolisticLoaded(false);
      setIsHolisticInitialized(false);
      setIsWarmUpDone(false);

      if (myVideoRef.current) {
        if (myStream instanceof MediaStream) {
          myStream.getTracks().forEach(track => track.stop());
          myVideoRef.current.srcObject = null;
        }
      }
    };
  }, []);

  useEffect(() => {
    setPlatform(Capacitor.getPlatform());
  }, []);

  const showSelectedMateData = mateId => {
    if (mateId !== -1) {
      setIsMateSelected(true);
      setIsMateDataLoading(true);
      getMateData(mateId);
    } else {
      console.error('Selected mateId is not valid');
    }
  };

  const getMateData = async userId => {
    const response = await fetchData(() =>
      userServices.getUserInfo({ accessToken, userId }),
    );
    setMateData(response.data);
  };

  useEffect(() => {
    if (!mateData) return;
    setIsMateDataLoading(false);
  }, [mateData]);

  if (redirected) return null;
  return (
    <>
      {isMateSelected && !isMateDataLoading && (
        <FriendStreak
          mateData={mateData}
          isMateDataLoading={isMateDataLoading}
          setIsMateSelected={setIsMateSelected}
        />
      )}
      <InGameNav />

      <MusicController />

      {GAME_MODE[inGameMode] !== 'result' && (
        <Wrapper $platform={platform} $hasMate={mateList?.length > 0}>
          <>
            <MyVideo />
            <MatesVideoWrapper $isSingle={mateList?.length === 1}>
              {mateList?.length > 0 &&
                mateList?.map(({ userId, userName }, idx) => (
                  <MateVideo
                    key={idx}
                    mateId={userId}
                    mateName={userName}
                    onClick={() => showSelectedMateData(userId)}
                  />
                ))}
            </MatesVideoWrapper>
          </>
        </Wrapper>
      )}
      {GAME_MODE[inGameMode] === 'result' && <Result />}
    </>
  );
};

export default InGame;

const Wrapper = styled.div`
  width: 100vw;
  height: ${({ $platform }) => ($platform === 'ios' ? '93vh' : '100vh')};

  overflow: hidden;

  ${({ $hasMate, $platform }) => css`
    padding: ${$hasMate
      ? $platform === 'web'
        ? '104px 24px 0px 24px'
        : $platform === 'ios'
          ? '75px 24px 0px 24px'
          : '75px 24px 0px 24px'
      : $platform === 'ios'
        ? '75px 24px 30px 24px'
        : $platform === 'web'
          ? '104px 24px 30px 24px'
          : '75px 24px 30px 24px'};

    ${$hasMate &&
    css`
      display: grid;
      grid-template-rows: auto 150px;
      gap: 10px;
    `}
  `}
`;

const MatesVideoWrapper = styled.div`
  width: 100%;
  height: 150px;

  ${({ theme, $isSingle }) =>
    $isSingle ? theme.flex.right : theme.flex.between}

  gap: 12px;
`;

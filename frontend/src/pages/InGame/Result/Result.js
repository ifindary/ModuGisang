import React, { useState, useEffect, useContext, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import {
  AccountContext,
  GameContext,
  OpenViduContext,
  UserContext,
} from '../../../contexts';
import useFetch from '../../../hooks/useFetch';
import { inGameServices, userServices } from '../../../apis';

import { LoadingWithText } from '../../../components';

import { TheRestVideo } from '../components';
import { gold, silver, bronze } from '../../../assets/medals';

import { confettiEffect, fireworks } from '../components/VisualEffects';
import styled, { css } from 'styled-components';

const MEDAL_ICONS = {
  gold: gold,
  silver: silver,
  bronze: bronze,
};

const GAME_MODE = {
  0: 'waiting',
  1: 'mission1',
  2: 'mission2',
  3: 'mission3',
  4: 'mission4',
  5: 'mission5',
  6: 'affirmation',
  7: 'result',
};

const HEADER_TEXT = '오늘의 미라클 메이커';

const Result = () => {
  const { fetchData } = useFetch();
  const { accessToken, userId: myId } = useContext(AccountContext);
  const { challengeId } = useContext(UserContext);

  const { mateStreams, myVideoRef, myStream } = useContext(OpenViduContext);
  const { inGameMode, isGameResultReceived } = useContext(GameContext);

  const theTopVideoRef = useRef(null);

  const [gameResults, setGameResults] = useState(null);
  const [theTopUserVideo, setTheTopUserVideo] = useState(null);
  const [theTopUserData, setTheTopUserData] = useState(null);
  const [theRestUsersStream, setTheRestUsersStream] = useState(null);

  const [isVideoLoading, setIsVideoLoading] = useState(true);

  const [platform, setPlatform] = useState('web');

  const getGameResults = async () => {
    const response = await fetchData(() =>
      inGameServices.getGameResults({ accessToken, challengeId }),
    );

    const { isLoading, data, error } = response;

    if (!isLoading && data) {
      setGameResults(data);
    } else {
      console.error('##### ==== Game Results Error => ', error);
    }
  };

  const getTopUserData = async theTopUserId => {
    const response = await fetchData(() =>
      userServices.getUserInfo({ accessToken, userId: theTopUserId }),
    );

    setTheTopUserData(response.data);
  };

  useEffect(() => {
    if (myVideoRef && myStream) {
      myStream.addVideoElement(myVideoRef.current);
    }
  }, [myStream, myVideoRef]);

  useEffect(() => {
    if (GAME_MODE[inGameMode] === 'result' && !isGameResultReceived) {
      getGameResults();
    } else return;
  }, [inGameMode, isGameResultReceived]);

  useEffect(() => {
    if (gameResults?.length > 0) {
      const theTopUserId = gameResults[0].userId;
      getTopUserData(theTopUserId);

      let theRestUsersStream = mateStreams.filter(
        mate =>
          parseInt(JSON.parse(mate.stream.connection.data).userId) !==
            theTopUserId &&
          parseInt(JSON.parse(mate.stream.connection.data).userId) !== myId,
      );

      if (theTopUserId === myId) {
        setTheTopUserVideo(myStream);
        myStream.addVideoElement(theTopVideoRef.current);
        setTheRestUsersStream(theRestUsersStream);
      } else {
        const theTopUserVideo = mateStreams.find(
          mate =>
            parseInt(JSON.parse(mate.stream.connection.data).userId) ===
            theTopUserId,
        );
        theTopUserVideo.addVideoElement(theTopVideoRef.current);
        setTheRestUsersStream([...theRestUsersStream, myStream]);
      }
    }
  }, [gameResults]);

  useEffect(() => {
    if (theTopVideoRef && theTopUserVideo) {
      theTopUserVideo?.addVideoElement(theTopVideoRef.current);
    }
  }, [theTopUserVideo, theTopVideoRef]);

  useEffect(() => {
    const handleVideoLoading = () => {
      setIsVideoLoading(false);
    };

    if (theTopVideoRef.current) {
      theTopVideoRef.current.addEventListener('playing', handleVideoLoading);
    }

    return () => {
      if (theTopVideoRef.current) {
        theTopVideoRef.current.removeEventListener(
          'playing',
          handleVideoLoading,
        );
      }
    };
  }, [theTopVideoRef]);

  useEffect(() => {
    confettiEffect(3);
    fireworks();
  }, []);

  useEffect(() => {
    setPlatform(Capacitor.getPlatform());
  }, []);

  return (
    <>
      <Wrapper $platform={platform} $hasRest={theRestUsersStream?.length > 0}>
        <UpperArea>
          {(!theTopUserData || !theRestUsersStream) && (
            <LoadingWithText loadingMSG="결과를 불러오는 중입니다" />
          )}
          <Header>
            <HeaderText>{HEADER_TEXT}</HeaderText>
          </Header>
          <TheTopUserArea>
            {isVideoLoading && (
              <LoadingWithText loadingMSG="카메라를 인식 중이에요" />
            )}
            <TheTopVideo
              ref={theTopVideoRef}
              autoPlay
              playsInline
              $canDisplay={theTopUserData}
            />
            <TheTopUserInfo>
              <TheTopName>{theTopUserData?.userName}</TheTopName>
              <TheTopStreak>
                미라클 모닝
                <TheTopStreakDays>
                  {theTopUserData?.streakDays}
                </TheTopStreakDays>
                일차
              </TheTopStreak>
              <Medals>
                {['gold', 'silver', 'bronze'].map((medal, idx) => {
                  const medalCount = theTopUserData?.medals[medal];
                  return (
                    <MedalArea key={idx}>
                      {theTopUserData?.medals[medal] > 0 && (
                        <MedalCount>{medalCount}</MedalCount>
                      )}
                      <Medal
                        key={idx}
                        src={MEDAL_ICONS[medal]}
                        $count={medalCount}
                      />
                    </MedalArea>
                  );
                })}
              </Medals>{' '}
            </TheTopUserInfo>
          </TheTopUserArea>
          <Rankings>
            {gameResults?.length > 0 &&
              gameResults?.map(({ userName, score }, idx) => (
                <RankingWrapper key={idx}>
                  <ScoreLine
                    $scoreWidth={score < 31 ? 31 : score}
                    $isTheTop={idx === 0}
                  >
                    <RangkingAndScore>
                      <RankingNum>{idx + 1}</RankingNum>
                      <Score>{score}점</Score>
                    </RangkingAndScore>
                    {score >= 60 && (
                      <AllInLine>
                        <UserName>{userName}</UserName>
                        <UserProfile
                          src={`https://api.dicebear.com/8.x/open-peeps/svg?seed=${userName}`}
                        />
                      </AllInLine>
                    )}
                    {score < 60 && score >= 41 && (
                      <ProfileInLine $scoreWidth={score}>
                        <UserProfile
                          $profileInline={true}
                          src={`https://api.dicebear.com/8.x/open-peeps/svg?seed=${userName}`}
                        />
                        <UserName $profileInline={true}>{userName}</UserName>
                      </ProfileInLine>
                    )}
                  </ScoreLine>
                  {score < 41 && (
                    <ProfileOutLine
                      $profileInline={false}
                      $scoreWidth={score < 31 ? 31 : score}
                    >
                      <UserProfile
                        $profileInline={false}
                        src={`https://api.dicebear.com/8.x/open-peeps/svg?seed=${userName}`}
                      />
                      <UserName $profileInline={false}>{userName}</UserName>
                    </ProfileOutLine>
                  )}
                </RankingWrapper>
              ))}
          </Rankings>
        </UpperArea>
        {theRestUsersStream?.length > 0 && (
          <TheRestUsersWrapper $isSingle={theRestUsersStream?.length === 1}>
            {theRestUsersStream?.length > 0 &&
              theRestUsersStream?.map((thisUserStream, idx) => (
                <TheRestVideo key={idx} thisUserStream={thisUserStream} />
              ))}
          </TheRestUsersWrapper>
        )}
      </Wrapper>
      <DummyMyVideo ref={myVideoRef} />
    </>
  );
};

export default Result;

const Wrapper = styled.div`
  width: 100vw;
  height: ${({ $platform }) => ($platform === 'ios' ? '93vh' : '100vh')};

  overflow: hidden;

  ${({ $hasRest, $platform }) => css`
    padding: ${$hasRest
      ? $platform === 'web'
        ? '104px 24px 0px 24px'
        : $platform === 'ios'
          ? '75px 24px 0px 24px'
          : '104px 24px 0px 24px'
      : $platform === 'ios'
        ? '75px 24px 30px 24px'
        : $platform === 'web'
          ? '104px 24px 30px 24px'
          : '75px 24px 30px 24px'};

    ${$hasRest &&
    css`
      display: grid;
      grid-template-rows: auto 150px;
      gap: 10px;
    `}
  `}
`;

const UpperArea = styled.div`
  position: relative;
  ${({ theme }) => theme.flex.center};
  flex-direction: column;
  width: 100%;
  height: 100%;

  ::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: ${({ theme }) => theme.radius.medium};
    border: 3px solid transparent;
    background: ${({ theme }) => theme.gradient.largerPurple} border-box;
    mask:
      linear-gradient(#fff 0 0) padding-box,
      linear-gradient(#fff 0 0);
    mask-composite: exclude;
  }
`;

const Header = styled.div`
  position: absolute;
  top: 0;

  ${({ theme }) => theme.flex.center}
  width: 100%;
  height: 48px;

  padding: 12px;
  border-radius: 30px 30px 0 0;

  ${({ theme }) => theme.fonts.JuaSmall}

  background-color: ${({ theme }) => theme.colors.primary.purple};
`;

const HeaderText = styled.header`
  margin-bottom: -5px;
`;

const TheTopUserArea = styled.div`
  ${({ theme }) => theme.flex.left};

  gap: 25px;

  width: 100%;
  height: 50%;

  padding: 70px 24px 24px 24px;
`;

const TheTopVideo = styled.video`
  display: ${({ $canDisplay }) => ($canDisplay ? 'block' : 'none')};

  width: 40%;
  height: 100%;

  border-radius: ${({ theme }) => theme.radius.medium};
  border: transparent;

  animation: yellow-glow 2s infinite alternate ease-in-out;
  @keyframes yellow-glow {
    0% {
      box-shadow: 2px 3px 30px rgba(255, 209, 0, 0.5);
    }
    50% {
      box-shadow: 4px 6px 60px rgba(255, 209, 0, 0.8);
    }
    100% {
      box-shadow: 2px 3px 30px rgba(255, 209, 0, 0.5);
    }
  }
  transform: scaleX(-1);

  object-fit: cover;
`;

const TheTopUserInfo = styled.div`
  ${({ theme }) => theme.flex.left};
  align-items: flex-start;
  flex-direction: column;
  gap: 8px;
`;

const TheTopName = styled.span`
  ${({ theme }) => theme.fonts.JuaSmall};
  text-align: left;
`;

const TheTopStreak = styled.span`
  ${({ theme }) => theme.fonts.IBMsmall};
`;

const TheTopStreakDays = styled.span`
  margin: 0 5px;
  ${({ theme }) => theme.fonts.IBMMedium};
  font-size: 24px;
  font-weight: 900;

  color: ${({ theme }) => theme.colors.primary.emerald};
`;

const Medals = styled.div`
  ${({ theme }) => theme.flex.between}

  width: 100%;
  margin: 10px 0px 0px 15px;
`;

const MedalArea = styled.div`
  position: relative;
  ${({ theme }) => theme.flex.center}

  width: 30px;
  height: 30px;
`;

const MedalCount = styled.span`
  z-index: 200;
  position: absolute;
  top: -2px;
  left: -14px;
  margin: auto;

  ${({ theme }) => theme.fonts.IBMMedium};
  font-size: 18px;
  color: ${({ theme }) => theme.colors.primary.white};
  text-shadow: 0px 4px 4px rgba(0, 0, 0, 0.5);
`;

const Medal = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  margin: auto;

  width: 20px;

  opacity: ${({ $count }) => ($count > 0 ? 1 : 0.3)};
`;

const Rankings = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;

  width: 100%;
  height: 50%;
  padding: 0px 12px 12px 0px;
`;

const RankingWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const ScoreLine = styled.div`
  width: ${({ $scoreWidth }) => $scoreWidth}%;

  ${({ theme }) => theme.flex.between};
  align-items: center;

  border-radius: 0 30px 30px 0;
  background: ${({ theme }) => theme.gradient.largerPurple};

  ${({ $isTheTop }) =>
    $isTheTop &&
    css`
      box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.system.yellow} inset;
    `}
`;

const RangkingAndScore = styled.div`
  ${({ theme }) => theme.flex.left};
  margin-left: 10px;
  gap: 10px;
`;

const RankingNum = styled.span`
  ${({ theme }) => theme.flex.center};

  ${({ theme }) => theme.fonts.IBMmedium};
  font-weight: 900;

  padding: 13px 13px;

  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.translucent.lightNavy};
`;

const Score = styled.span`
  padding: 20px 0px;

  ${({ theme }) => theme.fonts.IBMmedium};
  font-weight: bold;

  color: ${({ theme }) => theme.colors.primary.navy};
  font-weight: 500;
  margin-right: 5px;
`;

const AllInLine = styled.div`
  ${({ theme }) => theme.flex.right};
  align-items: center;

  margin-right: 8px;
  height: 25px;

  border-radius: ${({ theme }) => theme.radius.medium};
  background-color: ${({ theme }) => theme.colors.translucent.lightNavy};
`;

const ProfileInLine = styled.div`
  position: absolute;
  left: calc(${({ $scoreWidth }) => $scoreWidth}% - 34px);
  width: 100%;

  ${({ theme }) => theme.flex.right};
  align-items: center;

  height: 25px;

  border-radius: ${({ theme }) => theme.radius.medium};
`;

const ProfileOutLine = styled.div`
  ${({ theme }) => theme.flex.right};
  align-items: center;

  position: absolute;
  top: 0;
  left: calc(${({ $scoreWidth }) => $scoreWidth}% + 10px);

  margin-right: 8px;

  border-radius: ${({ theme }) => theme.radius.medium};
  background-color: ${({ theme }) => theme.colors.translucent.lightNavy};
`;

const UserProfile = styled.img`
  width: 25px;
  height: 25px;

  border-radius: 50%;
  object-fit: cover;
  background-color: ${({ theme }) => theme.colors.primary.white};

  ${({ $profileInline }) =>
    $profileInline &&
    css`
      position: absolute;
      left: 0;
    `}
`;

const UserName = styled.span`
  padding: 10px 5px;

  ${({ theme }) => theme.fonts.IBMsmall};
  margin-left: 5px;

  text-align: right;

  ${({ $profileInline }) =>
    $profileInline &&
    css`
      position: absolute;
      left: 30px;
    `}
`;

const TheRestUsersWrapper = styled.div`
  width: 100%;
  height: 150px;

  ${({ theme, $isSingle }) =>
    $isSingle ? theme.flex.right : theme.flex.between};

  gap: 12px;
`;

const DummyMyVideo = styled.video`
  display: none;
  width: 100%;
  height: 100%;
`;

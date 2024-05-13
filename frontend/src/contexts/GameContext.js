import React, { createContext, useState, useEffect, useContext } from 'react';

import { ChallengeContext } from './';
import useCheckTime from '../hooks/useCheckTime';

const GameContext = createContext();

const GAME_MODE = {
  0: 'waiting',
  1: 'mission1',
  2: 'mission2',
  3: 'mission3',
  4: 'mission4',
  5: 'affirmation',
  6: 'result',
};

// mission 당 소요 시간
const GAME_MODE_DURATION = {
  1: 21500,
  2: 17000,
  3: 17000,
  4: 17500,
  5: 8000,
};

const GameContextProvider = ({ children }) => {
  const { challengeData } = useContext(ChallengeContext);
  const { remainingTime, isTooLate, isTooEarly } = useCheckTime(
    challengeData?.wakeTime,
  );

  const [myMissionStatus, setMyMissionStatus] = useState(false);
  const [matesMissionStatus, setMatesMissionStatus] = useState({
    // [userId]: { missionCompleted: boolean } 형태"
  });

  const [isMissionStarting, setIsMissionStarting] = useState(false);
  const [inGameMode, setInGameMode] = useState(
    // parseInt(localStorage.getItem('inGameMode')) || 0,
    0,
    // 6,
  );

  const [gameScore, setGameScore] = useState(0);
  // Mission1, 2, 3, 4에서 축적되는 점수
  // Affirmation Round에서 Backend로 전송하여, 모든 유저의 ranking 계산값 리턴 받기

  const [rangkings, setRankings] = useState([]);
  // [ { userId: string, userName: string, score: number } ] 형태 (sort한 상태로 받아오기)

  let nextGameMode = 1;

  const updateMode = () => {
    nextGameMode += 1;
    if (nextGameMode <= 7) {
      // localStorage.setItem('inGameMode', JSON.stringify(nextGameMode));
      setInGameMode(nextGameMode);
      setIsMissionStarting(true);
      setMyMissionStatus(false); // 미션 수행상태 초기화

      if (GAME_MODE[nextGameMode] !== 'result') {
        setTimeout(updateMode, GAME_MODE_DURATION[nextGameMode]);
      }

      if (GAME_MODE[nextGameMode] === 'result') {
        // localStorage.setItem('inGameMode', JSON.stringify(6));
      }
    }
  };

  const scheduleFirstMission = () => {
    setTimeout(() => {
      setInGameMode(1); // waiting 끝나면 첫 미션으로 전환
      setIsMissionStarting(true); // 게임 로딩 시작
      setMyMissionStatus(false); // 미션 수행상태 초기화
      setTimeout(updateMode, GAME_MODE_DURATION[1]); // 첫 미션 후 다음 모드로 전환 시작
    }, remainingTime);
  };

  useEffect(() => {
    if (challengeData && !isTooEarly && !isTooLate) {
      // ⭐️⭐️⭐️⭐️⭐️⭐️ 개발 편의 용 주석 ⭐️⭐️⭐️⭐️⭐️//
      // 나중에 다시 풀어야 함
      scheduleFirstMission();
      // ===== ⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️ ==================
    }
  }, [challengeData]);

  useEffect(() => {
    console.log('@@@@@ MATE MISSION STATUS @@@@@ => ', matesMissionStatus);
  }, [matesMissionStatus]);

  console.log(
    '^^^^^^GAME CONTEXT^^^^^ game mode, remaining time, my mission status=> ',
    inGameMode,
    remainingTime,
    myMissionStatus,
    gameScore,
  );
  return (
    <GameContext.Provider
      value={{
        inGameMode,
        isMissionStarting,
        setIsMissionStarting,
        gameScore,
        setGameScore,
        rangkings,
        setRankings,
        myMissionStatus,
        setMyMissionStatus,
        matesMissionStatus,
        setMatesMissionStatus,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export { GameContext, GameContextProvider };

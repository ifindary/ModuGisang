import React, { useContext, useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { useNavigate } from 'react-router-dom';
import {
  GameContext,
  OpenViduContext,
  MediaPipeContext,
  SafeAreaContext,
} from '../../../../contexts';
import { RoundBtn } from '../../../../components';
import { GameRound, Timer } from './';
import { INFO_BY_GAME_MODE } from './DATA';
import styled from 'styled-components';

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

const InGameNav = () => {
  const navigate = useNavigate();
  const { inGameMode } = useContext(GameContext);
  const { micOn, turnMicOnOff, myVideoRef, myStream } =
    useContext(OpenViduContext);
  const { setIsWarmUpDone } = useContext(MediaPipeContext);
  const { safeAreaPadding } = useContext(SafeAreaContext);

  const goToMain = () => {
    setIsWarmUpDone(false);
    navigate('/main');
    // localStorage.removeItem('inGameMode');
    if (myVideoRef.current) {
      if (myStream instanceof MediaStream) {
        myStream.getTracks().forEach(track => track.stop());
        myVideoRef.current.srcObject = null; // 비디오 요소에서 스트림 연결을 해제합니다.
      }
    }
  };

  // useEffect(() => {
  //   if (turnMicOnOff) {
  //     if (inGameMode === 4 || inGameMode === 5) {
  //       // ----------⭐️ 고려 사항 ⭐️-------------
  //       // Mission4(전방에 함성 발사)에서 마이크 끄려고 했는데,
  //       // openvidu와 연결되어 있어서, 끄면 안 됨.
  //       // 상대방에게 들리지 않지만, 측정은 가능하게 하려면,
  //       // Mission4에 쓰는 오디오 따로 따와야 함
  //       // -----------------------------------
  //       //
  //       // if (micOn) turnMicOnOff(false);
  //     }
  //     if (inGameMode === 6) {
  //       if (!micOn) turnMicOnOff(true);
  //     }
  //   }
  //   return () => {};
  // }, [inGameMode, turnMicOnOff]);

  if (inGameMode === 100) return null;
  return (
    <Wrapper $safeAreaPadding={safeAreaPadding}>
      {(GAME_MODE[inGameMode] === 'waiting' ||
        GAME_MODE[inGameMode] === 'result') && (
        <RoundBtn btnStyle={BACK_BTN_STYLE} onClickHandler={goToMain} />
      )}

      {GAME_MODE[inGameMode] !== 'waiting' &&
        GAME_MODE[inGameMode] !== 'result' && <GameRound text={inGameMode} />}

      <TextArea>
        {GAME_MODE[inGameMode] !== 'waiting' && (
          <>
            <MissionTitle $isResultMode={GAME_MODE[inGameMode] === 'result'}>
              {INFO_BY_GAME_MODE[inGameMode].title}
            </MissionTitle>
            <MissionInst>
              {INFO_BY_GAME_MODE[inGameMode].instruction}
            </MissionInst>
          </>
        )}
        {GAME_MODE[inGameMode] === 'waiting' && (
          <>
            <Timer />
            <MissionInst text={INFO_BY_GAME_MODE[inGameMode].instruction} />
          </>
        )}
      </TextArea>
      <RoundBtn
        btnStyle={micOn ? MIC_ON_BTN_STYLE : MIC_OFF_BTN_STYLE}
        onClickHandler={turnMicOnOff}
      />
    </Wrapper>
  );
};

export default InGameNav;

const Wrapper = styled.nav`
  z-index: 900;
  position: fixed;
  top: 0;

  display: grid;
  grid-template-columns: 40px auto 40px;
  align-items: center;

  width: 100vw;
  height: 100px;
  padding: ${({ $safeAreaPadding }) => $safeAreaPadding};
`;

const TextArea = styled.div`
  ${({ theme }) => theme.flex.center}
  flex-direction: column;
  gap: 6px;

  margin-bottom: -8px;
`;

const MissionTitle = styled.div`
  ${({ $isResultMode, theme }) =>
    $isResultMode ? theme.fonts.JuaMedium : theme.fonts.JuaSmall}
  color: ${({ theme }) => theme.colors.primary.emerald};
  text-align: center;
`;

const MissionInst = styled.div`
  ${({ theme }) => theme.fonts.IBMsmall}
  font-size: 15px;

  color: ${({ theme }) => theme.colors.primary.white};
  text-align: center;
`;

const BACK_BTN_STYLE = {
  size: 40,
  disabled: false,
  icon: 'back',
  iconStyle: {
    size: 20,
    color: 'white',
    hoverColor: 'purple',
  },
};

const MIC_ON_BTN_STYLE = {
  size: 40,
  disabled: false,
  icon: 'micOn',
  iconStyle: {
    size: 20,
    color: 'white',
    hoverColor: 'purple',
  },
};

const MIC_OFF_BTN_STYLE = {
  size: 40,
  disabled: false,
  icon: 'micOff',
  iconStyle: {
    size: 20,
    color: 'white',
    hoverColor: 'purple',
  },
};

import React, { useEffect, useRef, useContext, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import styled from 'styled-components';
import { RoundBtn } from '../../../components';
import {
  BackgroundMusic,
  MissionSoundEffects,
  RoundSoundEffect,
  FailedSoundEffect,
} from '../Sound';

import { GameContext } from '../../../contexts';

const MusicController = () => {
  const { inGameMode, isMusicMuted, setIsMusicMuted } = useContext(GameContext);
  const handleUnmute = () => {
    isMusicMuted ? setIsMusicMuted(false) : setIsMusicMuted(true);
  };
  const [platform, setPlatform] = useState('web');

  const MUSIC_ON_BTN_STYLE = {
    size: 48,
    icon: 'musicOn',
    iconStyle: {
      size: 24,
      color: 'white',
      hoverColor: 'white',
    },
  };

  const MUSIC_OFF_BTN_STYLE = {
    size: 48,
    disabled: false,
    icon: 'musicOff',
    iconStyle: {
      size: 38,
      color: 'purple',
      hoverColor: 'purple',
    },
  };

  useEffect(() => {
    setPlatform(Capacitor.getPlatform());
  }, []);

  return (
    <>
      {inGameMode === 0 && (
        <BtnWrapper $platform={platform}>
          <RoundBtn
            btnStyle={isMusicMuted ? MUSIC_OFF_BTN_STYLE : MUSIC_ON_BTN_STYLE}
            onClickHandler={handleUnmute}
          />
        </BtnWrapper>
      )}
      <BackgroundMusic />
      <MissionSoundEffects />
      <RoundSoundEffect />
      <FailedSoundEffect />
    </>
  );
};

export default MusicController;

const BtnWrapper = styled.div`
  z-index: 400;
  position: fixed;
  top: ${({ $platform }) => ($platform === 'ios' ? '175px' : '125px')};
  right: 40px;
`;

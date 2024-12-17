import React, { useRef, useContext, useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';

import styled from 'styled-components';
import { MissionStarting, MissionEnding } from '../components';
import { OpenViduContext, GameContext, UserContext } from '../../../contexts';

import useSpeechToText from '../MissionEstimators/useSpeechToText';

const Affirmation = () => {
  const {
    isGameScoreSent,
    sendMyGameScore,
    isMissionStarting,
    isMissionEnding,
    inGameMode,
    setMyMissionStatus,
  } = useContext(GameContext);
  const { myVideoRef } = useContext(OpenViduContext);
  const user = useContext(UserContext);
  const affirmationText = user.myData.affirmation || '';
  const [highlightedText, setHighlightedText] = useState('');
  const { transcript, stop } = useSpeechToText(7);
  const [affirResult, setAffirResult] = useState(false);
  const newTranscriptRef = useRef('');
  const idx = useRef(0);
  const isNative = Capacitor.isNativePlatform();

  useEffect(() => {
    if (inGameMode === 6) {
      if (isGameScoreSent) return;
      sendMyGameScore();
    } else return;
  }, [isGameScoreSent]);

  // 인식된 텍스트와 원본 문구 비교 및 강조
  useEffect(() => {
    if (inGameMode !== 6 || !myVideoRef.current || isMissionStarting) {
      return;
    }

    if (affirResult) {
      return;
    }
    // 비교할 값이 있을 때만 동작
    if (transcript) {
      for (let j = 0; j < transcript.length; j++) {
        if (affirmationText[idx.current] === transcript[j]) {
          idx.current += 1;
          newTranscriptRef.current += transcript[j]; //새로운 배열에 값 추가
        }
      }

      const highlighted = (
        <Highlight>
          <Highlighted>{affirmationText.substring(0, idx.current)}</Highlighted>
          <Unhighlighted>
            {affirmationText.substring(idx.current)}
          </Unhighlighted>
        </Highlight>
      );
      setHighlightedText(highlighted);

      if (newTranscriptRef.current.trim() === affirmationText.trim()) {
        stop(); // 음성 인식 중지
        setAffirResult(true); //  통과 상태로 설정
        setMyMissionStatus(true);
      }
    } else {
      setHighlightedText(<Highlight>{affirmationText}</Highlight>);
    }
  }, [transcript, affirmationText, affirResult, isMissionStarting]);

  return (
    <>
      <MissionStarting />
      {isMissionEnding && <MissionEnding />}
      {isMissionStarting || (
        <Wrapper>
          <TextArea>
            {isNative ? (
              <>
                <Description>큰 소리로 외쳐주세요!</Description>
                <NativeAffirmation>{affirmationText}</NativeAffirmation>
              </>
            ) : (
              highlightedText
            )}
          </TextArea>
        </Wrapper>
      )}
    </>
  );
};

export default Affirmation;

const Wrapper = styled.div`
  z-index: 200;

  position: absolute;

  width: 100%;
  height: 100%;
`;

const TextArea = styled.div`
  position: absolute;
  bottom: 3px;
  left: 3px;

  gap: 20px;

  ${({ theme }) => theme.flex.center}

  flex-direction: column;
  width: calc(100% - 6px);
  height: 30%;
  padding: 15px;

  ${({ theme }) => theme.fonts.IBMLarge}
  font-size: 25px;
  font-weight: bold;
  text-align: center;
  line-height: 35px;

  background-color: ${({ theme }) => theme.colors.translucent.navy};

  border-radius: 0 0 ${({ theme }) => theme.radius.medium}
    ${({ theme }) => theme.radius.medium};
`;

const Highlight = styled.span`
  color: grey;
`;

const Highlighted = styled.b`
  color: ${({ theme }) => theme.colors.primary.emerald};
`;

const Unhighlighted = styled.b`
  color: grey;
`;

const Description = styled.b`
  ${({ theme }) => theme.fonts.IBMmedium};
  color: ${({ theme }) => theme.colors.primary.white};
`;

const NativeAffirmation = styled.b`
  ${({ theme }) => theme.fonts.JuaSmall};
  color: ${({ theme }) => theme.colors.primary.emerald};
`;

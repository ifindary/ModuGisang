import React, { useRef, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AccountContext,
  GameContext,
  MediaPipeContext,
  OpenViduContext,
} from '../../../contexts';
import { LoadingWithText, WarmUpModel } from '../../../components';
import useTimeoutEffect from '../../../hooks/useTimeoutEffect';

import { faceIcon, stretchingIcon } from '../../../assets/icons';
import backgroundImage from '../../../assets/backgroundImage.png';
import styled from 'styled-components';

const LOADING_STATUS = {
  loadMyModel: (
    <>
      <p>게임에 필요한 AI를</p>
      <p> 준비중이에요</p>
    </>
  ),
  waitingMates: '친구들을 기다리는 중이에요',
};

const MODEL_ICONS = [stretchingIcon, faceIcon];
const INSTRUCTIONS = ['모션인식 AI', '안면인식 AI'];
const TIME_LIMIT = 17000;

const LoadModel = () => {
  const navigate = useNavigate();
  const { userId: myId } = useContext(AccountContext);
  const {
    isPoseLoaded,
    isPoseInitialized,
    isHolisticLoaded,
    isHolisticInitialized,
    isWarmUpDone,
    poseModel,
    holisticModel,
    setIsPoseLoaded,
    setIsPoseInitialized,
    setIsHolisticLoaded,
    setIsHolisticInitialized,
    setIsWarmUpDone,
  } = useContext(MediaPipeContext);
  const {
    sendModelLoadingStart,
    sendMyReadyStatus,
    mateStreams,
    micOn,
    turnMicOnOff,
    videoSession,

    myStream,
    myVideoRef,
  } = useContext(OpenViduContext);
  const { matesReadyStatus, startFirstMission } = useContext(GameContext);
  const [loadingMode, setLoadingMode] = useState('loadMyModel');
  const [loadedModel, setLoadedModel] = useState({
    0: false,
    1: false,
  });
  const [loadedStates, setLoadedStates] = useState({
    poseLoaded: false,
    poseInitialized: false,
    holisticLoaded: false,
    holisticInitialized: false,
  });
  const [mateList, setMateList] = useState([]);
  const progressRef = useRef(0);

  const loadModelWithTimeLimit = useTimeoutEffect({
    effect: async () => {
      if (isPoseLoaded && !loadedStates.poseLoaded) {
        progressRef.current += 25;
        setLoadedStates(prev => ({ ...prev, poseLoaded: true }));
      }
      if (isPoseInitialized && !loadedStates.poseInitialized) {
        progressRef.current += 25;
        setLoadedStates(prev => ({ ...prev, poseInitialized: true }));
        setLoadedModel(prev => ({ ...prev, 0: true }));
      }
      if (isHolisticLoaded && !loadedStates.holisticLoaded) {
        progressRef.current += 25;
        setLoadedStates(prev => ({ ...prev, holisticLoaded: true }));
      }
      if (isHolisticInitialized && !loadedStates.holisticInitialized) {
        setLoadedModel(prev => ({ ...prev, 1: true }));
        progressRef.current += 25;
        setLoadedStates(prev => ({ ...prev, holisticInitialized: true }));

        setLoadingMode('waitingMates');
      }
    },
    dependencies: [
      isPoseLoaded,
      isPoseInitialized,
      isHolisticLoaded,
      isHolisticInitialized,
      loadedStates,
    ],
    timeout: TIME_LIMIT,
    errorMSG: 'Model Loading Timeout',
  });

  const exitFromGame = () => {
    if (myVideoRef.current) {
      if (myStream instanceof MediaStream) {
        myStream?.getTracks()?.forEach(track => track?.stop());
        myVideoRef.current.srcObject = null;
      }
    }

    if (videoSession) {
      console.log('===DISCONNECTING FROM VIDEO SESSION===');
      videoSession?.off('streamCreated');
      videoSession?.disconnect();
    }

    poseModel.current = null;
    holisticModel.current = null;
    setIsPoseLoaded(false);
    setIsPoseInitialized(false);
    setIsHolisticLoaded(false);
    setIsHolisticInitialized(false);
    setIsWarmUpDone(false);

    alert(
      '네트워크 또는 기기 사양의 문제로 AI 모델 로딩에 실패했습니다. 게임을 종료합니다.',
    );

    navigate('/main');
  };

  useEffect(() => {
    if (micOn) {
      turnMicOnOff();
    }
    sendModelLoadingStart();
  }, []);

  useEffect(() => {
    if (isWarmUpDone) {
      const currentMates = mateStreams
        .map(mate => ({
          userId: parseInt(JSON.parse(mate.stream.connection.data).userId),
          userName: JSON.parse(mate.stream.connection.data).userName,
          ready:
            matesReadyStatus?.[
              parseInt(JSON.parse(mate.stream.connection.data).userId)
            ]?.ready || false,
        }))
        .filter(mate => mate.userId !== myId);

      setMateList(currentMates);

      // 모든 현재 접속자가 ready 상태인지 확인
      const allReady =
        currentMates.length > 0 &&
        currentMates.every(mate => matesReadyStatus?.[mate.userId]?.ready);

      // 프로그레스바 업데이트
      const readyCount = currentMates.filter(
        mate => matesReadyStatus?.[mate.userId]?.ready,
      ).length;
      progressRef.current = currentMates.length
        ? (readyCount / currentMates.length) * 100
        : 100;

      // 모두 준비되었다면 게임 시작
      if (allReady) {
        setTimeout(() => {
          progressRef.current = 0;
          startFirstMission();
          if (!micOn) {
            turnMicOnOff();
          }
        }, 2000);
      }
    }
  }, [mateStreams, matesReadyStatus, isWarmUpDone]);

  // 타임아웃 처리
  useEffect(() => {
    if (loadModelWithTimeLimit.timeout) {
      exitFromGame();
      console.error(
        `====ERROR occurred during load model: ${loadModelWithTimeLimit.error}====`,
      );
    }
  }, [loadModelWithTimeLimit]);

  useEffect(() => {
    if (isWarmUpDone) {
      sendMyReadyStatus();
    }
  }, [isWarmUpDone]);

  return (
    <Wrapper>
      <LoadingWithText loadingMSG={LOADING_STATUS[loadingMode]} />
      <ProgressBar>
        <ProgressWrapper>
          <ProgressIndicator $progress={progressRef.current} />
        </ProgressWrapper>
      </ProgressBar>
      {loadingMode === 'loadMyModel' &&
        INSTRUCTIONS.map((instructions, idx) => (
          <Introduction key={idx}>
            <StatusIcon $isLoaded={loadedModel[idx]} />
            <Instruction $isLoaded={loadedModel[idx]}>
              <Image src={MODEL_ICONS[idx]} $isLoaded={loadedModel[idx]} />
              {instructions}
            </Instruction>
          </Introduction>
        ))}
      {loadingMode === 'waitingMates' &&
        mateList.map(({ userId, userName }, idx) => (
          <Introduction key={idx}>
            <StatusIcon $isLoaded={matesReadyStatus[userId]?.ready} />
            <Instruction $isLoaded={matesReadyStatus[userId]?.ready}>
              {userName}
            </Instruction>
          </Introduction>
        ))}
      <WarmUpModel />
    </Wrapper>
  );
};

export default LoadModel;

const Wrapper = styled.div`
  z-index: 1000;
  position: fixed;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;

  padding: 30px;

  ${({ theme }) => theme.flex.center};
  flex-direction: column;

  background-image: url(${backgroundImage});
  background-size: cover;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 30px;

  margin: 30px 0 20px 0;
`;

const ProgressWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 30px;

  border-radius: ${({ theme }) => theme.radius.small};
  border: 2px solid ${({ theme }) => theme.colors.primary.white};
  background-color: ${({ theme }) => theme.colors.translucent.navy};
`;

const ProgressIndicator = styled.div`
  position: absolute;
  top: 0;

  width: ${({ $progress }) => $progress}%;
  height: 100%;

  border-radius: ${({ theme }) => theme.radius.small};

  background-color: ${({ theme }) => theme.colors.primary.emerald};
  transition: width 0.2s ease;
`;

const Introduction = styled.div`
  ${({ theme }) => theme.flex.left};
  align-items: center;

  margin-bottom: 10px;
`;

const StatusIcon = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 8px;

  background-color: ${({ $isLoaded, theme }) =>
    $isLoaded ? theme.colors.primary.emerald : theme.colors.system.red};
  opacity: ${({ $isLoaded }) => ($isLoaded ? 1 : 0.5)};
`;

const Image = styled.img`
  width: 16px;
  height: 16px;
  margin-right: 6px;
  opacity: ${({ $isLoaded }) => ($isLoaded ? 1 : 0.5)};
`;

const Instruction = styled.p`
  ${({ theme }) => theme.fonts.IBMMedium};
  color: ${({ $isLoaded, theme }) =>
    $isLoaded ? theme.colors.primary.white : theme.colors.neutral.gray};

  text-align: center;
  margin-bottom: 2px;
`;

// useEffect(() => {
//   if (isPoseLoaded && !loadedStates.poseLoaded) {
//     progressRef.current += 25;
//     setLoadedStates(prev => ({ ...prev, poseLoaded: true }));
//   }
//   if (isPoseInitialized && !loadedStates.poseInitialized) {
//     progressRef.current += 25;
//     setLoadedStates(prev => ({ ...prev, poseInitialized: true }));
//     setLoadedModel(prev => ({ ...prev, 0: true }));
//   }
//   if (isHolisticLoaded && !loadedStates.holisticLoaded) {
//     progressRef.current += 25;
//     setLoadedStates(prev => ({ ...prev, holisticLoaded: true }));
//   }
//   if (isHolisticInitialized && !loadedStates.holisticInitialized) {
//     setLoadedModel(prev => ({ ...prev, 1: true }));
//     progressRef.current += 25;
//     setLoadedStates(prev => ({ ...prev, holisticInitialized: true }));

//     setLoadingMode('waitingMates');
//     setTimeout(() => {
//       progressRef.current = 0;
//     }, 2000);
//   }
// }, [
//   isPoseLoaded,
//   isPoseInitialized,
//   isHolisticLoaded,
//   isHolisticInitialized,
//   loadedStates,
// ]);

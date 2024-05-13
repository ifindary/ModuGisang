import React, { useEffect, useRef, useContext, useState } from 'react';
import {
  MediaPipeContext,
  GameContext,
  OpenViduContext,
} from '../../../contexts';

// import * as face from '@mediapipe/face_mesh';
import { MissionStarting } from '../components';

import { estimateFace } from '../MissionEstimators/FaceEstimator';
import styled, { keyframes } from 'styled-components';
import stickyNoteImage from '../../../assets/sticky_note.png';
import { RoundSoundEffect } from '../Sound/RoundSoundEffect';

const Mission2 = () => {
  const [postitPositions, setPostitPositions] = useState([
    {
      // 이마
      top: 0, // y 좌표
      left: 0, // x 좌표
      size: 0, // width, height
      shouldFall: false, // 포스트잇이 떨어졌는지 여부
      scorePoint: 9, // 더할 점수. 이마는 상대적으로 떼기 어려워서 추가 점수 있음
    },
    {
      // 왼쪽 볼
      top: 0,
      left: 0,
      size: 0,
      shouldFall: false,
      scorePoint: 8,
    },
    {
      // 오른쪽 볼
      top: 0,
      left: 0,
      size: 0,
      shouldFall: false,
      scorePoint: 8,
    },
  ]); // 포스트잇의 정보

  const { holisticModel } = useContext(MediaPipeContext);
  const {
    isMissionStarting,
    inGameMode,
    myMissionStatus,
    setMyMissionStatus,
    gameScore,
    setGameScore,
  } = useContext(GameContext);
  const { myVideoRef } = useContext(OpenViduContext);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (
      inGameMode !== 2 ||
      !myVideoRef.current ||
      !holisticModel.current ||
      isMissionStarting
    )
      return;

    const videoElement = myVideoRef.current;

    holisticModel.current.onResults(results => {
      const missionStatus = estimateFace({ results, myVideoRef, canvasRef });

      // missionStatus가 모두 true면
      if (
        missionStatus &&
        missionStatus.every(status => status === true) &&
        missionStatus.every(shouldFall => shouldFall === true)
      ) {
        setMyMissionStatus(true);
      }
      if (results.faceLandmarks && !myMissionStatus) {
        missionStatus?.forEach((status, index) => {
          if (!status) {
            const newPostitPosition = calculatePostitPosition(
              results.faceLandmarks,
              index === 0 ? 107 : index === 1 ? 205 : 425, // 각 포스트잇의 위치 계산(0: 이마, 1: 왼쪽 볼, 2: 오른쪽 볼)
            );
            setPostitPositions(prevPositions => {
              const updatedPositions = [...prevPositions];
              updatedPositions[index] = {
                ...newPostitPosition,
              };
              return updatedPositions;
            });
          } else {
            setPostitPositions(prevPositions => {
              const updatedPositions = [...prevPositions];

              // 점수 갱신
              if (!updatedPositions[index].shouldFall) {
                setGameScore(
                  prevScore => prevScore + updatedPositions[index].scorePoint,
                );
                // 포스트잇 떨어지도록 인자 변경
                updatedPositions[index] = {
                  ...prevPositions[index],
                  shouldFall: true,
                };
                RoundSoundEffect();
              }
              return updatedPositions;
            });
          }
        });
      }
    });

    const handleCanPlay = () => {
      if (holisticModel.current !== null) {
        holisticModel.current.send({ image: videoElement }).then(() => {
          requestAnimationFrame(handleCanPlay);
        });
      }
    };

    if (videoElement.readyState >= 3) {
      handleCanPlay();
    } else {
      videoElement.addEventListener('canplay', handleCanPlay);
    }

    return () => {
      videoElement.removeEventListener('canplay', handleCanPlay);
      holisticModel.current = null;
    };
  }, [isMissionStarting, holisticModel]);

  // 포스트잇의 위치와 크기를 계산하는 함수
  const calculatePostitPosition = (landmarks, index) => {
    // 현재 윈도우의 크기
    const winWidth = window.innerWidth;
    const winHeight = window.innerHeight;

    // 얼굴 크기 계산
    // 왼쪽 끝점과 오른쪽 끝점의 x 좌표 차이를 얼굴 너비로 사용
    // 그 후 canvas와의 크기를 고려하여 비율 조정
    const faceWidth =
      Math.abs(landmarks[123].x - landmarks[352].x) *
      myVideoRef.current.videoWidth *
      (window.innerHeight / myVideoRef.current.videoHeight);

    // 얼굴 너비랑 비례에서 포스트잇 크기 조절
    const resizedSize = faceWidth * 0.33;

    // 포스트잇을 붙일 랜드마크의 좌표
    const point = landmarks[index];
    let { x, y } = point;

    // 랜드마크의 비율을 캔버스의 픽셀 값으로 변환
    const temp =
      (winHeight / myVideoRef.current.videoHeight) *
      myVideoRef.current.videoWidth;

    x *= temp;
    y *= winHeight;

    // 포스트잇의 중앙 좌표 계산 (포스트잇이 얼굴의 중앙에 위치하도록)
    const drawX = x - resizedSize / 2 - (temp - winWidth) / 2;
    const drawY = y - resizedSize / 2;

    // 포스트잇의 위치 및 크기 정보 반환
    return {
      top: drawY,
      left: drawX,
      size: resizedSize,
      scorePoint: index === 107 ? 9 : 8, // 이마는 9점, 볼은 8점
    };
  };

  return (
    <>
      <MissionStarting />
      {isMissionStarting || <Canvas ref={canvasRef} />}
      {postitPositions.map((position, index) => (
        <PostitAnimation
          key={index}
          top={position.top}
          left={position.left}
          size={position.size}
          imageUrl={stickyNoteImage}
          shouldFall={position?.shouldFall}
        />
      ))}
    </>
  );
};

export default Mission2;

const Canvas = styled.canvas`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  object-fit: cover;
`;

const PostitFallAnimation = keyframes`
  0% {
    transform: translateY(0);
    opacity: 1;
  }
  100% {
    transform: translateY(100%);
    opacity: 0;
  }
`;

const PostitAnimation = styled.div`
  position: fixed;
  top: ${props => props.top}px;
  left: ${props => props.left}px;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  background-image: url(${props => props.imageUrl});
  background-size: cover;
  animation: ${props => (props.shouldFall ? PostitFallAnimation : 'none')} 1s
    ease-out forwards;
`;

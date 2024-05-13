import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const ProgressBar = ({ loadingMSG }) => {
  const [progress, setProgress] = useState(0);

  // 로딩 상태가 변경될 때마다 프로그레스 바 업데이트
  useEffect(() => {
    const interval = setInterval(() => {
      // 예시: 1초마다 프로그레스를 증가시킴
      setProgress(prevProgress => {
        if (prevProgress < 100) {
          return prevProgress + 10;
        } else {
          clearInterval(interval);
          return 100;
        }
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <Wrapper>
      <Text>{loadingMSG}</Text>
      <ProgressBarWrapper>
        <StyledProgressBar value={progress} max="100" />
      </ProgressBarWrapper>
    </Wrapper>
  );
};

export default ProgressBar;

const Wrapper = styled.div`
  width: 100vw;
  height: 100vh;
  ${({ theme }) => theme.flex.center}/* margin: auto; */
`;

const Text = styled.span`
  ${({ theme }) => theme.fonts.IBMsmall}
  color: ${({ theme }) => theme.colors.white};
  /* margin-left: 10px; */
`;

const ProgressBarWrapper = styled.div`
  width: 297px;
  height: 29px;
  /* flex-shrink: 0; */
  background-color: ${({ theme }) => theme.colors.navy};
`;

const StyledProgressBar = styled.progress`
  width: 100%;
  height: 100%;
  border-radius: 12px;
  background-color: ${({ theme }) => theme.gradient.onlyEmerald};
  appearance: none;
`;

import React, { useContext } from 'react';

import { ChallengeContext } from '../../../contexts';
import styled from 'styled-components';

const ChallengeContent = () => {
  const { challengeData } = useContext(ChallengeContext);
  const { duration, wakeTime, mates } = challengeData;
  return (
    <Wrapper>
      <LeftArea>
        챌린지 완료까지
        <BigLetter>D-{duration}</BigLetter>
        <SmallLetter>남았습니다</SmallLetter>
      </LeftArea>
      <RightArea>
        <p>기상시간: {wakeTime?.split(':')?.slice(0, 2)?.join(':')}</p>
        {mates?.map(mate => (
          <SmallLetter key={mate.userId}>{mate.userName}</SmallLetter>
        ))}
      </RightArea>
    </Wrapper>
  );
};

export default ChallengeContent;

const Wrapper = styled.div`
  ${({ theme }) => theme.flex.between}
  padding: 20px;
`;

const RightArea = styled.div`
  ${({ theme }) => theme.flex.left}
  flex-direction: column;
  gap: 5px;
`;

const LeftArea = styled.div`
  ${({ theme }) => theme.flex.right}
  flex-direction: column;
`;

const BigLetter = styled.span`
  font: 700 24px 'Jua';
  color: ${({ theme }) => theme.colors.primary.emerald};
`;

const SmallLetter = styled.span`
  ${({ theme }) => theme.fonts.IBMsmall}
`;

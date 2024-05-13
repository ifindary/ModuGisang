import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from '../../../contexts/UserContext';
import {
  level0,
  // level1,
  // level2,
  // level3,
  // level4,
} from '../../../assets/streakLevels';
import styled from 'styled-components';

const StreakContent = () => {
  const [level, setLevel] = useState('streak0');
  const { userData } = useContext(UserContext);
  const { streakDays, medals } = userData;
  // calculate user streak level by user streakDays

  const getStreakLevel = streakDays => {
    if (streakDays === 0) {
      return 'streak0';
    } else if (streakDays >= 1 && streakDays <= 30) {
      return 'streak1';
    } else if (streakDays >= 31 && streakDays <= 60) {
      return 'streak2';
    } else if (streakDays >= 61 && streakDays <= 90) {
      return 'streak3';
    } else if (streakDays >= 91) {
      return 'streak4';
    }
  };

  const STREAK_LEVEL_ICON = {
    streak0: level0,
    // streak1: level1,
    // streak2: level2,
    // streak3: level3,
    // streak4: level4,
  };

  // useEffect(() => {
  //   setLevel(getStreakLevel(streakDays));
  // }, [userData]);

  return (
    <Wrapper>
      <LevelIcon src={STREAK_LEVEL_ICON[level]} />
      <RightArea>
        <SmallLetter>미라클 모닝</SmallLetter>
        <BigLetter>{streakDays}일 차</BigLetter>
      </RightArea>
    </Wrapper>
  );
};

export default StreakContent;

const Wrapper = styled.div`
  ${({ theme }) => theme.flex.between}
  width: 100%;
  height: 120px;

  padding: 24px;
`;

const LevelIcon = styled.img`
  width: 80px;
  height: 80px;
`;

const RightArea = styled.div`
  ${({ theme }) => theme.flex.left}
  flex-direction: column;
`;

const BigLetter = styled.span`
  font: 700 24px 'Jua';
  color: ${({ theme }) => theme.colors.primary.emerald};
`;

const SmallLetter = styled.span`
  ${({ theme }) => theme.fonts.IBMsmall}
`;

import React, { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext, ChallengeContext, AccountContext } from '../../contexts';
import { NavBar, OutlineBox, LoadingWithText } from '../../components';
import {
  StreakContent,
  InvitationsContent,
  ChallengeContent,
} from './cardComponents';
import BottomFixContent from './cardComponents/BottomFixContent';
import { CARD_TYPES, CARD_STYLES } from './DATA';

import styled from 'styled-components';
import * as S from '../../styles/common';

const Main = () => {
  const navigate = useNavigate();

  const { accessToken, userId } = useContext(AccountContext);
  const { challengeId, getMyData } = useContext(UserContext);
  const { challengeData } = useContext(ChallengeContext);

  const hasChallenge = Number(challengeId) !== -1;

  const CARD_CONTENTS = {
    streak: <StreakContent />,
    invitations: <InvitationsContent />,
    challenge: <ChallengeContent challenges={challengeData} />,
  };

  const CARD_ON_CLICK_HANDLERS = {
    streak: () => navigate('/myStreak'),
    invitations: () => {
      // 초대받은 challenge 존재 여부에 따라 분기처리
      navigate('/joinChallenge');
    },
    challenge: null,
  };

  useEffect(() => {
    if (accessToken && userId) {
      getMyData();
    }
  }, [challengeData]);

  if (!userId || !challengeData)
    return (
      <S.LoadingWrapper>
        <LoadingWithText loadingMSG="챌린지 데이터를 가져오고 있어요" />
      </S.LoadingWrapper>
    );
  return (
    <>
      <NavBar />
      <S.PageWrapper>
        <CardsWrapper>
          {CARD_TYPES[hasChallenge ? 'hasChallenge' : 'noChallenge'].map(
            type => (
              <OutlineBox
                key={type}
                content={CARD_CONTENTS[type]}
                onClickHandler={CARD_ON_CLICK_HANDLERS[type]}
                boxStyle={CARD_STYLES[type]}
              />
            ),
          )}
        </CardsWrapper>
        <BottomFixContent />
      </S.PageWrapper>
    </>
  );
};

export default Main;

const CardsWrapper = styled.div`
  width: 100%;
  height: 100%;
  flex-grow: 1;
  overflow-y: auto;
  ${({ theme }) => theme.flex.center}
  flex-direction: column;
  gap: 20px;
  padding-bottom: 239px;
`;

import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  NavBar,
  LongBtn,
  CustomRadio,
  InvitationCard,
  LoadingWithText,
} from '../../components';
import { AccountContext, ChallengeContext } from '../../contexts';
import { challengeServices } from '../../apis';
import useFetch from '../../hooks/useFetch';

import * as S from '../../styles/common';
import styled from 'styled-components';

const JoinChallenge = () => {
  const navigate = useNavigate();
  const [invitations, setInvitations] = useState([]);
  const [isInvitationLoading, setIsInvitationLoading] = useState(true);
  const [isAcceptSent, setIsAccetpSent] = useState(false);
  const [isAcceptInviLoading, setIsAcceptInviLoading] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);

  const { accessToken, userId } = useContext(AccountContext);
  const { handleAcceptInvitation } = useContext(ChallengeContext);
  const { fetchData } = useFetch();

  const handleRadioChange = e => {
    setCurrentIdx(Number(e.target.value));
  };

  const cards = invitations.map((invitation, index) => ({
    label: <InvitationCard invitation={invitation} key={index} />,
    value: index,
  }));

  const getInvitations = async () => {
    setIsInvitationLoading(true);
    const response = await fetchData(() =>
      challengeServices.getInvitationInfo({ accessToken, userId }),
    );
    const { data: invitationData, error: invitationError } = response;
    if (invitationData) {
      setInvitations(invitationData);
    } else if (invitationError) {
      console.error(invitationError);
      setInvitations([]);
    }
    setIsInvitationLoading(false);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (invitations.length === 0) {
      alert('승낙할 수 없습니다.');
      return;
    }

    const response = await handleAcceptInvitation({
      accessToken,
      challengeId: invitations[currentIdx].challengeId,
      userId,
      setIsAcceptInviLoading,
    });

    const {
      isLoading: isAcceptInviLoading,
      data: acceptInviData,
      error: acceptInviError,
    } = response;

    if (!isAcceptInviLoading && acceptInviData) {
      alert(`${invitations[currentIdx].userName}의 챌린지에 참여했습니다.`);
      // navigate('/main');
    } else if (!isAcceptInviLoading && acceptInviError) {
      alert(acceptInviError);
      // setIsAcceptInviLoading(false);
    }
    getInvitations();
  };

  useEffect(() => {
    getInvitations();
  }, []);

  // useEffect(() => {
  //   if (isAcceptSent && !isAcceptInviLoading) {

  //     // window.location.reload();
  //   } else return;
  // }, [isAcceptSent, isAcceptInviLoading]);

  if (isInvitationLoading)
    return (
      <>
        <NavBar />
        <S.LoadingWrapper>
          <LoadingWithText loadingMSG="초대받은 챌린지를 가져오고 있어요" />
        </S.LoadingWrapper>
      </>
    );

  return (
    <>
      <NavBar />
      <S.PageWrapper>
        {isAcceptSent && isAcceptInviLoading ? (
          <S.LoadingWrapper>
            <LoadingWithText loadingMSG="초대를 승낙하고 있어요" />
          </S.LoadingWrapper>
        ) : (
          <>
            <CustomRadio
              name="invitations"
              content={cards}
              onChange={handleRadioChange}
              selectedValue={currentIdx}
            />
            <LongBtn
              type="submit"
              btnName="초대 승낙"
              onClickHandler={handleSubmit}
            />
          </>
        )}
      </S.PageWrapper>
    </>
  );
};

export default JoinChallenge;

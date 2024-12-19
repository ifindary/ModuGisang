import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { challengeServices } from '../apis/challengeServices';
import useFetch from '../hooks/useFetch';
import useHandleError from '../hooks/useHandleError';

import { AccountContext, UserContext } from './';

const ChallengeContext = createContext();

const ChallengeContextProvider = ({ children }) => {
  const { userId, accessToken } = useContext(AccountContext);
  const { challengeId, getMyData } = useContext(UserContext);
  const { fetchData } = useFetch();
  const navigate = useNavigate();
  const handleError = useHandleError();

  const [challengeData, setChallengeData] = useState({
    // challengeId: 6,
    // startDate: '2021-09-01T00:00:00.000Z',
    // endDate: '2021-09-08T00:00:00.000Z',
    // wakeTime: '17:30',
    // duration: 7,
    // mates: [
    //   { userId: 1, userName: '천사박경원' },
    //   { userId: 2, userName: '귀요미이시현' },
    //   { userId: 3, userName: '깜찍이이재원' },
    //   { userId: 4, userName: '상큼이금도현' },
    //   { userId: 5, userName: '똑똑이연선애' },
    // ],
  });
  const [isAttended, setIsAttended] = useState(false);
  const [isChallengeStarted, setIsChallengeStarted] = useState(false);

  const getChallengeData = async () => {
    const response = await fetchData(() =>
      challengeServices.getChallengeInfo({
        accessToken,
        challengeId: challengeId,
      }),
    );

    const {
      isLoading: isChallengeDataLoading,
      data: userChallengeData,
      error: challengeDataError,
    } = response;

    if (!isChallengeDataLoading && userChallengeData) {
      setChallengeData(userChallengeData);
    } else if (!isChallengeDataLoading && challengeDataError) {
      console.error(challengeDataError);
    }
  };

  const handleCreateChallenge = async ({ newChallengeData }) => {
    const response = await fetchData(() =>
      challengeServices.createChallenge({
        accessToken,
        newChallengeData,
      }),
    );

    const {
      isLoading: isCreateChallengeLoading,
      data: createChallengeData,
      error: createChallengeError,
      message: createChallengeMessage,
      status: createChallengeStatus,
    } = response;

    if (!isCreateChallengeLoading && createChallengeData) {
      console.log(response);
      alert('챌린지가 생성되었습니다.');
      navigate('/main');
    } else if (!isCreateChallengeLoading && createChallengeError) {
      handleError(createChallengeMessage, createChallengeStatus);
    }

    return response;
  };

  const handleEditChallenge = async ({ newChallengeData }) => {
    const response = await fetchData(() =>
      challengeServices.editChallenge({
        accessToken,
        challengeId,
        newChallengeData,
      }),
    );

    const {
      isLoading: isEditChallengeLoading,
      data: editChallengeData,
      error: editChallengeError,
      status: editChallengeStatus,
      message: editChallengeMessage,
    } = response;

    if (!isEditChallengeLoading && editChallengeData) {
      console.log(response);
      alert('챌린지가 수정되었습니다.');
      navigate('/main');
    } else if (!isEditChallengeLoading && editChallengeError) {
      handleError(editChallengeMessage, editChallengeStatus);
      window.location.reload();
    }
    return response;
  };

  const handleGiveUpChallenge = async () => {
    const response = await fetchData(() =>
      challengeServices.giveupChallenge({
        accessToken,
        challengeId,
        userId,
      }),
    );

    const {
      isLoading: isGiveUpChallengeLoading,
      data: giveUpChallengeData,
      error: giveUpChallengeError,
      message: giveUpChallengeMessage,
      status: giveUpChallengeStatus,
    } = response;

    if (!isGiveUpChallengeLoading && giveUpChallengeData) {
      console.log(response);
      console.log(giveUpChallengeData);
    } else if (!isGiveUpChallengeLoading && giveUpChallengeError) {
      handleError(giveUpChallengeMessage, giveUpChallengeStatus);
    } else {
      console.log(response);
    }
    return response;
  };

  const handleGiveUpBeforeChallenge = async () => {
    const response = await fetchData(() =>
      challengeServices.giveupBeforChallenge({
        accessToken,
        challengeId,
        userId,
      }),
    );

    const {
      isLoading: isGiveUpBeforChallengeLoading,
      data: giveUpBeforeChallengeData,
      error: giveUpBeforeChallengeError,
      message: giveUpBeforeChallengeMessage,
      status: giveUpBeforeChallengeStatus,
    } = response;

    if (!isGiveUpBeforChallengeLoading && giveUpBeforeChallengeData) {
      console.log(response);
      alert('챌린지 포기에 성공하였습니다.');
      window.location.reload();
    } else if (!isGiveUpBeforChallengeLoading && giveUpBeforeChallengeError) {
      console.error(giveUpBeforeChallengeError);
      handleError(giveUpBeforeChallengeMessage, giveUpBeforeChallengeStatus);
    } else {
      console.log(response);
    }
    return response;
  };

  const handleAcceptInvitation = async ({
    accessToken,
    challengeId,
    userId,
    setIsAcceptInviLoading,
  }) => {
    setIsAcceptInviLoading(true);
    const response = await fetchData(() =>
      challengeServices.acceptInvitation({
        accessToken,
        challengeId: challengeId,
        userId,
      }),
    );

    const {
      isLoading: isAcceptInviLoading,
      data: acceptInviData,
      error: acceptInviError,
    } = response;

    if (!isAcceptInviLoading && acceptInviData) {
      setIsAcceptInviLoading(false);
    } else if (!isAcceptInviLoading && acceptInviError) {
      console.error(acceptInviError);
      setIsAcceptInviLoading(false);
    }
  };

  const getTodayChallengeData = async () => {
    const response = await fetchData(() =>
      challengeServices.getCalendarInfoByDate({
        accessToken,
        userId: userId,
        date: new Date().toISOString().split('T')[0],
        // date: '2024-05-23',
      }),
    );

    const {
      isLoading: isTodayChallengeDataLoading,
      data: todayChallengeData,
      error: todayChallengeDataError,
    } = response;

    if (!isTodayChallengeDataLoading && todayChallengeData) {
      console.log(response);
      setIsAttended(true);
    } else if (!isTodayChallengeDataLoading && todayChallengeDataError) {
      console.log(response);
      // handleError(
      //   todayChallengeDataError.message,
      //   todayChallengeDataError.status,
      // );
      // 에러 처리 추가
    }
  };

  const requestCompleteChallenge = async () => {
    const response = await fetchData(() =>
      challengeServices.completeChallenge({
        accessToken,
        challengeId,
        userId,
      }),
    );

    const {
      isLoading: isCompleteChallengeLoading,
      data: completeChallengeData,
      error: completeChallengeError,
    } = response;

    if (!isCompleteChallengeLoading && completeChallengeData) {
      if (completeChallengeData.completed) {
        getMyData();
      } else {
        console.warn(completeChallengeData.message);
      }
    } else if (!isCompleteChallengeLoading && completeChallengeError) {
      console.error(completeChallengeError);
    }
  };

  const isChallengeCompleted = () => {
    const endDateWithTime =
      challengeData?.endDate.split('T')[0] + 'T' + challengeData?.wakeTime;

    return new Date(endDateWithTime) < new Date();
  };

  useEffect(() => {
    if (challengeId !== null && challengeId !== -1 && userId) {
      getChallengeData();
    }
  }, [challengeId]);

  useEffect(() => {
    if (challengeId !== null && challengeId !== -1 && userId) {
      getTodayChallengeData();

      if (isChallengeCompleted()) {
        requestCompleteChallenge();
      }
    }
  }, [challengeData]);

  useEffect(() => {
    if (challengeData?.startDate) {
      const startDate = new Date(
        new Date(challengeData.startDate).getFullYear(),
        new Date(challengeData.startDate).getMonth(),
        new Date(challengeData.startDate).getDate(),
      );

      const today = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        new Date().getDate(),
      );

      setIsChallengeStarted(today >= startDate);
    }
  }, [challengeData]);

  return (
    <ChallengeContext.Provider
      value={{
        challengeData,
        isAttended,
        isChallengeStarted,

        setChallengeData,

        setIsChallengeStarted,
        getChallengeData,
        handleCreateChallenge,
        handleGiveUpBeforeChallenge,
        handleGiveUpChallenge,
        handleEditChallenge,
        handleAcceptInvitation,
      }}
    >
      {children}
    </ChallengeContext.Provider>
  );
};

export { ChallengeContext, ChallengeContextProvider };

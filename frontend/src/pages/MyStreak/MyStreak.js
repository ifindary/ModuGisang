import React, { useContext, useState, useEffect } from 'react';
import { NavBar, OutlineBox, LoadingWithText } from '../../components';
import { AccountContext, UserContext } from '../../contexts';
import { challengeServices } from '../../apis';
import { StreakContent } from '../Main/cardComponents';
import {
  MedalContent,
  CalendarContent,
  ChallengeHistoryContent,
} from './cardComponents';
import useFetch from '../../hooks/useFetch';
import dayjs from 'dayjs';

import * as S from '../../styles/common';
import styled from 'styled-components';
import { CARD_STYLES, FOOTER_STYLES, HEADER_STYLES } from './DATA';

const MyStreak = () => {
  const { fetchData } = useFetch();
  const { accessToken, userId } = useContext(AccountContext);
  const { myData } = useContext(UserContext);

  const [challengeDates, setChallengeDates] = useState([]);
  const [challengeHistory, setChallengeHistory] = useState([]);
  const [viewMonth, setViewMonth] = useState(new Date().getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isCalendarLoading, setIsCalendarLoading] = useState(true);
  const [isMedalLoading, setIsMedalLoading] = useState(true);

  const getCalendar = async () => {
    const response = await fetchData(() =>
      challengeServices.getCalendarInfo({
        accessToken,
        userId,
        month: viewMonth,
      }),
    );
    const {
      isLoading: isGetCalendarLoading,
      data: getCalendarData,
      error: getCalendarDataError,
    } = response;
    if (!isGetCalendarLoading && getCalendarData) {
      const calendarData = new Set(getCalendarData);
      setChallengeDates([...calendarData]);
    } else if (!isGetCalendarLoading && getCalendarDataError) {
      console.error(getCalendarDataError);
    }
  };

  const handleClickOnDate = async date => {
    const formattedDate = dayjs(date).format('YYYY-MM-DD');
    setSelectedDate(formattedDate);

    const response = await fetchData(() =>
      challengeServices.getCalendarInfoByDate({
        accessToken,
        userId: userId,
        date: formattedDate,
      }),
    );

    const {
      isLoading: isGetCalendarByDateLoading,
      data: getCalendarByDateData,
      error: getCalendarByDateError,
    } = response;
    if (!isGetCalendarByDateLoading && getCalendarByDateData) {
      console.log(response);
      setChallengeHistory(getCalendarByDateData);
    } else if (!isGetCalendarByDateLoading && getCalendarByDateError) {
      console.error(getCalendarByDateError);
      setChallengeHistory([]);
    }
  };

  const handleActiveStartDateChange = ({ activeStartDate, view }) => {
    if (view === 'month') {
      const newMonth = activeStartDate.getMonth() + 1;
      setViewMonth(newMonth);
    }
  };

  const formatDate = date => {
    const [year, month, day] = date.split('-');
    return `${year}년 ${parseInt(month, 10)}월 ${parseInt(day, 10)}일 기록`;
  };

  useEffect(() => {
    getCalendar();
  }, [viewMonth]);

  useEffect(() => {
    if (myData.medals) {
      setIsMedalLoading(false);
    }
  }, [myData]);

  useEffect(() => {
    if (myData.medals) {
      setIsCalendarLoading(false);
    }
  }, [myData]);

  return (
    <>
      <NavBar />
      <S.PageWrapper>
        <StreakCardWrapper
          content={
            <StreakContent
              userData={myData}
              isWaitingRoom={false}
              showMedals={false}
            />
          }
          boxStyle={CARD_STYLES.myStreak}
        />
        <ChallengeCardWrapper
          boxStyle={CARD_STYLES.myStreakChallenge}
          header={HEADER_STYLES.myStreakChallenge}
          content={
            isMedalLoading ? (
              <LoadingWrapper>
                <LoadingWithText />
              </LoadingWrapper>
            ) : (
              <MedalContent />
            )
          }
        />
        <CalendarCardWrapper
          content={
            isCalendarLoading ? (
              <LoadingWrapper>
                <LoadingWithText />
              </LoadingWrapper>
            ) : (
              <CalendarContent
                startDate={new Date()}
                handleDateChange={date => {
                  handleClickOnDate(date);
                }}
                challengeDates={challengeDates}
                handleActiveStartDateChange={handleActiveStartDateChange}
              />
            )
          }
          header={HEADER_STYLES.myStreakCalendar}
          boxStyle={CARD_STYLES.myStreakCalendar}
          footer={FOOTER_STYLES.myStreakCalendar}
          footerContent={
            selectedDate && (
              <>
                <SelectedDateText>{formatDate(selectedDate)}</SelectedDateText>
                <ChallengeHistoryContent
                  selectedDate={selectedDate}
                  history={challengeHistory}
                />
              </>
            )
          }
        />
      </S.PageWrapper>
    </>
  );
};

export default MyStreak;

const StreakCardWrapper = styled(OutlineBox)``;
const ChallengeCardWrapper = styled(OutlineBox)``;
const CalendarCardWrapper = styled(OutlineBox)``;

const SelectedDateText = styled.div`
  ${({ theme }) => theme.fonts.IBMmediumlargeBold}
  color: ${({ theme }) => theme.colors.primary.emerald};
`;

const LoadingWrapper = styled.div`
  ${({ theme }) => theme.flex.center};
  width: 100%;
  padding: 89px 0px;
`;

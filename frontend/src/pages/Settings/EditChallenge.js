import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  NavBar,
  LongBtn,
  TimePicker,
  OutlineBox,
  CustomRadio,
  CustomCalendar,
} from '../../components';
import useFetch from '../../hooks/useFetch';
import { AccountContext, ChallengeContext, UserContext } from '../../contexts';
import { challengeServices } from '../../apis/challengeServices';
import * as S from '../../styles/common';
import styled from 'styled-components';

const EditChallenge = () => {
  const navigate = useNavigate();
  const { fetchData } = useFetch();
  const [duration, setDuration] = useState(7);
  const [startDate, setStartDate] = useState(new Date());
  const [range, setRange] = useState([new Date(), new Date()]);
  const [wakeTime, setWakeTime] = useState('');
  const { accessToken, userId } = useContext(AccountContext);
  const { challengeId } = useContext(UserContext);
  const { handleEditChallenge } = useContext(ChallengeContext);

  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
  const minutes = Array.from({ length: 60 }, (_, i) =>
    i.toString().padStart(2, '0'),
  );
  const periods = ['AM', 'PM'];
  const [hour, setHour] = useState(1);
  const [minute, setMinute] = useState(0);
  const [period, setPeriod] = useState('AM');

  const settingHour = v => {
    let newHour = Number(v);
    if (period === 'PM') {
      newHour += 12;
    }
    setHour(newHour);
    settingWakeTime(newHour, minute);
  };

  const settingMinute = v => {
    const newMinute = Number(v);
    setMinute(newMinute);
    settingWakeTime(hour, newMinute);
  };

  const settingPeriod = v => {
    setPeriod(v);
    let newHour = hour;
    if (v === 'PM' && hour < 12) {
      newHour += 12;
    } else if (v === 'AM' && hour >= 12) {
      newHour -= 12;
    }
    setHour(newHour);
    settingWakeTime(newHour, minute);
  };

  const settingWakeTime = (h, m) => {
    const formattedHour = String(h).padStart(2, '0');
    const formattedMinute = String(m).padStart(2, '0');
    const time = `${formattedHour}:${formattedMinute}:00`;
    setWakeTime(time);
  };

  const convertToISODate = (date, time) => {
    const [hours, minutes, seconds] = time.split(':').map(Number);
    const newDate = new Date(date);
    newDate.setHours(hours, minutes, seconds, 0);
    const offset = newDate.getTimezoneOffset() * 60000;
    const localISOTime = new Date(newDate.getTime() - offset)
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');
    return localISOTime;
  };

  const durations = [
    { label: '7일  (동메달)', value: 7 },
    { label: '30일 (은메달)', value: 30 },
    { label: '100일 (금메달)', value: 100 },
  ];

  const handleRadioChange = e => {
    setDuration(Number(e.target.value));
  };

  const handleDateChange = e => {
    const start = new Date(e);
    const end = new Date(start);
    end.setDate(start.getDate() + (duration - 1)); // 시작 날짜로부터 6일 후 (총 7일)
    setRange([start, end]);
    setStartDate(e);
  };

  const tileClassName = ({ date, view }) => {
    // 날짜 객체 비교를 위해 각각의 요소를 추출
    const start = new Date(range[0]);
    const end = new Date(start);
    end.setDate(start.getDate() + duration - 1); // 시작 날짜로부터 duration 일 후
    // setRange([start, end]);

    // 각 날짜를 "년-월-일"의 형식으로 비교하기 위해 문자열로 변환
    const startDateStr = start.toISOString().slice(0, 10);
    const endDateStr = end.toISOString().slice(0, 10);
    const dateStr = date.toISOString().slice(0, 10);

    if (view === 'month' && dateStr >= startDateStr && dateStr <= endDateStr) {
      return 'highlight'; // 해당 범위 내 날짜에 'highlight' 클래스 적용
    }
  };

  const canSubmit = () => {
    return userId && duration && startDate && wakeTime;
  };

  const handleSubmit = async e => {
    e.preventDefault();

    const isoWakeTime = convertToISODate(startDate, wakeTime);
    const localStartDate = new Date(
      startDate.getTime() - startDate.getTimezoneOffset() * 60000,
    )
      .toISOString()
      .slice(0, 10);

    const response = await handleEditChallenge({
      newChallengeData: {
        hostId: userId,
        duration: Number(duration),
        startDate: localStartDate,
        wakeTime: isoWakeTime,
      },
    });

    const { isLoading: isEditChallengeLoading, error: editChallengeError } =
      response;
    if (!isEditChallengeLoading && !editChallengeError) {
      alert('챌린지가 수정되었습니다.');
      navigate('/main');
    } else {
      alert(editChallengeError);
      window.location.reload();
    }
  };

  const handleDelete = async e => {
    e.preventDefault();
    const response = await fetchData(() =>
      challengeServices.deleteChallenge({
        accessToken,
        challengeId,
        userId,
      }),
    );
    const { isLoading: isDeleteChallengeLoading, error: deleteChallengeError } =
      response;
    if (!isDeleteChallengeLoading && !deleteChallengeError) {
      alert('챌린지가 삭제되었습니다.');
      navigate('/main');
    } else {
      alert(deleteChallengeError);
      console.log(response);
    }
  };

  return (
    <>
      <NavBar />
      <S.PageWrapper>
        <Title>챌린지 기간</Title>
        <ChanllengeDuartion>
          <CustomRadio
            name="durations"
            content={durations}
            onChange={handleRadioChange}
            selectedValue={duration}
          />
        </ChanllengeDuartion>

        <Title>시작 일자</Title>
        <CalendarBox
          // boxStyle={boxStyle}
          content={
            <>
              <CustomCalendar
                startDate={startDate}
                handleDateChange={handleDateChange}
                tileClassName={tileClassName}
              />
              <StardEndDay>
                <StartDay>
                  시작 일자
                  <Day>
                    {range[0].getMonth() +
                      1 +
                      '월 ' +
                      range[0].getDate() +
                      '일'}
                  </Day>
                </StartDay>
                <Divider />
                <EndDay>
                  완료 일자
                  <Day>
                    {range[1].getMonth() +
                      1 +
                      '월 ' +
                      range[1].getDate() +
                      '일'}
                  </Day>
                </EndDay>
              </StardEndDay>
            </>
          }
        />

        <Title>기상 시간</Title>
        <TimeBox>
          <TimePicker
            isList={true}
            pos="left"
            list={hours}
            onSelectedChange={settingHour}
          />
          <TimePicker isList={false} pos="mid" list=":" />
          <TimePicker
            isList={true}
            pos="mid"
            list={minutes}
            onSelectedChange={settingMinute}
          />
          <TimePicker isList={false} pos="mid" list="|" />
          <TimePicker
            isList={true}
            pos="right"
            list={periods}
            onSelectedChange={settingPeriod}
          />
        </TimeBox>
        <EditBtn onClick={handleDelete}>
          <Text>챌린지 삭제</Text>
        </EditBtn>

        <LongBtn
          type="submit"
          btnName="수정 완료"
          onClickHandler={handleSubmit}
          isDisabled={!canSubmit()}
        />
      </S.PageWrapper>
    </>
  );
};

export default EditChallenge;

const CalendarBox = styled(OutlineBox)`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Title = styled.div`
  ${({ theme }) => theme.fonts.JuaSmall}
  ${({ theme }) => theme.flex.left}
  width:100%;
  color: ${({ theme }) => theme.colors.primary.purple};
`;

const TimeBox = styled.div`
  width: 100%;
  ${({ theme }) => theme.flex.center}
  border-radius: 20px;
  background-color: ${({ theme }) => theme.colors.translucent.white};
`;

const ChanllengeDuartion = styled.div`
  width: 100%;
  ${({ theme }) => theme.flex.left};
  flex-direction: column;
  align-items: flex-start;
`;

const StardEndDay = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.primary.white};
  ${({ theme }) => theme.flex.center}

  /* padding:0 20px 0 20px; */
  justify-content: space-evenly;
  ${({ theme }) => theme.fonts.JuaSmall}
  text-align: center;
`;

const Divider = styled.div`
  width: 1px;
  height: 86px;
  border: 0.5px solid ${({ theme }) => theme.colors.primary.white};
`;

const StartDay = styled.div`
  color: ${({ theme }) => theme.colors.primary.emerald};
  ${({ theme }) => theme.flex.left}
  padding: 10px 0 10px 0;
  flex-direction: column;
  text-align: center;
`;

const EndDay = styled.div`
  color: ${({ theme }) => theme.colors.primary.purple};
  ${({ theme }) => theme.flex.left}
  padding: 10px 0 10px 0;
  flex-direction: column;
  text-align: center;
`;

const Day = styled.div`
  color: ${({ theme }) => theme.colors.primary.white};
  margin-top: 5px; // 텍스트와 날짜 사이의 간격 추가
`;

const EditBtn = styled.div`
  width: 100%;
  height: 50px;
  padding: 10px;
  border: 2px solid ${({ theme }) => theme.colors.system.red};
  border-radius: 20px;
  ${({ theme }) => theme.flex.center}
`;

const Text = styled.div`
  margin-right: 10px;
  ${({ theme }) => theme.fonts.JuaSmall};
  color: ${({ isColor, theme }) =>
    isColor ? theme.colors.primary.purple : theme.colors.primary.white};
`;

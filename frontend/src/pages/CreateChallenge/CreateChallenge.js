import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  NavBar,
  LongBtn,
  TimePicker,
  OutlineBox,
  CustomRadio,
  CustomCalendar,
  InputLine,
  Icon,
} from '../../components';
import useFetch from '../../hooks/useFetch';
import { AccountContext, ChallengeContext } from '../../contexts';
import { challengeServices } from '../../apis/challengeServices';
import * as S from '../../styles/common';
import styled from 'styled-components';

const CreateChallenge = () => {
  const navigate = useNavigate();
  const { fetchData } = useFetch();
  const [duration, setDuration] = useState(7);
  const [startDate, setStartDate] = useState(new Date());
  const [range, setRange] = useState([new Date(), new Date()]);
  const [wakeTime, setWakeTime] = useState('');
  const [mates, setMates] = useState([]);
  const [emailInput, setEmailInput] = useState('');
  const { accessToken, userId } = useContext(AccountContext);
  const { handleCreateChallenge } = useContext(ChallengeContext);
  const [isCreateChallengeLoading, setIsCreateChallengeLoading] =
    useState(false);

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

  const handleEmailChange = e => {
    setEmailInput(e.target.value);
  };

  const checkEmail = async e => {
    e.preventDefault();

    if (emailInput === '') {
      alert('이메일을 입력해주세요.');
      return;
    }

    const response = await fetchData(() =>
      challengeServices.checkMateAvailability({
        accessToken,
        email: emailInput,
      }),
    );

    const { status, data, error } = response;
    if (status === 200) {
      if (!data.isEngaged) {
        const alreadyExists = mates.some(mate => mate === emailInput);
        if (alreadyExists) {
          alert('이미 추가한 메이트입니다.');
          setEmailInput('');
          return;
        }
        setMates([...mates, emailInput]);
        setEmailInput('');
      } else if (data.isEngaged) {
        alert('메이트가 이미 다른 챌린지에 참여 중입니다.');
        setEmailInput('');
      }
    } else if (error) {
      alert('사용자를 찾을 수 없습니다. 이메일을 확인해 주세요.');
      setEmailInput('');
    }
  };

  const deleteMate = index => {
    setMates(mates.filter((_, mateIndex) => mateIndex !== index));
  };

  const canSubmit = () => {
    return userId && duration && startDate && wakeTime;
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (mates.length > 4) {
      alert('친구는 최대 4명까지 초대 가능합니다.');
      return;
    }

    const isoWakeTime = convertToISODate(startDate, wakeTime);
    const localStartDate = new Date(
      startDate.getTime() - startDate.getTimezoneOffset() * 60000,
    )
      .toISOString()
      .slice(0, 10);

    const response = await handleCreateChallenge({
      newChallengeData: {
        hostId: userId,
        duration: Number(duration),
        startDate: localStartDate,
        wakeTime: isoWakeTime,
        mates,
      },
    });
    setIsCreateChallengeLoading(false);
    if (response.data) {
      alert('챌린지가 생성되었습니다.');
      navigate('/main');
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

        {/* 다이얼 시간 선택 */}
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

        <Title>미라클 메이트 초대</Title>
        <InputLine
          hasIcon={true}
          type="email"
          icon="search"
          iconStyle={searchIcon}
          value={emailInput}
          onChange={handleEmailChange}
          onClickHandler={checkEmail}
        />

        <InvitedBox>
          <ul>
            {mates.map((mate, index) => (
              <InvitedMate key={index}>
                <MiniCircle /> {mate}
                <button onClick={() => deleteMate(index)}>
                  <Icon icon="close" iconStyle={iconStyle} />
                </button>
              </InvitedMate>
            ))}
          </ul>
        </InvitedBox>
        <LongBtn
          type="submit"
          btnName="챌린지 생성"
          onClickHandler={handleSubmit}
          isDisabled={!canSubmit()}
        />
      </S.PageWrapper>
    </>
  );
};

export default CreateChallenge;

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

const InvitedBox = styled.div`
  width: 100%;
  ${({ theme }) => theme.flex.left};
  flex-direction: column;
  align-items: flex-start;
`;

const InvitedMate = styled.li`
  border: 1px solid ${({ theme }) => theme.colors.primary.purple};
  padding-left: 10px;
  border-radius: 30px;
  margin-bottom: 12px;
  ${({ theme }) => theme.fonts.IBMsmall}
  ${({ theme }) => theme.flex.center};

  button {
    color: white;
  }
`;

const MiniCircle = styled.div`
  background-color: ${({ theme }) => theme.colors.primary.purple};
  width: 15px;
  height: 15px;
  border-radius: 50px;
  margin-right: 5px;
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

const iconStyle = {
  size: 11,
  color: 'purple',
  hoverColor: 'white',
};

const searchIcon = {
  size: 20,
  color: 'purple',
  hoverColor: 'white',
};

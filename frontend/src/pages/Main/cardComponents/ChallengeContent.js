import React, { useContext, useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  AccountContext,
  UserContext,
  ChallengeContext,
} from '../../../contexts';

// Import Swiper styles
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import './slider.css';
import { Pagination } from 'swiper/modules';

import { LoadingWithText } from '../../../components';

const ChallengeContent = () => {
  const { userId: myId } = useContext(AccountContext);
  const { myData } = useContext(UserContext);
  const { challengeData } = useContext(ChallengeContext);
  const [isChallengeLoading, setIsChallengeLoading] = useState(true);

  useEffect(() => {
    if (Object.keys(challengeData).length !== 0) {
      setIsChallengeLoading(false);
    }
  }, [challengeData]);

  const remainingDays = calculateRemainingDays(challengeData?.endDate);

  const matesWithoutMe = challengeData?.mates?.filter(
    mate => mate?.userId !== myId,
  );

  const matesNames = matesWithoutMe?.map(mate => mate?.userName).join(', ');

  const sliderBox = [
    <SlideContent $isSingleLine={true} key="slider-wake-up-time">
      매일 아침{' '}
      <HighlightText>
        {challengeData.wakeTime?.split(':')?.slice(0, 2)?.join(':')}
      </HighlightText>
      에 일어나요
    </SlideContent>,
    matesWithoutMe?.length === 0 ? (
      <SlideContent $isSingleLine={true} key="slider-challenge-members">
        <HighlightText>{myData?.userName}</HighlightText>님 혼자서 도전 중이에요
      </SlideContent>
    ) : (
      <SlideContent
        $isSingleLine={matesWithoutMe?.length === 1}
        key="slider-challenge-members"
      >
        <HighlightText>{matesNames}</HighlightText>
        {' 과(와) 함께 하고 있어요'}
      </SlideContent>
    ),
    <SlideContent $isSingleLine={true} key="slider-end-date">
      완료까지 <HighlightText>{remainingDays}일</HighlightText> 남았어요
    </SlideContent>,
  ];

  function calculateRemainingDays(endDate) {
    let end = new Date(endDate);
    let currentDate = new Date();

    let remainingDays = Math.ceil((end - currentDate) / (1000 * 60 * 60 * 24));

    return remainingDays - 1;
  }

  return isChallengeLoading ? (
    <LoadingWrapper>
      <LoadingWithText />
    </LoadingWrapper>
  ) : (
    <Swiper
      // autoplay={{ delay: 1000 }} //3초
      // loop={true} //반복
      spaceBetween={50}
      pagination={{
        dynamicBullets: true,
        bulletClass: 'swiper-pagination-bullet', // bullet의 클래스명
      }}
      modules={[Pagination]}
      className="mySwiper"
    >
      {sliderBox.map((challenge, index) => (
        <SwiperSlide key={index}>
          <Wrapper>
            <ChallengeTitle>진행 중 챌린지</ChallengeTitle>
            {challenge}
          </Wrapper>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default ChallengeContent;

const Wrapper = styled.div`
  width: 100%;
  ${({ theme }) => theme.flex.center}
  flex-direction: column;
  padding-bottom: 30px;
`;

const LoadingWrapper = styled.div`
  width: 100%;
  height: 140px;
  ${({ theme }) => theme.flex.center}
`;

const ChallengeTitle = styled.span`
  color: ${({ theme }) => theme.colors.primary.purple};
  justify-content: center;
  ${({ theme }) => theme.fonts.JuaSmall};
  margin: 14px 0 10px 0;
`;

const HighlightText = styled.span`
  color: ${({ theme }) => theme.colors.primary.white};
  font-weight: 600;

  margin: 0 5px;
`;

const SlideContent = styled.div`
  color: ${({ theme }) => theme.colors.neutral.lightGray};
  text-align: center;
  ${({ theme }) => theme.fonts.IBMsmall}
  font-size: 16px;

  padding: ${({ $isSingleLine }) => ($isSingleLine ? '10px 10px' : '0 10px')};
`;

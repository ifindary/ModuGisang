import React from 'react';
import styled from 'styled-components';
import { StreakContent } from '../../Main/cardComponents';
import { Icon } from '../../../components';

const FriendStreak = ({ mateData, isMateDataLoading, setIsMateSelected }) => {
  return (
    <Wrapper>
      <OverLayer
        onClick={e => {
          e.preventDefault();
          e.stopPropagation();
          setIsMateSelected(false);
        }}
      />

      <Box>
        <CloseBtn
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            setIsMateSelected(false);
          }}
        >
          <Icon icon="close" iconStyle={CLOSE_ICON_STYLE} />
        </CloseBtn>
        {isMateDataLoading && <div> 가져오는 중... </div>}
        {!isMateDataLoading && mateData && (
          <>
            <UserName>{mateData.userName}</UserName>
            <SeperateLine />
            <StyledStreakContent
              userData={mateData}
              isWaitingRoom={true}
              friendStreak
            />
          </>
        )}
        {!isMateDataLoading && !mateData && <div>데이터가 없습니다 :(</div>}
      </Box>
    </Wrapper>
  );
};
export default FriendStreak;

const Wrapper = styled.div`
  z-index: 600;
  position: fixed;
  width: 100vw;
  height: 100vh;

  padding: 24px;

  ${({ theme }) => theme.flex.center};
`;

const OverLayer = styled.div`
  position: fixed;
  width: 100vw;
  height: 100vh;

  background-color: ${({ theme }) => theme.colors.translucent.navy};
  backdrop-filter: blur(10px);
`;

const CloseBtn = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  width: 30px;
  height: 30px;
`;

const Box = styled.div`
  position: relative;
  width: 100%;
  height: max-content;

  padding: 18px;

  background-color: ${({ theme }) => theme.colors.translucent.navy};
  border-radius: ${({ theme }) => theme.radius.medium};

  ::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: ${({ theme }) => theme.radius.medium};
    border: 3px solid transparent;
    background: ${({ theme }) => theme.gradient.largerPurple} border-box;
    mask:
      linear-gradient(#fff 0 0) padding-box,
      linear-gradient(#fff 0 0);
    mask-composite: exclude;
  }
`;

const UserName = styled.div`
  ${({ theme }) => theme.fonts.JuaSmall};
  color: ${({ theme }) => theme.colors.primary.white};
  margin: 10px;
`;

const SeperateLine = styled.div`
  width: 100%;
  height: 1px;
  background: ${({ theme }) => theme.colors.neutral.lightGray};
`;

const StyledStreakContent = styled(StreakContent)`
  padding: 24px 0px;
`;

const CLOSE_ICON_STYLE = {
  size: 24,
  color: 'purple',
  hoverColor: 'purple',
};

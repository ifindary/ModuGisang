import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../contexts';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { RoundBtn } from '../components';
import styled, { css } from 'styled-components';

const NavBar = () => {
  const { userData } = useContext(UserContext);
  const { userName } = userData;
  const { pathname } = useLocation();
  const params = useParams();
  const navigate = useNavigate();
  const [hasLeftBtn, setHasLeftBtn] = useState(false);
  const [hasRightBtn, setHasRightBtn] = useState(true);
  const [pageType, setPageType] = useState('main');

  const TITLE_BY_PAGE_TYPE = {
    main: (
      <>
        <p>오늘도 기적같은 하루!</p>
        <p>안녕하세요 {userName}님 :)</p>
      </>
    ),
    myStreak: '나의 기록',
    joinChallenge: '챌린지 참여',
    createChallenge: '챌린지 만들기',
    settings: '설정',
  };

  const goBack = () => {
    navigate('/');
  };

  const goToSettings = () => {
    navigate('/settings');
  };

  useEffect(() => {
    const page = pathname.split('/')[1];

    if (page) {
      setPageType(page);

      if (page === 'main') {
        setHasLeftBtn(false);
        setHasRightBtn(true);
      } else {
        setHasLeftBtn(true);
        setHasRightBtn(false);
      }
    } else {
      setHasLeftBtn(false);
      setHasRightBtn(true);
    }
  }, [params]);

  return (
    <Wrapper $hasLeftBtn={hasLeftBtn} $hasRightBtn={hasRightBtn}>
      {hasLeftBtn && (
        <RoundBtn btnStyle={BACK_BTN_STYLE} onClickHandler={goBack} />
      )}

      <Title $hasLeftBtn={hasLeftBtn}>{TITLE_BY_PAGE_TYPE[pageType]}</Title>

      {hasRightBtn && (
        <RoundBtn btnStyle={SETTINGS_BTN_STYLE} onClickHandler={goToSettings} />
      )}
    </Wrapper>
  );
};

export default NavBar;

const Wrapper = styled.nav`
  position: fixed;
  top: 0;

  display: grid;
  grid-template-columns: ${({ $hasLeftBtn, $hasRightBtn }) =>
    $hasLeftBtn && $hasRightBtn
      ? '40px auto 40px'
      : $hasLeftBtn && !$hasRightBtn
        ? '40px auto'
        : 'auto 40px'};
  align-items: center;

  width: 100vw;
  height: 100px;
  padding: 0 24px;
`;

const Title = styled.header`
  justify-self: ${({ $hasLeftBtn }) => ($hasLeftBtn ? 'center' : 'flex-start')};
  margin-left: ${({ $hasLeftBtn }) => $hasLeftBtn && '-40px'};
  margin-bottom: -8px;

  ${({ theme }) => theme.fonts.JuaSmall}

  background: ${({ theme }) => theme.gradient.largerEmerald};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: transparent;
`;

const BACK_BTN_STYLE = {
  size: 40,
  disabled: false,
  icon: 'back',
  iconStyle: {
    size: 20,
    color: 'white',
    hoverColor: 'purple',
  },
};

const SETTINGS_BTN_STYLE = {
  size: 40,
  disabled: false,
  icon: 'settings',
  iconStyle: {
    size: 20,
    color: 'white',
    hoverColor: 'purple',
  },
};

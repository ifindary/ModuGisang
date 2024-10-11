import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { RoundBtn } from '../components';
import { UserContext } from '../contexts';
import { Capacitor } from '@capacitor/core';
import styled from 'styled-components';

const PAGE_TYPES = [
  'signUp',
  'forgotPassword',
  'main',
  'myStreak',
  'joinChallenge',
  'createChallenge',
  'settings',
  'changePassword',
  'privacyPolicy',
  'termsOfService',
  'customerService',
  'deleteUser',
];

const NavBar = () => {
  const { myData } = useContext(UserContext) || {};
  const { userName } = myData || {};
  const { pathname, state } = useLocation();
  const navigate = useNavigate();
  const [hasLeftBtn, setHasLeftBtn] = useState(false);
  const [hasRightBtn, setHasRightBtn] = useState(true);
  const [pageType, setPageType] = useState('main');
  const [scrolled, setScrolled] = useState(false);
  const [platform, setPlatform] = useState('web');

  const goBack = () => {
    if (pageType === 'privacyPolicy' || pageType === 'termsOfService') {
      if (state?.from === 'settings') {
        navigate('/settings');
      } else if (state?.from === 'signup') {
        navigate('/signUp');
      } else if (state?.from === 'deleteUser') {
        navigate('/deleteUser');
      } else {
        navigate('/');
      }
    } else if (pageType === 'changePassword') {
      navigate('/settings');
    } else if (pageType === 'signUp' || pageType === 'forgotPassword') {
      navigate('/signIn');
    } else if (pageType === 'customerService') {
      navigate('/settings');
    } else if (pageType === 'deleteUser') {
      navigate('/customerService');
    } else {
      navigate('/');
    }
  };

  const goToSettings = () => {
    navigate('/settings');
  };

  const refreshPage = () => {
    window.location.reload();
  };

  const RIGHT_BTN_FUNCS = {
    main: goToSettings,
    settings: refreshPage,
  };

  const TITLE_BY_PAGE_TYPE = {
    main: (
      <>
        <p>오늘도 기적같은 하루!</p>
        <p>안녕하세요 {userName}님 :)</p>
      </>
    ),
    signUp: '회원가입',
    forgotPassword: '비밀번호 찾기',
    myStreak: '나의 기록',
    joinChallenge: '챌린지 참여',
    createChallenge: '챌린지 만들기',
    settings: '설정',
    changePassword: '비밀번호 변경',
    privacyPolicy: '개인정보보호방침',
    termsOfService: '이용약관',
    customerService: '고객센터',
    deleteUser: '회원 탈퇴',
  };

  useEffect(() => {
    let page = pathname.split('/')[1];
    if (page === undefined || page === '') {
      page = 'main';
    }

    if (PAGE_TYPES.includes(page)) {
      setPageType(page);

      if (page === 'main') {
        setHasLeftBtn(false);
        setHasRightBtn(true);
      } else if (page === 'settings') {
        setHasLeftBtn(true);
        setHasRightBtn(true);
      } else {
        setHasLeftBtn(true);
        setHasRightBtn(false);
      }
    } else {
      setHasLeftBtn(false);
      setHasRightBtn(false);
    }
  }, [pathname, state]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 25) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    setPlatform(Capacitor.getPlatform());
  }, []);

  return (
    <Wrapper
      $hasLeftBtn={hasLeftBtn}
      $hasRightBtn={hasRightBtn}
      $scrolled={scrolled}
      $platform={platform}
    >
      {hasLeftBtn && (
        <RoundBtn btnStyle={BACK_BTN_STYLE} onClickHandler={goBack} />
      )}

      <Title $hasLeftBtn={hasLeftBtn} $hasRightBtn={hasRightBtn}>
        {TITLE_BY_PAGE_TYPE[pageType]}
      </Title>

      {hasRightBtn && (
        <RoundBtn
          btnStyle={RIGHT_BTN_STYLES[pageType]}
          onClickHandler={RIGHT_BTN_FUNCS[pageType]}
        />
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
  z-index: 100;
  background: ${({ $scrolled, theme }) =>
    $scrolled ? theme.colors.translucent.white : 'transparent'};
  backdrop-filter: ${({ $scrolled }) => ($scrolled ? 'blur(15px)' : 'none')};
  transition: background 0.3s ease;

  padding: ${({ $platform }) =>
    $platform === 'ios'
      ? '72px 24px'
      : $platform === 'web'
        ? '0 24px'
        : '72px 24px'};
`;

const Title = styled.header`
  justify-self: ${({ $hasLeftBtn, $hasRightBtn }) =>
    !$hasLeftBtn && $hasRightBtn ? 'flex-start' : 'center'};
  margin-left: ${({ $hasLeftBtn, $hasRightBtn }) =>
    $hasLeftBtn && !$hasRightBtn && '-40px'};
  margin-right: ${({ $hasLeftBtn, $hasRightBtn }) =>
    !$hasLeftBtn && $hasRightBtn && '0px'};
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

const REFRESH_BTN_STYLE = {
  size: 40,
  disabled: false,
  icon: 'refresh',
  iconStyle: {
    size: 20,
    color: 'white',
    hoverColor: 'purple',
  },
};

const RIGHT_BTN_STYLES = {
  main: SETTINGS_BTN_STYLE,
  settings: REFRESH_BTN_STYLE,
};

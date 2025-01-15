import React, { useState, useRef, useEffect } from 'react';
import { LoadingWithText, LongBtn, InputLine } from '../../components';
import useAuth from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import * as S from '../../styles/common';
import styled from 'styled-components';
import { onlysun } from '../../assets/icons';

const Signin = () => {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const { handleSubmitLogIn } = useAuth();
  const navigate = useNavigate();

  const passwordInputRef = useRef(null);
  const emailInputRef = useRef(null);

  const handleLoginEmailChange = e => {
    setLoginEmail(e.target.value);
  };

  const handleLoginPasswordChange = e => {
    setLoginPassword(e.target.value);
  };

  const handleKeyDownEmail = e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (passwordInputRef.current) {
        passwordInputRef.current.focus();
      }
    }
  };

  const handleKeyDownPassword = async e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (passwordInputRef.current) {
        passwordInputRef.current.blur();
      }
    }
  };

  const handleFocus = (inputRef, focusState) => {
    setIsInputFocused(focusState);
    if (inputRef.current && focusState) {
      setIsScrolling(true);
      inputRef.current.focus();
      inputRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
      setTimeout(() => setIsScrolling(false), 1000);
    }
  };

  const goToSignUp = () => {
    navigate('/signUp');
  };

  const goToForgotPassword = () => {
    navigate('/forgotPassword');
  };

  const handleLoginClick = async e => {
    if (isScrolling) return; // 자동 스크롤링 중 실수로 인한 버튼 눌림 방지
    await handleSubmitLogIn({
      e,
      loginEmail,
      loginPassword,
      setIsLoginLoading,
    });
  };

  if (isLoginLoading) {
    return (
      <S.LoadingWrapper>
        <LoadingWithText loadingMSG="로그인 중입니다 :)" />
      </S.LoadingWrapper>
    );
  }

  return (
    <S.PageWrapper>
      <TitleBox>
        <Logo src={onlysun} />
        <Title>모두기상</Title>
        <Subtitle>친구와 함께 미라클 모닝 챌린지</Subtitle>
      </TitleBox>
      <InputLine
        ref={emailInputRef}
        hasIcon={true}
        type="email"
        icon="user"
        iconStyle={iconStyle}
        value={loginEmail}
        onChange={handleLoginEmailChange}
        onKeyDown={handleKeyDownEmail}
        onFocus={() => handleFocus(emailInputRef, true)}
        onBlur={() => handleFocus(emailInputRef, false)}
      />
      <InputLine
        ref={passwordInputRef}
        hasIcon={true}
        type="password"
        icon="key"
        iconStyle={iconStyle}
        value={loginPassword}
        onChange={handleLoginPasswordChange}
        onKeyDown={handleKeyDownPassword}
        onFocus={() => handleFocus(passwordInputRef, true)}
        onBlur={() => handleFocus(passwordInputRef, false)}
      />
      <LongBtn
        onClickHandler={handleLoginClick}
        type="submit"
        btnName="로그인"
      />
      <AuthOptions>
        <AuthButton onClick={goToForgotPassword}>비밀번호 찾기</AuthButton>
        <Divider>|</Divider>
        <AuthButton onClick={goToSignUp}>회원가입</AuthButton>
      </AuthOptions>
      <Spacer isVisible={isInputFocused} />
    </S.PageWrapper>
  );
};

export default Signin;

const Logo = styled.img`
  width: 109px;
  height: 108px;
  margin-bottom: 30px;
`;

const TitleBox = styled.div`
  ${({ theme }) => theme.flex.center};
  flex-direction: column;
  margin-bottom: 30px;
`;

const Title = styled.div`
  ${({ theme }) => theme.fonts.JuaMedium};
  font-size: 40px;
  font-weight: 400;
  line-height: normal;
  background: ${({ theme }) => theme.gradient.largerEmerald};
  background-clip: text;
  color: transparent;
`;

const Subtitle = styled.div`
  ${({ theme }) => theme.fonts.IBMsmall};
  font-size: 16px;
  font-weight: 400;
  line-height: 22px;
  letter-spacing: -0.4px;
`;

const AuthOptions = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  position: fixed;
  bottom: 43px;
  padding: 0 20px;
`;

const AuthButton = styled.button`
  ${({ theme }) => theme.fonts.JuaSmall};
  color: ${({ theme }) => theme.colors.neutral.lightGray};
  background: none;
  border: none;
  text-decoration: underline;
  cursor: pointer;
`;

const Divider = styled.span`
  margin: 0 15px;
  color: ${({ theme }) => theme.colors.neutral.lightGray};
  font-size: 16px;
`;

const iconStyle = {
  size: 20,
  color: 'white',
  hoverColor: 'white',
};

const Spacer = styled.div`
  height: ${props => (props.isVisible ? '300px' : '0px')};
  transition: height 1s ease-in-out;
`;

import React, { useState, useRef, useEffect } from 'react';
import {
  InputLine,
  LongBtn,
  NavBar,
  StyledLink,
  LoadingWithText,
} from '../../components';
import { ERROR_MESSAGES } from '../../constants/Messages';
import useAuth from '../../hooks/useAuth';
import useNavigateWithState from '../../hooks/useNavigateWithState';
import useValidation from '../../hooks/useValidation';
import * as S from '../../styles/common';
import styled from 'styled-components';

const Signup = () => {
  const navigateWithState = useNavigateWithState();
  const { isValidEmail, isValidPassword } = useValidation();
  const [email, setEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [checkPassword, setCheckPassword] = useState('');
  const [isSamePassword, setIsSamePassword] = useState(false);
  const [showPasswordError, setShowPasswordError] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [nameError, setNameError] = useState('');
  const [isEmailChecked, setIsEmailChecked] = useState(false);
  const [isEmailCheckLoading, setIsEmailCheckLoading] = useState(false);
  const [verifyCode, setVerifyCode] = useState('');
  const [isVerifyCodeChecked, setIsVerifyCodeChecked] = useState(false);
  const [isVerifyCodeCheckLoading, setIsVerifyCodeCheckLoading] =
    useState(false);
  const [isSignUpLoading, setIsSignUpLoading] = useState(false);

  const [isOver14Checked, setIsOver14Checked] = useState(false);
  const [isTermsChecked, setIsTermsChecked] = useState(false);

  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const checkPasswordInputRef = useRef(null);
  const verifyCodeInputRef = useRef(null);
  const userNameInputRef = useRef(null);

  const { handleCheckEmail, handleCheckVerifyCode, handleSubmitSignUp } =
    useAuth();

  const handleEmailChange = e => {
    const newEmail = e.target.value;
    setEmail(newEmail);

    if (newEmail && !isValidEmail(newEmail)) {
      setEmailError(ERROR_MESSAGES.INVALID_EMAIL);
    } else {
      setEmailError('');
      setIsEmailChecked(false);
    }
  };

  const handleUserNameChange = e => {
    const newUserName = e.target.value;
    setUserName(newUserName);

    if (newUserName.length > 5) {
      setNameError(ERROR_MESSAGES.INVALID_NAME);
    } else {
      setNameError('');
    }
  };

  const handlePasswordChange = e => {
    const newPassword = e.target.value;
    setPassword(newPassword);

    if (newPassword && !isValidPassword(newPassword)) {
      setPasswordError(ERROR_MESSAGES.INVALID_PASSWORD);
    } else {
      setPasswordError('');
    }
  };

  const handleCheckPasswordChange = e => {
    const newCheckPassword = e.target.value;
    setCheckPassword(newCheckPassword);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (checkPassword && password) {
      if (password === checkPassword) {
        setIsSamePassword(true);
        setShowPasswordError(false);
      } else {
        setIsSamePassword(false);
        setShowPasswordError(true);
      }
    } else {
      setIsSamePassword(false);
      setShowPasswordError(false);
    }
  }, [password, checkPassword]);

  const handleVerifyCodeChange = e => {
    setVerifyCode(e.target.value);
  };

  const handleKeyDownEmail = async e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (verifyCodeInputRef.current) {
        verifyCodeInputRef.current.focus();
      }
    }
  };

  const handleKeyDownVerifyCode = async e => {
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
      if (checkPasswordInputRef.current) {
        checkPasswordInputRef.current.focus();
      }
    }
  };

  const handleKeyDownCheckPassword = async e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (userNameInputRef.current) {
        userNameInputRef.current.focus();
      }
    }
  };

  const handleKeyDownUserName = async e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (userNameInputRef.current) {
        userNameInputRef.current.blur();
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

  if (isSignUpLoading || isEmailCheckLoading || isVerifyCodeCheckLoading) {
    return (
      <S.LoadingWrapper>
        <LoadingWithText loadingMSG="데이터 확인 중..." />
      </S.LoadingWrapper>
    );
  }

  const isFormValid = () => {
    return (
      isSamePassword &&
      isVerifyCodeChecked &&
      isEmailChecked &&
      isOver14Checked &&
      isTermsChecked &&
      !emailError &&
      !nameError &&
      !passwordError
    );
  };

  return (
    <>
      <NavBar />
      <S.PageWrapper>
        <FormSection>
          <Title>이메일 주소</Title>
          <EmailBox>
            <InputLine
              ref={emailInputRef}
              hasIcon={false}
              type="email"
              value={email}
              onChange={handleEmailChange}
              onKeyDown={handleKeyDownEmail}
              disabled={isEmailChecked}
              onFocus={() => handleFocus(emailInputRef, true)}
              onBlur={() => handleFocus(emailInputRef, false)}
            />
            <SmallBtn
              onClick={async e =>
                await handleCheckEmail({
                  e,
                  email,
                  setIsEmailChecked,
                  setIsEmailCheckLoading,
                })
              }
              disabled={!isValidEmail(email) || isEmailChecked}
            >
              중복 확인
            </SmallBtn>
          </EmailBox>
          {emailError && <ErrorText>{emailError}</ErrorText>}
        </FormSection>
        <FormSection>
          <Title>인증 코드</Title>
          <EmailBox>
            <InputLine
              ref={verifyCodeInputRef}
              type="text"
              value={verifyCode}
              onChange={handleVerifyCodeChange}
              onKeyDown={handleKeyDownVerifyCode}
              disabled={isVerifyCodeChecked}
              onFocus={() => handleFocus(verifyCodeInputRef, true)}
              onBlur={() => handleFocus(verifyCodeInputRef, false)}
            />
            <SmallBtn
              onClick={async e =>
                await handleCheckVerifyCode({
                  e,
                  verifyCode,
                  email,
                  setIsVerifyCodeCheckLoading,
                  setIsVerifyCodeChecked,
                })
              }
              disabled={!verifyCode || isVerifyCodeChecked}
            >
              인증
            </SmallBtn>
          </EmailBox>
        </FormSection>
        <FormSection>
          <Title>비밀번호</Title>
          <InputLine
            ref={passwordInputRef}
            hasIcon={false}
            type="password"
            value={password}
            onChange={handlePasswordChange}
            onKeyDown={handleKeyDownPassword}
            onFocus={() => handleFocus(passwordInputRef, true)}
            onBlur={() => handleFocus(passwordInputRef, false)}
          />
          {passwordError && <ErrorText>{passwordError}</ErrorText>}
        </FormSection>
        <FormSection>
          <Title>비밀번호 확인</Title>
          <InputLine
            ref={checkPasswordInputRef}
            hasIcon={false}
            type="password"
            value={checkPassword}
            onChange={handleCheckPasswordChange}
            onKeyDown={handleKeyDownCheckPassword}
            onFocus={() => handleFocus(checkPasswordInputRef, true)}
            onBlur={() => handleFocus(checkPasswordInputRef, false)}
          />
        </FormSection>
        {showPasswordError && (
          <WrongPassword>비밀번호가 일치하지 않습니다.</WrongPassword>
        )}
        <FormSection>
          <Title>이름</Title>
          <InputLine
            ref={userNameInputRef}
            type="text"
            value={userName}
            onChange={handleUserNameChange}
            onKeyDown={handleKeyDownUserName}
            onFocus={() => handleFocus(userNameInputRef, true)}
            onBlur={() => handleFocus(userNameInputRef, false)}
          />
          {nameError && <ErrorText>{nameError}</ErrorText>}
        </FormSection>

        <CheckboxWrapper>
          <CheckboxLabel>
            <input
              type="checkbox"
              checked={isOver14Checked}
              onChange={e => setIsOver14Checked(e.target.checked)}
            />
            만 14세 이상입니다.
          </CheckboxLabel>

          <CheckboxLabel>
            <input
              type="checkbox"
              checked={isTermsChecked}
              onChange={e => setIsTermsChecked(e.target.checked)}
            />
            <span>
              <StyledLink
                onClick={() => navigateWithState('/termsOfService', 'signup')}
              >
                이용약관
              </StyledLink>{' '}
              및{' '}
              <StyledLink
                onClick={() => navigateWithState('/privacyPolicy', 'signup')}
              >
                개인정보보호방침
              </StyledLink>
              을 확인했습니다.
            </span>
          </CheckboxLabel>
        </CheckboxWrapper>

        <LongBtn
          type="submit"
          btnName="회원가입"
          onClickHandler={async e =>
            await handleSubmitSignUp({
              e,
              email,
              password,
              userName,
              isEmailChecked,
              isVerifyCodeChecked,
              setIsSignUpLoading,
            })
          }
          disabled={!isFormValid()}
        />
        <Spacer isVisible={isInputFocused} />
      </S.PageWrapper>
    </>
  );
};

export default Signup;

const Title = styled.div`
  ${({ theme }) => theme.fonts.JuaSmall}
  ${({ theme }) => theme.flex.left}
  width: 100%;
  color: ${({ theme }) => theme.colors.primary.purple};
`;

const SmallBtn = styled.button`
  width: 130px;
  height: 50px;
  border-radius: 20px;
  border: 1px solid
    ${({ theme, disabled }) =>
      disabled ? theme.colors.translucent.white : theme.colors.primary.emerald};
  background-color: ${({ theme, disabled }) =>
    disabled ? theme.colors.neutral.lightGray : theme.colors.primary.purple};
  color: ${({ theme, disabled }) =>
    disabled ? theme.colors.neutral.gray : theme.colors.primary.white};
  ${({ theme }) => theme.fonts.JuaSmall}
  font-size: 20px;
  margin-left: 8px;
  padding-left: 8px;
  padding-right: 8px;
`;

const EmailBox = styled.div`
  width: 100%;
  ${({ theme }) => theme.flex.left}
`;

const ErrorText = styled.div`
  width: 100%;
  ${({ theme }) => theme.fonts.IBMsamll};
  font-size: 15px;
  color: ${({ theme }) => theme.colors.system.red};
`;

const WrongPassword = styled.div`
  width: 100%;
  ${({ theme }) => theme.fonts.IBMsamll};
  font-size: 15px;
  color: ${({ theme }) => theme.colors.system.red};
`;

const FormSection = styled.div`
  width: 100%;
  ${({ theme }) => theme.flex.left}
  flex-direction: column;
  gap: 5px;
`;

const CheckboxWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: left;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
`;

const CheckboxLabel = styled.label`
  ${({ theme }) => theme.fonts.IBMsamll};
  color: ${({ theme }) => theme.colors.neutral.black};
  cursor: pointer;

  input {
    margin-right: 8px;
  }
`;

const Spacer = styled.div`
  height: ${props => (props.isVisible ? '300px' : '0px')};
  transition: height 1s ease-in-out;
`;

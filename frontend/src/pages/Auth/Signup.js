import React, { useState, useEffect } from 'react';
import {
  InputLine,
  LongBtn,
  NavBar,
  StyledLink,
  LoadingWithText,
} from '../../components';
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

  const { handleCheckEmail, handleCheckVerifyCode, handleSubmitSignUp } =
    useAuth();

  const handleEmailChange = e => {
    const newEmail = e.target.value;
    setEmail(newEmail);

    if (newEmail && !isValidEmail(newEmail)) {
      setEmailError('올바른 이메일 주소를 입력해 주세요.');
    } else {
      setEmailError('');
      setIsEmailChecked(false);
    }
  };

  const handleUserNameChange = e => {
    const newUserName = e.target.value;
    setUserName(newUserName);

    // 이름 길이 검증
    if (newUserName.length > 5) {
      setNameError('이름은 5글자를 넘길 수 없습니다.');
    } else {
      setNameError('');
    }
  };

  const handlePasswordChange = e => {
    const newPassword = e.target.value;
    setPassword(newPassword);

    if (newPassword && !isValidPassword(newPassword)) {
      setPasswordError(
        '비밀번호는 8자~16자로 숫자와 영문자, 특수문자를 하나씩 포함해야 합니다.',
      );
    } else {
      setPasswordError('');
    }
  };

  const handleCheckPasswordChange = e => {
    const newCheckPassword = e.target.value;
    setCheckPassword(newCheckPassword);
  };

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
              hasIcon={false}
              type="email"
              value={email}
              onChange={handleEmailChange}
              disabled={isEmailChecked}
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
              type="text"
              value={verifyCode}
              onChange={handleVerifyCodeChange}
              disabled={isVerifyCodeChecked}
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
            hasIcon={false}
            type="password"
            value={password}
            onChange={handlePasswordChange}
          />
          {passwordError && <ErrorText>{passwordError}</ErrorText>}
        </FormSection>
        <FormSection>
          <Title>비밀번호 확인</Title>
          <InputLine
            hasIcon={false}
            type="password"
            value={checkPassword}
            onChange={handleCheckPasswordChange}
          />
        </FormSection>
        {showPasswordError && (
          <WrongPassword>비밀번호가 일치하지 않습니다.</WrongPassword>
        )}
        <FormSection>
          <Title>이름</Title>
          <InputLine
            type="text"
            value={userName}
            onChange={handleUserNameChange}
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

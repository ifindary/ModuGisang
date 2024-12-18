import React, { useRef, useState } from 'react';
import { InputLine, LongBtn, NavBar } from '../../components';
import { ERROR_MESSAGES } from '../../constants/Messages';
import useAuth from '../../hooks/useAuth';
import useValidation from '../../hooks/useValidation';
import * as S from '../../styles/common';
import styled from 'styled-components';

const ForgotPassword = () => {
  const { isValidEmail } = useValidation();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [isPasswordResetLoading, setIsPasswordResetLoading] = useState(false);

  const { handleSendTmpPassword } = useAuth();

  const emailInputRef = useRef(null);

  const handleEmailChange = e => {
    const newEmail = e.target.value;
    setEmail(newEmail);

    if (newEmail && !isValidEmail(newEmail)) {
      setEmailError(ERROR_MESSAGES.INVALID_EMAIL);
    } else {
      setEmailError('');
    }
    setSuccessMessage('');
    setIsButtonDisabled(false);
  };

  const handleKeyDownEmail = async e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (emailInputRef.current) {
        emailInputRef.current.blur();
      }
    }
  };

  const handleForgotPassword = async e => {
    e.preventDefault();

    setEmailError('');
    setSuccessMessage('');

    try {
      const successMessage = await handleSendTmpPassword({
        email,
        setIsPasswordResetLoading,
      });

      setSuccessMessage(successMessage);
      alert(successMessage);
      setIsButtonDisabled(true);
    } catch (error) {
      setEmailError(error.message);
      setSuccessMessage('');
      alert(error.message);
    }
  };

  return (
    <>
      <NavBar />
      <S.PageWrapper>
        <FormSection>
          <Title>비밀번호를 찾으려는 아이디</Title>
          <InputLine
            ref={emailInputRef}
            type="email"
            value={email}
            onChange={handleEmailChange}
            onKeyDown={handleKeyDownEmail}
          />
        </FormSection>
        <LongBtn
          type="submit"
          btnName="임시 비밀번호 발송"
          onClickHandler={handleForgotPassword}
          disabled={
            !isValidEmail(email) || isButtonDisabled || isPasswordResetLoading
          }
        />
        {emailError && <ErrorText>{emailError}</ErrorText>}
        {successMessage && <SuccessText>{successMessage}</SuccessText>}
      </S.PageWrapper>
    </>
  );
};

export default ForgotPassword;

const Title = styled.div`
  ${({ theme }) => theme.fonts.JuaSmall};
  ${({ theme }) => theme.flex.left};
  width: 100%;
  color: ${({ theme }) => theme.colors.primary.purple};
`;

const FormSection = styled.div`
  width: 100%;
  ${({ theme }) => theme.flex.left};
  flex-direction: column;
  gap: 5px;
`;

const ErrorText = styled.div`
  width: 100%;
  ${({ theme }) => theme.fonts.IBMsamll};
  font-size: 15px;
  color: ${({ theme }) => theme.colors.system.red};
`;

const SuccessText = styled.div`
  width: 100%;
  ${({ theme }) => theme.fonts.IBMsamll};
  font-size: 15px;
  color: ${({ theme }) => theme.colors.system.green};
`;

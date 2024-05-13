import React from 'react';
import { useState } from 'react';
import {
  InputBox,
  LoadingWithText,
  LongBtn,
  ProgressBar,
} from '../../components';

import useAuth from '../../hooks/useAuth';

import * as S from '../../styles/common';

import { CONFIGS } from '../../config';

const Signin = () => {
  const { TEST_EMAIL, TEST_PASSWORD } = CONFIGS;
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const { handleSubmitLogIn } = useAuth();

  const handleLoginEmailChange = e => {
    setLoginEmail(e.target.value);
  };

  const handleLoginPasswordChange = e => {
    setLoginPassword(e.target.value);
  };

  if (isLoginLoading) {
    return <ProgressBar></ProgressBar>;
    // return <LoadingWithText loadingMSG="로그인 중입니다 :)" />;
  }

  return (
    <S.PageWrapper>
      로그인
      <>
        <form>
          <InputBox
            label="Email"
            type="email"
            value={loginEmail}
            onChange={handleLoginEmailChange}
          />
          <InputBox
            label="Password"
            type="password"
            value={loginPassword}
            onChange={handleLoginPasswordChange}
          />
        </form>
        <LongBtn
          onClickHandler={async e =>
            await handleSubmitLogIn({
              e,
              loginEmail,
              loginPassword,
              setIsLoginLoading,
            })
          }
          type="submit"
          btnName="로그인"
        />
        <LongBtn
          onClickHandler={async e => {
            e.preventDefault();
            await handleSubmitLogIn({
              e,
              loginEmail: TEST_EMAIL,
              loginPassword: TEST_PASSWORD,
              setIsLoginLoading,
            });
          }}
          type="submit"
          btnName="개발용 로그인"
        />
      </>
    </S.PageWrapper>
  );
};

export default Signin;

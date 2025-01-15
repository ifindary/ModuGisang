import React, { useContext, useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import {
  AccountContext,
  UserContextProvider,
  ChallengeContextProvider,
  MediaPipeContextProvider,
} from '../../contexts';
import useAuth from '../../hooks/useAuth';
import { LoadingWithText } from '../../components';
import * as S from '../../styles/common';

const ProtectedRoute = () => {
  const { accessToken, userId } = useContext(AccountContext);
  const { checkAuth } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const checkAuthorize = async () => {
    setIsAuthLoading(true);
    const response = await checkAuth();
    if (response) {
      setIsAuthLoading(false);
      setIsAuthorized(true);
    }
  };

  useEffect(() => {
    checkAuthorize();
  }, [accessToken]);

  if (isAuthLoading) {
    return (
      <S.LoadingWrapper>
        <LoadingWithText text="로그인 정보를 확인중이에요 :)" />
      </S.LoadingWrapper>
    );
  }

  if (!navigator.onLine) {
    return <Navigate to="/offline" replace />;
  }

  if (!isAuthLoading && !isAuthorized) {
    return <Navigate to="/signIn" replace />;
  }

  return (
    <UserContextProvider>
      <ChallengeContextProvider>
        <MediaPipeContextProvider>
          <Outlet />
        </MediaPipeContextProvider>
      </ChallengeContextProvider>
    </UserContextProvider>
  );
};

export default ProtectedRoute;

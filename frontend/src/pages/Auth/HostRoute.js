import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import {
  ChallengeContext,
  AccountContext,
  UserContextProvider,
  ChallengeContextProvider,
  MediaPipeContextProvider,
} from '../../contexts';

const HostRoute = () => {
  const { challengeData } = useContext(ChallengeContext);
  const { userId } = useContext(AccountContext);
  const isHost = userId === challengeData.hostId;

  if (!isHost) {
    return <Navigate to="/main" replace />;
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

export default HostRoute;

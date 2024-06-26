import React, { createContext, useState } from 'react';
import { authServices } from '../apis/authServices';

const AccountContext = createContext();

const AccountContextProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [userId, setUserId] = useState(null);

  const logOut = async () => {
    try {
      const response = await authServices.logOutUser({
        accessToken,
        userId,
      });
      if (response.status === 200) {
        setAccessToken(null);
        localStorage.removeItem('refreshToken');
        return true;
      }
    } catch (error) {
      console.error('Logout failed', error);
      return false;
    }
  };

  return (
    <AccountContext.Provider
      value={{
        setAccessToken,
        accessToken,
        setUserId,
        userId,
        logOut,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
};

export { AccountContext, AccountContextProvider };

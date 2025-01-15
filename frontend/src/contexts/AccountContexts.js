import React, { createContext, useState } from 'react';

const AccountContext = createContext();

const AccountContextProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [userId, setUserId] = useState(null);

  return (
    <AccountContext.Provider
      value={{
        setAccessToken,
        accessToken,
        setUserId,
        userId,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
};

export { AccountContext, AccountContextProvider };

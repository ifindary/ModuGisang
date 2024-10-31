import { useCallback } from 'react';

const useValidation = () => {
  const isValidEmail = useCallback(email => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  const isValidPassword = useCallback(password => {
    const passwordRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&~])[A-Za-z\d@$!%*?&~]{8,16}$/;
    return passwordRegex.test(password);
  }, []);

  return {
    isValidEmail,
    isValidPassword,
  };
};

export default useValidation;

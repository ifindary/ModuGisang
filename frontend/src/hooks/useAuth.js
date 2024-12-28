import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { authServices, userServices } from '../apis';
import { AccountContext } from '../contexts/AccountContexts';
import { ALERT_MESSAGES } from '../constants/Messages';
import useFetch from '../hooks/useFetch';
import useHandleError from '../hooks/useHandleError';

const useAuth = () => {
  const navigate = useNavigate();
  const handleError = useHandleError();

  const { fetchData } = useFetch();
  const { accessToken, setAccessToken, setUserId } = useContext(AccountContext);

  const refreshToken = localStorage.getItem('refreshToken');

  const refreshAuthorization = async () => {
    if (!refreshToken) {
      return false;
    }
    const response = await fetchData(() =>
      authServices.refreshAccessToken({
        accseeToken: accessToken,
        refreshToken: refreshToken,
      }),
    );
    const { isLoading, status, data, error } = response;

    if (!isLoading && status === 201) {
      setAccessToken(data.accessToken);
      setUserId(data.userId);
      return true;
    }

    if (!isLoading && error) {
      console.error(
        'Failed to refresh access token',
        'status: ',
        status,
        'error: ',
        error,
      );
      return false;
    }
  };

  const checkAuth = async () => {
    if (!navigator.onLine) {
      return navigate('/offline');
    }
    if (accessToken === null) {
      const isRefreshed = await refreshAuthorization();
      if (!isRefreshed) {
        alert(ALERT_MESSAGES.LOGIN_REQUIRED);
        navigate('/signIn');
      }
      return isRefreshed;
    }
    return true;
  };

  const handleCheckEmail = async ({
    e,
    email,
    setIsEmailChecked,
    setIsEmailCheckLoading,
  }) => {
    e.preventDefault();
    if (email === '') {
      alert(ALERT_MESSAGES.EMPTY_INPUTLINE);
      return;
    }
    setIsEmailCheckLoading(true);
    const response = await fetchData(() =>
      authServices.checkEmailAvailability({ email }),
    );

    const {
      isLoading: isEmailCheckLoading,
      status: emailCheckStatus,
      data: emailCheckData,
      error: emailCheckError,
    } = response;
    if (!isEmailCheckLoading && emailCheckData) {
      alert(ALERT_MESSAGES.EMAIL_AVAILABLE);
      setIsEmailChecked(true);
      setIsEmailCheckLoading(false);
    } else if (!isEmailCheckLoading && emailCheckError) {
      handleError(emailCheckError, emailCheckStatus);
      setIsEmailCheckLoading(false);
    }
  };

  const handleCheckVerifyCode = async ({
    e,
    verifyCode,
    email,
    setIsVerifyCodeCheckLoading,
    setIsVerifyCodeChecked,
  }) => {
    e.preventDefault();
    const trimmedVerifyCode = verifyCode.trim();
    if (trimmedVerifyCode === '' || trimmedVerifyCode === undefined) {
      alert(ALERT_MESSAGES.INVALID_CODE);
      return;
    }
    setIsVerifyCodeCheckLoading(true);
    const response = await fetchData(() =>
      authServices.verifyAuthCode({ verifyCode: trimmedVerifyCode, email }),
    );
    const {
      isLoading: isVerifyCodeCheckLoading,
      status: verifyCodeStatus,
      data: verifyCodeData,
      error: verifyCodeError,
    } = response;
    if (!isVerifyCodeCheckLoading && verifyCodeData) {
      setIsVerifyCodeCheckLoading(false);
      setIsVerifyCodeChecked(true);
      alert(ALERT_MESSAGES.VALID_CODE_SUCCESS);
    } else if (!isVerifyCodeCheckLoading && verifyCodeError) {
      setIsVerifyCodeCheckLoading(false);
      handleError(verifyCodeError, verifyCodeStatus);
    }
  };

  const handleSubmitSignUp = async ({
    e,
    email,
    password,
    userName,
    isEmailChecked,
    isVerifyCodeChecked,
    setIsSignUpLoading,
  }) => {
    e.preventDefault();
    if (email === '' || password === '' || userName === '') {
      alert(ALERT_MESSAGES.EMPTY_INPUTLINE);
      return;
    }
    if (!isEmailChecked) {
      alert(ALERT_MESSAGES.EMAIL_DUPLICATE_CHECK);
      return;
    }
    if (!isVerifyCodeChecked) {
      alert(ALERT_MESSAGES.VALID_CODE_CHECK);
    }
    setIsSignUpLoading(true);
    const response = await fetchData(() =>
      authServices.signUpUser({
        email,
        password,
        userName,
      }),
    );
    const {
      isLoading: isSignUpLoading,
      status: signUpStatus,
      data: signUpData,
      error: signUpError,
    } = response;
    if (!isSignUpLoading && signUpData) {
      setIsSignUpLoading(false);
      alert(ALERT_MESSAGES.SIGNUP_SUCCESS);
      navigate('/signIn');
    } else if (!isSignUpLoading && signUpError) {
      setIsSignUpLoading(false);
      handleError(signUpError, signUpStatus);
    }
  };

  const handleSubmitLogIn = async ({
    loginEmail,
    loginPassword,
    setIsLoginLoading,
  }) => {
    if (loginEmail === '' || loginPassword === '') {
      alert(ALERT_MESSAGES.EMPTY_INPUTLINE);
      return;
    }
    setIsLoginLoading(true);
    const response = await fetchData(() =>
      authServices.logInUser({
        email: loginEmail,
        password: loginPassword,
      }),
    );
    const {
      isLoading: isLoginLoading,
      status: loginStatus,
      data: loginData,
      error: loginError,
    } = response;
    if (!isLoginLoading && loginData) {
      setAccessToken(loginData.accessToken);
      localStorage.setItem('refreshToken', loginData.refreshToken);
      setUserId(loginData.userId);
      setIsLoginLoading(false);
      alert(ALERT_MESSAGES.LOGIN_SUCCESS);
      navigate('/');
    } else if (!isLoginLoading && loginError) {
      setIsLoginLoading(false);
      console.log(response);
      handleError(loginError, loginStatus);
    }
  };

  const handleSubmitLogout = async ({ setIsLogoutLoading, userId }) => {
    setIsLogoutLoading(true);
    const response = await fetchData(() =>
      authServices.logOutUser({ accessToken, userId }),
    );
    const { isLoading: isLogoutLoading, error: logoutError } = response;
    if (!isLogoutLoading) {
      setUserId(null);
      setAccessToken(null);
      setIsLogoutLoading(false);
      localStorage.removeItem('refreshToken');
      alert(ALERT_MESSAGES.LOGOUT_SUCCESS);
      navigate('/signIn');
    } else if (logoutError) {
      setIsLogoutLoading(false);
      alert(logoutError);
    }
  };

  const handleDeleteAccount = async ({
    e,
    password,
    setIsDeleteUserLoading,
  }) => {
    e.preventDefault();
    setIsDeleteUserLoading(true);
    const response = await fetchData(() =>
      authServices.deleteUser({ accessToken, password }),
    );
    const {
      isLoading: isDeleteUserLoading,
      status: deleteUserStatus,
      data: deleteUserData,
      error: deleteUserError,
    } = response;

    if (!isDeleteUserLoading && deleteUserData) {
      setIsDeleteUserLoading(false);
      alert(ALERT_MESSAGES.DELETE_USER_SUCCESS);
      navigate('/signIn');
    } else if (!isDeleteUserLoading && deleteUserError) {
      setIsDeleteUserLoading(false);
      handleError(deleteUserError, deleteUserStatus);
    }
  };

  const handleSendTmpPassword = async ({
    email,
    setIsPasswordResetLoading,
  }) => {
    if (email === '') {
      throw new Error('이메일을 입력해주세요.');
    }

    setIsPasswordResetLoading(true);

    const response = await fetchData(() =>
      authServices.sendTmpPassword({ email }),
    );

    const {
      isLoading: isPasswordResetLoading,
      status: passwordResetStatus,
      data: passwordResetData,
      error: passwordResetError,
    } = response;

    if (!isPasswordResetLoading && passwordResetData) {
      setIsPasswordResetLoading(false);
      return '임시 비밀번호가 이메일로 전송되었습니다.';
    } else if (!isPasswordResetLoading && passwordResetError) {
      setIsPasswordResetLoading(false);

      if (passwordResetStatus === 404) {
        throw new Error('가입되지 않은 이메일입니다.');
      } else {
        throw new Error(
          `임시 비밀번호 발송에 실패했습니다. ${passwordResetError}`,
        );
      }
    }
  };

  const handleChangePassword = async ({
    e,
    currentPassword,
    newPassword,
    setIsChangeLoading,
  }) => {
    e.preventDefault();

    setIsChangeLoading(true);

    const passwordChangeResponse = await fetchData(() =>
      userServices.changePassword({
        accessToken,
        newPassword,
        currentPassword,
      }),
    );

    const {
      isLoading: isPasswordChangeLoading,
      status: passwordChangeStatus,
      data: passwordChangeData,
      error: passwordChangeError,
    } = passwordChangeResponse;

    if (!isPasswordChangeLoading && passwordChangeData) {
      setIsChangeLoading(false);
      alert(ALERT_MESSAGES.PASSWORD_CHANGE_SUCCESS);
      navigate('/settings');
    } else if (!isPasswordChangeLoading && passwordChangeError) {
      setIsChangeLoading(false);
      handleError(passwordChangeError, passwordChangeStatus);
    }
  };

  return {
    refreshAuthorization,
    checkAuth,
    handleCheckEmail,
    handleCheckVerifyCode,
    handleSubmitSignUp,
    handleSubmitLogIn,
    handleSubmitLogout,
    handleDeleteAccount,
    handleSendTmpPassword,
    handleChangePassword,
  };
};

export default useAuth;

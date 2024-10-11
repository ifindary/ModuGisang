import React from 'react';
import { Capacitor } from '@capacitor/core';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GameContextProvider, OpenViduContextProvider } from './contexts';
import { Signin, Signup, ForgotPassword, ProtectedRoute } from './pages/Auth';
import { PageNotFound } from './components';
import {
  Main,
  InGame,
  MyStreak,
  CreateChallenge,
  JoinChallenge,
  Settings,
  PrivacyPolicy,
  TermsOfService,
  CustomerService,
  DeleteUser,
  ChangePassword,
  About,
} from './pages';

import { SafeAreaProvider } from './contexts/SafeAreaContext'; // SafeAreaProvider 추가
import SafeArea from './styles/SafeArea'; // SafeAreaWrapper를 가져옴

const PlatformSafeArea = ({ children }) => {
  const platform = Capacitor.getPlatform();

  if (platform === 'ios') {
    return <SafeArea>{children}</SafeArea>;
  }

  // web이나 다른 플랫폼의 경우 SafeArea를 적용하지 않음
  return <>{children}</>;
};

function Router() {
  return (
    <BrowserRouter>
      <SafeAreaProvider>
        <Routes>
          <Route path="/signIn" element={<Signin />} />
          <Route
            path="/signUp"
            element={
              <SafeArea>
                <Signup />
              </SafeArea>
            }
          />
          <Route
            path="/privacyPolicy"
            element={
              <SafeArea>
                <PrivacyPolicy />
              </SafeArea>
            }
          />
          <Route
            path="/termsOfService"
            element={
              <SafeArea>
                <TermsOfService />
              </SafeArea>
            }
          />
          <Route
            path="/customerService"
            element={
              <SafeArea>
                <CustomerService />
              </SafeArea>
            }
          />
          <Route
            path="/deleteUser"
            element={
              <SafeArea>
                <DeleteUser />
              </SafeArea>
            }
          />
          <Route
            path="/forgotPassword"
            element={
              <SafeArea>
                <ForgotPassword />
              </SafeArea>
            }
          />
          <Route path="/about" element={<About />} />
          <Route element={<ProtectedRoute />}>
            <Route
              path="/"
              element={
                <PlatformSafeArea>
                  <Main />
                </PlatformSafeArea>
              }
            />
            <Route
              path="/main"
              element={
                <PlatformSafeArea>
                  <Main />
                </PlatformSafeArea>
              }
            />
            <Route
              path="/myStreak"
              element={
                <PlatformSafeArea>
                  <MyStreak />
                </PlatformSafeArea>
              }
            />
            <Route
              path="/joinChallenge"
              element={
                <PlatformSafeArea>
                  <JoinChallenge />
                </PlatformSafeArea>
              }
            />
            <Route
              path="/createChallenge"
              element={
                <PlatformSafeArea>
                  <CreateChallenge />
                </PlatformSafeArea>
              }
            />
            <Route
              path="/startMorning"
              element={
                <GameContextProvider>
                  <OpenViduContextProvider>
                    <PlatformSafeArea>
                      <InGame />
                    </PlatformSafeArea>
                  </OpenViduContextProvider>
                </GameContextProvider>
              }
            />
            <Route
              path="/settings"
              element={
                <PlatformSafeArea>
                  <Settings />
                </PlatformSafeArea>
              }
            />
            <Route
              path="/changePassword"
              element={
                <SafeArea>
                  <ChangePassword />
                </SafeArea>
              }
            />
          </Route>
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </SafeAreaProvider>
    </BrowserRouter>
  );
}

export default Router;

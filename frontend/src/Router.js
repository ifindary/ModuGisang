import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import {
  GameContextProvider,
  OpenViduContextProvider,
  SafeAreaContextProvider,
} from './contexts';
import { Signin, Signup, ForgotPassword, ProtectedRoute } from './pages/Auth';
import { PageNotFound, OfflinePage } from './components';
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

import SafeAreaLayout from './components/SafeArea';

function Router() {
  return (
    <BrowserRouter>
      <SafeAreaContextProvider>
        <SafeAreaLayout>
          <Routes>
            <Route path="/signIn" element={<Signin />} />
            <Route path="/signUp" element={<Signup />} />
            <Route path="/privacyPolicy" element={<PrivacyPolicy />} />
            <Route path="/termsOfService" element={<TermsOfService />} />
            <Route
              path="/customerService"
              element={
                <SafeAreaLayout>
                  <CustomerService />
                </SafeAreaLayout>
              }
            />
            <Route path="/deleteUser" element={<DeleteUser />} />
            <Route path="/forgotPassword" element={<ForgotPassword />} />
            <Route path="/about" element={<About />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Main />} />
              <Route path="/main" element={<Main />} />
              <Route path="/myStreak" element={<MyStreak />} />
              <Route path="/joinChallenge" element={<JoinChallenge />} />
              <Route path="/createChallenge" element={<CreateChallenge />} />
              <Route
                path="/startMorning"
                element={
                  <GameContextProvider>
                    <OpenViduContextProvider>
                      <InGame />
                    </OpenViduContextProvider>
                  </GameContextProvider>
                }
              />
              <Route path="/settings" element={<Settings />} />
              <Route path="/changePassword" element={<ChangePassword />} />
            </Route>
            <Route path="/offline" element={<OfflinePage />} />
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </SafeAreaLayout>
      </SafeAreaContextProvider>
    </BrowserRouter>
  );
}

export default Router;

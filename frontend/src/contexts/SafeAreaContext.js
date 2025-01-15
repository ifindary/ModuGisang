import React, { createContext, useState, useEffect } from 'react';
import { Device } from '@capacitor/device';

import { css } from 'styled-components';

const SafeAreaContext = createContext();

const SafeAreaContextProvider = ({ children }) => {
  const [platform, setPlatform] = useState('web');
  const [model, setModel] = useState(null);
  const [safeAreaPadding, setSafeAreaPadding] = useState('0 24px');
  const [isSmallModel, setIsSmallModel] = useState(false);

  const getDeviceInfo = async () => {
    const response = await Device.getInfo();
    if (response) {
      const { model: deviceModel, platform: devicePlatform } = response;
      setModel(deviceModel);
      setPlatform(devicePlatform);
      calculatePadding(devicePlatform, deviceModel);
    } else {
      console.error(
        'Error fetching device info:',
        response.error || 'Unknown error',
      );
    }
  };

  const calculatePadding = (platform, model) => {
    if (platform === 'ios') {
      const isSmallModel =
        model?.includes('iPhone12,8') ||
        model?.includes('iPhone14,6') ||
        model?.includes('iPad');
      setSafeAreaPadding(
        isSmallModel ? '24px 24px 12px 24px' : '59px 24px 72px 24px',
      );
      setIsSmallModel(isSmallModel);
    } else {
      setSafeAreaPadding('0 24px');
      setIsSmallModel(false);
    }
  };

  const getGridStyles = hasMate =>
    hasMate &&
    css`
      display: grid;
      grid-template-rows: auto 150px;
      gap: 10px;
    `;

  const getPadding = ($hasMate, $platform, $isSmallModel) => {
    if ($hasMate) {
      if ($platform === 'web') {
        return '104px 24px 0px 24px';
      }
      return $isSmallModel ? '104px 24px 0px 24px' : '75px 24px 0px 24px';
    }
    if ($platform === 'web') {
      return '104px 24px 30px 24px';
    }
    return $isSmallModel ? '104px 24px 30px 24px' : '75px 24px 30px 24px';
  };

  useEffect(() => {
    getDeviceInfo();
  }, []);

  return (
    <SafeAreaContext.Provider
      value={{
        platform,
        model,
        safeAreaPadding,
        isSmallModel,
        getGridStyles,
        calculatePadding,
        getPadding,
      }}
    >
      {children}
    </SafeAreaContext.Provider>
  );
};

export { SafeAreaContext, SafeAreaContextProvider };

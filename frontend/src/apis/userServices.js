import axios from 'axios';
import { CONFIGS } from '../config';

const API = axios.create({
  baseURL: CONFIGS.BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const getMyInfo = async ({ accessToken }) => {
  const url = `/user/me`;
  const config = {
    headers: { Authorization: `Bearer ${accessToken}` },
  };
  return API.get(url, config);
};

const getUserInfo = async ({ accessToken, userId }) => {
  const url = `/user/${userId}`;
  const config = {
    headers: { Authorization: `Bearer ${accessToken}` },
  };
  return API.get(url, config);
};

const changeAffirmation = async ({ accessToken, affirmation, userId }) => {
  const url = `/user/${userId}/update-affirm`;
  const payload = {
    affirmation: affirmation,
  };
  const config = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };
  return API.post(url, payload, config);
};

const changeWakeTime = async ({
  accessToken,
  wakeTime,
  userId,
  challengeId,
}) => {
  const url = `/challenge/changeWakeTime`;
  const payload = {
    wakeTime: wakeTime,
    userId: userId,
    challengeId: Number(challengeId),
  };
  const config = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };
  return API.post(url, payload, config);
};

export const userServices = {
  getMyInfo,
  getUserInfo,
  changeAffirmation,
  changeWakeTime,
};

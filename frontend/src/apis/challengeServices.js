import axios from 'axios';
import { CONFIGS } from '../config';

const API = axios.create({
  baseURL: CONFIGS.BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const getChallengeInfo = async ({ accessToken, challengeId }) => {
  const url = '/challenge';
  const config = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    params: {
      challengeId: challengeId,
    },
  };
  return await API.get(url, config);
};

const getInvitationInfo = async ({ accessToken, userId }) => {
  const url = '/challenge/invitations';
  const config = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    params: {
      guestId: userId,
    },
  };

  return await API.get(url, config);
};

const acceptInvitation = async ({ accessToken, challengeId, userId }) => {
  const url = '/challenge/accept-invitation';
  const payload = {
    challengeId: challengeId,
    guestId: userId,
  };
  const config = {
    headers: { Authorization: `Bearer ${accessToken}` },
  };
  return await API.post(url, payload, config);
};

const createChallenge = async ({ accessToken, newChallengeData }) => {
  const url = '/challenge/create';
  const payload = {
    hostId: newChallengeData.hostId,
    duration: newChallengeData.duration,
    startDate: newChallengeData.startDate,
    wakeTime: newChallengeData.wakeTime,
    mates: newChallengeData.mates,
  };
  const config = {
    headers: { Authorization: `Bearer ${accessToken}` },
  };
  return await API.post(url, payload, config);
};

const checkMateAvailability = async ({ accessToken, email }) => {
  const url = '/challenge/search-mate';
  const config = {
    params: { email: email },
    headers: { Authorization: `Bearer ${accessToken}` },
  };
  return await API.get(url, config);
};

const getCallendarInfo = async ({ accessToken, userId, month }) => {
  const url = `/challenge/calendar/${userId}/${month}`;
  const config = {
    headers: { Authorization: `Bearer ${accessToken}` },
  };
  return await API.get(url, config);
};

const getCallendarInfoByDate = async ({ accessToken, userId, date }) => {
  const url = `/challenge/${userId}/results/${date}`;
  const config = {
    headers: { Authorization: `Bearer ${accessToken}` },
  };
  return await API.get(url, config);
};

const getConnectionToken = async ({ accessToken, userData }) => {
  const url = '/start-session';

  const config = {
    headers: { Authorization: `Bearer ${accessToken}` },
  };
  return API.post(url, { userData }, config);
};

export const challengeServices = {
  getChallengeInfo,
  createChallenge,
  checkMateAvailability,
  getInvitationInfo,
  acceptInvitation,
  getCallendarInfo,
  getCallendarInfoByDate,
  getConnectionToken,
};

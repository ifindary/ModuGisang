import React, {
  createContext,
  useState,
  useRef,
  useEffect,
  useContext,
} from 'react';
import { UserContext, GameContext, AccountContext } from './';
import useFetch from '../hooks/useFetch';
import { challengeServices } from '../apis';
import { OpenVidu } from 'openvidu-browser';

const OpenViduContext = createContext();

const OpenViduContextProvider = ({ children }) => {
  const { fetchData } = useFetch();
  const { accessToken } = useContext(AccountContext);
  const { myData, challengeId } = useContext(UserContext);
  const {
    inGameMode,
    setIsMyReadyStatusSent,
    setMatesReadyStatus,
    myMissionStatus,
    setMatesMissionStatus,
  } = useContext(GameContext);

  const { userId, userName } = myData;

  const [OVInstance, setOVInstance] = useState(null); // OpenVidu 객체
  const [videoSession, setVideoSession] = useState(null);
  const [connectionToken, setConnectionToken] = useState('');
  const myVideoRef = useRef(null);
  const [myStream, setMyStream] = useState(null);
  const mateVideoRefs = useRef({});
  const [mateStreams, setMateStreams] = useState([]);
  const [micOn, setMicOn] = useState(true);

  const getConnectionToken = async () => {
    const userData = {
      challengeId: challengeId,
      userId,
      userName,
    };

    const response = await fetchData(() =>
      challengeServices.getConnectionToken({
        accessToken,
        userData,
      }),
    );

    const { isLoading, data } = response;
    if (!isLoading && data) {
      setConnectionToken(data.token);
    } else {
      console.error('Failed to get connection token', response);
    }
  };

  const turnMicOnOff = () => {
    myStream?.publishAudio(!micOn);
    setMicOn(prev => !prev);
  };

  const sendModelLoadingStart = async () => {
    try {
      videoSession
        .signal({
          data: JSON.stringify({ userId, start: true }),
          to: [],
          type: 'modelLoadingStart',
        })
        .then(() => {})
        .catch(error => {
          console.error(error);
        });
    } catch (e) {
      console.error('Error occured while sending model loading start', e);
    }
  };

  const sendMyReadyStatus = async () => {
    try {
      videoSession
        .signal({
          data: JSON.stringify({ userId, ready: true }),
          to: [],
          type: 'readyToStartGame',
        })
        .then(() => {
          setIsMyReadyStatusSent(true);
        })
        .catch(error => {
          console.error(error);
          setIsMyReadyStatusSent(false);
        });
    } catch (e) {
      console.error('Error occured while sending my model ready status', e);
    }
  };

  const sendMissionStatus = async () => {
    try {
      videoSession
        .signal({
          data: JSON.stringify({ userId, missionCompleted: myMissionStatus }),
          to: [],
          type: 'missionStatus',
        })
        .then(() => {})
        .catch(error => {
          console.error(error);
        });
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!challengeId) return;
    getConnectionToken();
  }, [challengeId]);

  useEffect(() => {
    if (!connectionToken) return;

    const OV = new OpenVidu();
    const newSession = OV.initSession();

    setOVInstance(OV);
    setVideoSession(newSession);
  }, [connectionToken]);

  useEffect(() => {
    if (!videoSession) return;

    videoSession.on('streamCreated', event => {
      const mateStream = videoSession.subscribe(event.stream, undefined);
      setMateStreams(prev => [...prev, mateStream]);
    });

    videoSession.on('streamDestroyed', event => {
      const thisStream = event.stream.streamManager;
      setMateStreams(prev =>
        prev.filter(mateStream => mateStream !== thisStream),
      );
    });

    videoSession.on('exception', exception => {
      console.warn(exception);
    });

    videoSession.on('signal:modelLoadingStart', event => {
      const data = JSON.parse(event.data);
      setMatesReadyStatus(prev => ({
        ...prev,
        [data.userId]: { ready: false },
      }));
    });

    videoSession.on('signal:readyToStartGame', event => {
      const data = JSON.parse(event.data);
      setMatesReadyStatus(prev => ({
        ...prev,
        [data.userId]: { ready: data.ready },
      }));
    });

    videoSession.on('signal:missionStatus', event => {
      const data = JSON.parse(event.data);
      setMatesMissionStatus(prev => ({
        ...prev,
        [data.userId]: { missionCompleted: data.missionCompleted },
      }));
    });

    const initPublisher = async () => {
      const publisher = await OVInstance.initPublisherAsync(undefined, {
        audioSource: undefined,
        videoSource: undefined,
        publishAudio: true,
        publishVideo: true,
        resolution: '340x480',
        frameRate: 30,
        mirror: false,
      });

      videoSession.publish(publisher);
      setMyStream(publisher);
    };

    // 세션 연결
    videoSession.connect(connectionToken).then(async () => {
      try {
        await initPublisher();
      } catch (error) {
        console.error('/// Connecting OV error:', error);
      }
    });

    return () => {
      if (videoSession) {
        videoSession?.off('streamCreated');
        videoSession?.disconnect();
      }
      if (myStream) {
        myStream?.dispose();
        mateStreams?.forEach(stream => stream.dispose());
      }
    };
  }, [videoSession]);

  useEffect(() => {
    if (videoSession?.connection) {
      sendMissionStatus();
    }
  }, [videoSession, myMissionStatus]);

  return (
    <OpenViduContext.Provider
      value={{
        getConnectionToken,
        videoSession,
        micOn,
        turnMicOnOff,
        myVideoRef,
        myStream,
        setMyStream,
        mateVideoRefs,
        mateStreams,
        sendModelLoadingStart,
        sendMyReadyStatus,
        sendMissionStatus,
        setMicOn,
      }}
    >
      {children}
    </OpenViduContext.Provider>
  );
};

export { OpenViduContext, OpenViduContextProvider };

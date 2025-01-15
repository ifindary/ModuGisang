import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LongBtn } from './';
import * as S from '../styles/common';

const OfflinePage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleOnline = () => {
      navigate('/main');
    };

    window.addEventListener('online', handleOnline);

    if (navigator.onLine) {
      navigate('/main');
    }

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [navigate]);

  return (
    <S.PageWrapper>
      인터넷이 연결되어 있지 않습니다. 네트워크를 확인해주세요.
      <LongBtn
        btnName="새로고침"
        onClickHandler={() => window.location.reload()}
      />
    </S.PageWrapper>
  );
};

export default OfflinePage;

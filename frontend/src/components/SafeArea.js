import styled from 'styled-components';

import { SafeAreaContext } from '../contexts';
import { useContext } from 'react';

const SafeAreaLayout = ({ children }) => {
  const { platform, isSmallModel } = useContext(SafeAreaContext);
  if (platform === 'ios' && !isSmallModel) {
    return <SafeAreaWrapper>{children}</SafeAreaWrapper>;
  } else {
    return <>{children}</>;
  }
};

const SafeAreaWrapper = styled.div`
  padding-top: 59px;
  height: 100%;
  width: 100%;
  box-sizing: border-box;
`;

export default SafeAreaLayout;

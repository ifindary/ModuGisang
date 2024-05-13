import React from 'react';
import styled from 'styled-components';

const LongBtn = ({ btnName, onClickHandler }) => {
  return (
    <Wrapper
      onClick={e => {
        e.preventDefault();
        e.stopPropagation();
        onClickHandler(e);
      }}
    >
      {btnName}
    </Wrapper>
  );
};

export default LongBtn;

const Wrapper = styled.button`
  width: 100px;
  padding: 10px;
  background-color: ${({ theme }) => theme.colors.primary.emerald};
  border-radius: 5px;

  cursor: pointer;
`;

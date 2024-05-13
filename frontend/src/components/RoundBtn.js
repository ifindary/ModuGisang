import React from 'react';
import Icon from './Icon';
import styled, { css } from 'styled-components';

const btnStyleSample = {
  size: 24,
  disabled: false,
  icon: 'back',
  iconStyle: {
    size: 24,
    color: 'purple',
    hoverColor: 'white',
  },
};

const RoundBtn = ({ btnStyle, onClickHandler }) => {
  const { icon, iconStyle } = btnStyle;

  return (
    <Wrapper
      $btnStyle={btnStyle}
      onClick={e => {
        e.preventDefault();
        e.stopPropagation();

        if (onClickHandler) {
          onClickHandler(e);
        }
      }}
    >
      <IconWrapper>
        <Icon icon={icon} iconStyle={iconStyle} />
      </IconWrapper>
    </Wrapper>
  );
};

export default RoundBtn;

const Wrapper = styled.button`
  ${({ theme }) => theme.flex.center}

  width: ${({ $btnStyle }) => $btnStyle.size || 50}px;
  height: ${({ $btnStyle }) => $btnStyle.size || 50}px;

  border-radius: 50%;

  background-color: ${({ theme }) => theme.colors.translucent.white};

  cursor: ${({ $btnStyle }) => ($btnStyle.disabled ? 'default' : 'pointer')};
`;

const IconWrapper = styled.div`
  margin-bottom: -2px;
`;

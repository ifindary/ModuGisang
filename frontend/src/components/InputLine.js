import React, { forwardRef } from 'react';
import styled from 'styled-components';
import Icon from './Icon';

const InputLine = forwardRef(
  (
    {
      hasIcon,
      type,
      icon,
      iconStyle,
      value,
      onChange,
      onKeyDown,
      onFocus,
      onBlur,
      onClickHandler,
      disabled,
    },
    ref,
  ) => {
    return (
      <Wrapper>
        <InputBox
          ref={ref}
          type={type}
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          onFocus={onFocus}
          onBlur={onBlur}
          onTouchStart={onFocus}
          onMouseDown={onFocus}
          disabled={disabled}
        />
        {hasIcon ? (
          <IconBox onClick={onClickHandler}>
            <Icon icon={icon} iconStyle={iconStyle} />
          </IconBox>
        ) : null}
      </Wrapper>
    );
  },
);

export default InputLine;

const Wrapper = styled.label`
  position: relative;
  width: 100%;
`;

const InputBox = styled.input`
  width: 100%;
  background-color: ${({ theme }) => theme.colors.translucent.lightNavy};
  border-radius: 20px;
  border: 1px solid ${({ theme }) => theme.colors.primary.purple};
  ${({ theme }) => theme.fonts.IBMsmall};
  color: ${({ theme }) => theme.colors.primary.white};
  padding: 15px;

  &:focus {
    outline: none;
    border: 1px solid ${({ theme }) => theme.colors.primary.purple};
    background-color: ${({ theme }) => theme.colors.translucent.white};
  }
  &:disabled {
    background-color: ${({ theme }) => theme.colors.neutral.lightGray};
  }
`;

const IconBox = styled.div`
  color: white;
  position: absolute;
  top: 8px;
  right: 5px;
  padding: 2px 5px;
`;

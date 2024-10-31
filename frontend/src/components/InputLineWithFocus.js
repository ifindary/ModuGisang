import React from 'react';
import styled from 'styled-components';
import Icon from './Icon';

const InputLineWithFocus = ({
  hasIcon,
  type,
  icon,
  iconStyle,
  value,
  onChange,
  onKeyDown,
  onFocus, // onFocus prop 추가
  onBlur, // onBlur prop 추가
  onClickHandler,
  disabled,
}) => {
  return (
    <Wrapper>
      <InputBox
        type={type}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onFocus={onFocus} // onFocus 이벤트 처리
        onBlur={onBlur} // onBlur 이벤트 처리
        onTouchStart={onFocus} // 터치 시작 시 포커스 처리
        onMouseDown={onFocus} // 마우스 클릭 시 포커스 처리
        disabled={disabled}
      />
      {hasIcon ? (
        <IconBox onClick={onClickHandler}>
          <Icon icon={icon} iconStyle={iconStyle} />
        </IconBox>
      ) : null}
    </Wrapper>
  );
};

export default InputLineWithFocus;

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
    outline: none; // 기본 포커스 테두리 제거
    border: 1px solid ${({ theme }) => theme.colors.primary.purple}; // 포커스 시 새로운 테두리 색상 적용
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

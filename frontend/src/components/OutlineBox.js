import React from 'react';
import styled, { css } from 'styled-components';

const boxStyleSample = {
  isBold: false,
  lineColor: 'white', // 특정 컬러이름 || 그라데이션 => 'gradient'
  // 각 박스의 background-color는 content 각 컴포넌트에서 설정
  // border-radius도 각 content에서 설정 필요
};

const headerSample = {
  text: '일자별 기록',
  style: {
    font: 'IBMmedium',
    fontColor: 'white',
    bgColor: 'purple',
    hasBackground: false, // 배경색이 채워져 있으면 true, 선만 있으면 false
  },
};

const OutlineBox = ({ boxStyle, header, content, onClickHandler }) => {
  const isClickable = !!onClickHandler;

  return (
    <Wrapper
      onClick={e => {
        if (!isClickable) return;

        e.preventDefault();
        e.stopPropagation();

        onClickHandler(e);
      }}
      $boxStyle={boxStyle}
      $isClickable={isClickable}
    >
      {header !== undefined && (
        <Header $headerStyle={header?.style}>{header?.text}</Header>
      )}

      {content}
    </Wrapper>
  );
};

export default OutlineBox;

const Wrapper = styled.div`
  position: relative;
  width: 100%;
  height: max-content;

  cursor: ${({ $isClickable }) => ($isClickable ? 'pointer' : 'default')};

  ::before {
    ${({ $boxStyle }) =>
      $boxStyle?.lineColor === 'gradient' &&
      css`
        content: '';
        position: absolute;
        inset: 0;
        border-radius: ${({ theme }) => theme.radius.medium};
        border: ${({ $boxStyle }) => ($boxStyle?.isBold ? '3px' : '1px')} solid
          transparent;
        background: ${({ theme }) => theme.gradient.largerPurple} border-box;
        mask:
          linear-gradient(#fff 0 0) padding-box,
          linear-gradient(#fff 0 0);
        mask-composite: exclude;
      `}
  }

  ${({ $boxStyle }) =>
    $boxStyle?.lineColor === 'gradient' ||
    css`
      border-color: ${({ theme, $boxStyle }) =>
        theme.colors.primary[$boxStyle?.lineColor]};
      border-width: ${({ $boxStyle }) => ($boxStyle?.isBold ? '3px' : '1px')};
      border-style: solid;
      border-radius: ${({ theme }) => theme.radius.medium};
    `};
`;

const Header = styled.div`
  padding: 20px;
  align-self: center;
  justify-self: center;
  text-align: center;

  border-radius: 25px 25px 0 0;

  ${({ theme, $headerStyle }) => theme.fonts[$headerStyle?.font]};

  color: ${({ $headerStyle, theme }) =>
    $headerStyle && theme.colors.primary[$headerStyle?.fontColor]};

  background-color: ${({ $headerStyle, theme }) =>
    $headerStyle?.hasBackground && theme.colors.primary[$headerStyle?.bgColor]};

  border: ${({ theme, $headerStyle }) =>
    $headerStyle?.hasBackground ||
    `3px solid ${theme.colors.primary[$headerStyle?.bgColor]}`};
`;

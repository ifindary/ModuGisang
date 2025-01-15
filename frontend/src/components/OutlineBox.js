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

const footerSample = {
  text: '더보기',
  style: {
    font: 'IBMmedium',
    fontColor: 'purple',
  },
};

const OutlineBox = ({
  boxStyle,
  header,
  content,
  footer,
  footerContent,
  onClickHandler,
}) => {
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

      {footer !== undefined && (
        <Footer $footerStyle={footer?.style}>{footerContent}</Footer>
      )}
    </Wrapper>
  );
};

export default OutlineBox;

const Wrapper = styled.div`
  position: relative;
  width: 100%;
  height: max-content;
  background: rgba(240, 243, 255, 0.06);
  border-radius: ${({ $boxStyle, theme }) =>
    $boxStyle?.borderRadius || theme.radius.medium};
  backdrop-filter: blur(10px);

  cursor: ${({ $isClickable }) => ($isClickable ? 'pointer' : 'default')};

  ::before {
    ${({ $boxStyle }) =>
      $boxStyle?.lineColor === 'gradient' &&
      css`
        content: '';
        position: absolute;
        inset: 0;
        border-radius: ${({ $boxStyle, theme }) =>
          $boxStyle?.borderRadius || theme.radius.medium};
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
      border-radius: ${({ $boxStyle, theme }) =>
        $boxStyle?.borderRadius || theme.radius.medium};
    `};
`;

const Header = styled.div`
  width: 100%;
  padding: 12px;
  align-self: center;
  justify-self: center;
  text-align: center;

  border-radius: ${({ theme, $headerStyle }) =>
    $headerStyle?.borderRadius || `30px 30px 0 0`};

  ${({ theme, $headerStyle }) => theme.fonts[$headerStyle?.font]};

  color: ${({ $headerStyle, theme }) =>
    $headerStyle && theme.colors.primary[$headerStyle?.fontColor]};

  background-color: ${({ $headerStyle, theme }) =>
    $headerStyle?.hasBackground && theme.colors.primary[$headerStyle?.bgColor]};

  border: ${({ theme, $headerStyle }) =>
    $headerStyle?.hasBackground ||
    `1px solid ${theme.colors.primary[$headerStyle?.bgColor]}`};
`;

const Footer = styled.div`
  width: 100%;
  padding: 12px;
  align-self: center;
  justify-self: center;
  text-align: center;

  border-radius: ${({ theme, $footerStyle }) =>
    $footerStyle?.borderRadius || `0 0 30px 30px`};

  ${({ theme, $footerStyle }) => theme.fonts[$footerStyle?.font]};

  color: ${({ $footerStyle, theme }) =>
    $footerStyle && theme.colors.primary[$footerStyle?.fontColor]};

  background-color: ${({ $footerStyle, theme }) =>
    $footerStyle?.hasBackground && theme.colors.primary[$footerStyle?.bgColor]};

  border: ${({ theme, $footerStyle }) =>
    $footerStyle?.hasBackground ||
    `1px solid ${theme.colors.primary[$footerStyle?.bgColor]}`};
`;

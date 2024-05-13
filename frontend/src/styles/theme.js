import { css } from 'styled-components';

const colors = {
  primary: {
    white: '#F0F3FF',
    purple: '#836FFF',
    emerald: '#15F5BA',
    navy: '#0D0A2D',
  },
  translucent: {
    white: 'rgb(240, 243, 255, 0.2)',
    navy: 'rgb(13, 10, 45, 0.72)',
    lightNavy: 'rgb(13, 10, 45, 0.2)',
  },
  neutral: {
    gray: '#757575',
    lightGray: '#bdbdbd',
  },
  system: {
    green: '#00FF0F',
    red: '#FF008F',
    yellow: '#FFC500',
    white: '#ffffff',
    black: '#000000',
  },
};

const fonts = {
  JuaLarge: css`
    font: 80px 'Jua';
    line-height: 80px;
    letter-spacing: -6%;
  `,
  JuaMedium: css`
    font: 40px 'Jua';
    line-height: 40px;
    letter-spacing: -2%;
  `,
  JuaSmall: css`
    font: 23px 'Jua';
    line-height: 30px;
    letter-spacing: -2.5%;
  `,
  IBMlarge: css`
    font: 24px 'IBM Plex Sans KR';
    line-height: 34px;
    letter-spacing: -2.5%;
  `,
  IBMmedium: css`
    font: 18px 'IBM Plex Sans KR';
    line-height: 0px;
    letter-spacing: -2.5%;
  `,
  IBMsmall: css`
    font: 16px 'IBM Plex Sans KR';
    line-height: 18px;
    letter-spacing: -2.5%;
  `,
  warning: css`
    font: 300 15px 'Noto Sans KR';
    color: ${({ theme }) => theme.colors.system.yellow};
  `,
  error: css`
    font: 300 15px 'Noto Sans KR';
    color: ${({ theme }) => theme.colors.system.red};
  `,
};

const radius = {
  small: '20px',
  medium: '30px',
  large: '40px',
};

const flex = {
  center: css`
    display: flex;
    justify-content: center;
    align-items: center;
  `,
  left: css`
    display: flex;
    justify-content: flex-start;
    align-items: center;
  `,
  right: css`
    display: flex;
    justify-content: flex-end;
    align-items: center;
  `,
  between: css`
    display: flex;
    justify-content: space-between;
    align-items: center;
  `,
};

const boxShadow = css`
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
`;

const gradient = {
  largerPurple: 'linear-gradient(160deg, #836fff, #15f5ba)',
  largerEmerald: 'linear-gradient(135deg, #836fff, #15f5ba)',
  onlyEmerald: 'linear-gradient(180deg, #ebebeb, #15f5ba)',
  translucentGray:
    'linear-gradient(30deg, rbga(0, 0, 0, 0.05), rgba(0, 0, 0, 0.05))',
};

const theme = {
  colors,
  fonts,
  radius,
  flex,
  boxShadow,
  gradient,
};

export default theme;

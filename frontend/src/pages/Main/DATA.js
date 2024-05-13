export const GREETINGS = ['안녕하세요, ', '님!'];

export const CARD_TYPES = {
  hasChallenge: ['streak', 'challenge', 'enter'],
  noChallenge: ['streak', 'invitations', 'create'],
};

export const CARD_STYLES = {
  streak: {
    isBold: true,
    lineColor: 'gradient',
  },
  challenge: {
    isBold: true,
    lineColor: 'purple',
  },
  invitations: { isBold: true, lineColor: 'purple' },
  create: { isBold: true, lineColor: 'gradient' },
  enter: { isBold: true, lineColor: 'gradient' },
};

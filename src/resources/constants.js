const {PlatformColor} = require('react-native');
const {SIZES, COLORS} = require('./theme');

/* eslint-disable prettier/prettier */
const constants = {
  APP_NAME: 'INFAPP',
  APP_VERSION: '0.0.1',

  MUX_USERNAME: '36bbe382-6820-4a76-b0be-f7e3a6e46564',
  MUX_PASSWORD:
    '5yq6+WeOBEfgiFapSIQhl8/6qurYypyUER9irR6DMGwIP1JPdh4kkG3tan+LaokI1BtvLnOpAyD',
  MUX_BASE_URL: 'https://api.mux.com',

  //BACKGROUND_COLOR: '#0a0b09',
  BACKGROUND_COLOR: COLORS.backgroundColor,
  //BAR_COLOR: '#333333',
  BAR_COLOR: COLORS.secondaryBackgroundColor,
  BLUE: '#0a84ff',
  RED: '#FF5733',
  TRANSPARENT_BLACK_COLOR: '#00000041',
  PAGE_LEFT_PADDING: SIZES.spacing * 2,
  PROFILE_PIC_SIZE: 100,
  DEFAULT_PAGE_WIDTH: '95%',
  ERROR_ALERT_MSG: 'Something unexpected happened. Please try again later.',

  DEFAULT_PHOTO:
    'http://newgatehotel.com/wp-content/plugins/all-in-one-seo-pack/images/default-user-image.png',
  USER_PHOTO_THUMB_URL:
    'https://firebasestorage.googleapis.com/v0/b/backstage-ceb27.appspot.com/o/users%2Fthumbs%2F',
  VIDEO_THUMB_URL:
    'https://firebasestorage.googleapis.com/v0/b/backstage-ceb27.appspot.com/o/thumbnails%2Fthumbs%2F',

  DEALS_LIMIT: 5,
  NUM_POSTS_PER_ROW_PROFILE: 2,

  NUM_CARDS_IN_SCREEN: 2.5,
  NUM_POSTS_TO_VIEW_IN_HOME: 3,

  STREAM_API_KEY: 'qhfvewj4k2zp',
  STREAM_API_SECRET: 'ufw2m72mvr5cx8andn3ezk8ay9vhcy9aehywaujgptk9s2e9h8wcr74gafbxprsw',
  STREAM_APP_ID: '1132017',

  TIER_1: 'price_1ImhznKwkzsqkh9m3eAmW9kG',
  MONTHS: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
  CUSTOM_PURPLE_GRADIENT: ['#872EC4', '#B150E2', '#D56DFB'],
  SUCCESS_ICON_URL: 'https://i.pinimg.com/originals/46/d1/8f/46d18fc9c093bfcb248d1cc49b9a52fc.gif',
};

module.exports = constants;

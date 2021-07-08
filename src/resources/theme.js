import {PlatformColor} from 'react-native';
import {Dimensions} from 'react-native';
const {width, height} = Dimensions.get('window');
import constants from './constants';

const ADAPTIVE_COLORS = {
  // base colors
  primary: '#A768FE', // purple
  secondary: 'white', // white

  backgroundColor: PlatformColor('systemBackground'),
  secondaryBackgroundColor: PlatformColor('secondarySystemBackground'),
  tertiaryBackgroundColor: PlatformColor('tertiarySystemBackground'),
  placeholderTextColor: PlatformColor('placeholderText'),

  primaryLabelColor: PlatformColor('label'),
  secondaryLabelColor: PlatformColor('secondaryLabel'),
  tertiaryLabelColor: PlatformColor('tertiaryLabel'),
  quaternaryLabel: PlatformColor('quaternaryLabel'),

  systemBlue: PlatformColor('systemBlue'),
  white: 'white',
  separatorColor: PlatformColor('separator'),
  gray: PlatformColor('systemGray'),
  systemFill: PlatformColor('systemFill'),
  secondarySystemFill: PlatformColor('secondarySystemFill'),

  // colors
  black: '#1E1F20',

  lightGray: '#F5F5F6',
  lightGray2: '#F6F6F7',
  lightGray3: '#EFEFF1',
  lightGray4: '#F8F8F9',
  transparent: 'transparent',
  darkgray: '#898C95',
};

const DARK_COLORS = {
  // base colors
  primary: '#A768FE', // purple
  secondary: 'white', // white

  backgroundColor: '#000000ff',
  secondaryBackgroundColor: '#1c1c1eff',
  tertiaryBackgroundColor: '#2c2c2eff',
  placeholderTextColor: '#ebebf54c',

  primaryLabelColor: '#ffffffff',
  secondaryLabelColor: '#ebebf599',
  tertiaryLabelColor: '#ebebf54c',
  quaternaryLabel: '#ebebf52d',

  systemBlue: '#0a84ffff',
  white: 'white',
  separatorColor: '#54545899',
  gray: '#8e8e93ff',
  systemFill: '#7878805b',
  secondarySystemFill: '#78788051',

  // colors
  black: '#1E1F20',

  lightGray: '#F5F5F6',
  lightGray2: '#F6F6F7',
  lightGray3: '#EFEFF1',
  lightGray4: '#F8F8F9',
  transparent: 'transparent',
  darkgray: '#898C95',
};

const LIGHT_COLORS = {
  // TO BE FILLED
};

export const COLORS = DARK_COLORS;

export const SIZES = {
  // global sizes
  base: 8,
  font: 14,
  radius: 30,
  padding: 10,
  padding2: 12,
  spacing: 3,
  separatorWidth: 0.5,
  storyCircleWidth: 66,

  // font sizes
  largeTitle: 50,
  h1: 30,
  h2: 22,
  h3: 20,
  h4: 18,
  body1: 30,
  body2: 20,
  body3: 16,
  body4: 14,
  body5: 12,

  // app dimensions
  width,
  height,
};

export const FONTS = {
  largeTitle: {
    fontFamily: 'Roboto-regular',
    fontSize: SIZES.largeTitle,
    lineHeight: 55,
  },
  h1: {fontFamily: 'Roboto-Black', fontSize: SIZES.h1, lineHeight: 36},
  h2: {fontFamily: 'Roboto-Bold', fontSize: SIZES.h2, lineHeight: 30},
  h3: {fontFamily: 'Roboto-Bold', fontSize: SIZES.h3, lineHeight: 22},
  h4: {fontFamily: 'Roboto-Bold', fontSize: SIZES.h4, lineHeight: 22},
  body1: {fontFamily: 'Roboto-Regular', fontSize: SIZES.body1, lineHeight: 36},
  body2: {fontFamily: 'Roboto-Regular', fontSize: SIZES.body2, lineHeight: 30},
  body3: {fontFamily: 'Roboto-Regular', fontSize: SIZES.body3, lineHeight: 22},
  body4: {fontFamily: 'Roboto-Regular', fontSize: SIZES.body4, lineHeight: 22},
  body5: {fontFamily: 'Roboto-Regular', fontSize: SIZES.body5, lineHeight: 22},
};

export const STREAM_THEME = {
  avatar: {
    image: {
      height: 70,
      width: 70,
    },
  },
  colors: {
    accent_blue: COLORS.primary,
    accent_green: '#20E070',
    accent_red: constants.RED,
    bg_gradient_end: COLORS.backgroundColor,
    bg_gradient_start: COLORS.backgroundColor,
    black: COLORS.white,
    blue_alice: COLORS.black,
    border: COLORS.black,
    grey: COLORS.gray,
    grey_gainsboro: COLORS.systemFill,
    grey_whisper: COLORS.quaternaryLabel,
    icon_background: '#FFFFFF',
    modal_shadow: COLORS.secondaryBackgroundColor,
    overlay: '#00000066',
    overlay_dark: '#FFFFFFCC',
    shadow_icon: '#00000080',
    targetedMessageBackground: '#302D22',
    transparent: 'transparent',
    white: COLORS.black,
    white_smoke: COLORS.secondaryBackgroundColor,
    white_snow: COLORS.backgroundColor,
  },
  imageGallery: {
    blurType: 'dark',
  },
  spinner: {
    height: 30,
    width: 30,
  },
};

const appTheme = {COLORS, SIZES, FONTS, STREAM_THEME};

export default appTheme;

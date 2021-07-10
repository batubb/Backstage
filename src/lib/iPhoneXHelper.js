import {Dimensions, Platform, StatusBar} from 'react-native';

export function isIphoneX() {
  const {width, height} = Dimensions.get('window');
  return (
    Platform.OS === 'ios' &&
    !Platform.isPad &&
    !Platform.isTVOS &&
    (height === 780 ||
      width === 780 ||
      height === 812 ||
      width === 812 ||
      height === 844 ||
      width === 844 ||
      height === 896 ||
      width === 896 ||
      height === 926 ||
      width === 926)
  );
}

export function getStatusBarHeight(safe) {
  return Platform.select({
    ios: isIphoneX ? (safe ? 44 : 30) : 20,
    android: StatusBar.currentHeight,
    default: 0,
  });
}

export function getBottomSpace() {
  return isIphoneX() ? 34 : 0;
}

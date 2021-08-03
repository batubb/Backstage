module.exports = {
  root: true,
  extends: '@react-native-community',
  rules: {
    'prettier/prettier': ['error', {endOfLine: 'auto'}],
    'react/no-did-mount-set-state': 0,
    'react-native/no-inline-styles': 0,
    'radix': 0,
    'no-shadow': 0,
  },
};

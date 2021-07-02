import React from 'react';
import {Icon} from 'react-native-elements';
import {COLORS, SIZES} from '../../resources/theme';

export default function VerifiedIcon({
    size = 18,
    style,
}) {
  return (
    <Icon
      name="verified"
      size={size}
      color={COLORS.primary}
      type="material-icons"
      style={{
        paddingLeft: SIZES.padding * 0.3,
        top: 2,
        ...style,
      }}
    />
  );
}

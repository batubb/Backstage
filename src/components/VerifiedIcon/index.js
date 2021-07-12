import React from 'react';
import {Icon} from 'react-native-elements';
import {COLORS, SIZES} from '../../resources/theme';

export default function VerifiedIcon({
    size = 18,
    style,
    color = COLORS.primary,
}) {
  return (
    <Icon
      name="verified"
      size={size}
      color={color}
      type="material-icons"
      style={{
        paddingLeft: SIZES.padding * 0.3,
        top: 2,
        ...style,
      }}
    />
  );
}

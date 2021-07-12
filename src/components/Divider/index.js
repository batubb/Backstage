/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {COLORS} from '../../resources/theme';
import {Divider} from 'react-native-elements';

export default function Divider2(props) {
  return (
    <Divider
      style={{
        ...props.style,
        backgroundColor: COLORS.separatorColor,
        width: props.width ? props.width : '100%',
      }}
    />
  );
}

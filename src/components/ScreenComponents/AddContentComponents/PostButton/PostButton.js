/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {COLORS, SIZES} from '../../../../resources/theme';
import {Button} from '../../../../components';
import {getBottomSpace} from '../../../../lib/iPhoneXHelper';

export default function PostButton(props) {
  return (
    <Button
      text="Post"
      buttonStyle={{
        position: 'absolute',
        width: '25%',
        padding: 8,
        alignSelf: 'flex-end',
        bottom: 0,
        right: 0,
        marginBottom: SIZES.spacing * 7 + getBottomSpace(),
        marginRight: SIZES.spacing * 5,
      }}
      rightIconProps={{
        name: 'chevron-right',
        color: COLORS.white,
        type: 'material-community',
      }}
      textStyle={{
        fontSize: 16,
        flex: 1,
        textAlign: 'center',
      }}
      onPress={props.onPress}
    />
  );
}

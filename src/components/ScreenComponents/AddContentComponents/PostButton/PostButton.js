/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {SIZES} from '../../../../resources/theme';
import {Button} from '../../../../components';

export default function PostButton(props) {
  return (
    <Button
      text="Post"
      buttonStyle={{
        position: 'absolute',
        backgroundColor: '#FFF',
        width: '20%',
        padding: 8,
        alignSelf: 'flex-end',
        bottom: 0,
        right: 0,
        marginBottom: SIZES.spacing * 7,
        marginRight: SIZES.spacing * 5,
      }}
      rightIconProps={{
        name: 'chevron-right',
        color: 'black',
        type: 'material-community',
      }}
      textStyle={{
        color: '#000',
        fontSize: 16,
        fontWeight: 'normal',
        flex: 1,
        textAlign: 'center',
      }}
      onPress={props.onPress}
    />
  );
}

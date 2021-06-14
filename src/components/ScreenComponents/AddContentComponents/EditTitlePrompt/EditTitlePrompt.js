/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import constants from '../../../../resources/constants';
import {Text} from '../../../../components';
import {Icon} from 'react-native-elements';

export default function EditTitlePrompt(props) {
  return (
    <TouchableOpacity onPress={props.openModal}>
      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
        }}>
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: props.title ? 'white' : null,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Icon
            name="text"
            color={props.title ? constants.BACKGROUND_COLOR : '#FFF'}
            type="material-community"
          />
        </View>
        {props.title === '' ? (
          <Text text={'Title'} style={{marginLeft: 5}} />
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {constants} from '../../../../resources';
import {MyImage, Text, Button} from '../../../../components';
import {View} from 'react-native';
import {SIZES} from '../../../../resources/theme';
import SubscribeButton from './SubscribeButton';

// photo, name, biograohy, subscribeButtonVisible, user, subscribtion

export default function ProfileTop(props) {
  return (
    <View
      style={{
        flexDirection: 'row',
        height: constants.PROFILE_PIC_SIZE,
      }}>
      <MyImage
        style={{
          width: constants.PROFILE_PIC_SIZE,
          height: constants.PROFILE_PIC_SIZE,
          borderRadius: constants.PROFILE_PIC_SIZE / 2,
        }}
        photo={props.photo}
      />
      <View
        style={{
          flex: 1,
          marginLeft: SIZES.spacing * 5,
        }}>
        <Text text={props.name} numberOfLines={1} style={{fontSize: 20}} />
        <Text
          numberOfLines={2}
          text={props.biography}
          style={{fontSize: 12, color: 'white', marginTop: SIZES.spacing * 2}}
        />
        {!props.subscribeButtonVisible ? null : (
          <SubscribeButton
            user={props.user}
            subscription={props.subscribtion}
            onSubscribePress={props.onSubscribePress}
          />
        )}
      </View>
    </View>
  );
}

/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {constants} from '../../../../resources';
import {MyImage, Text} from '../../../../components';
import {View} from 'react-native';
import {SIZES} from '../../../../resources/theme';
import SubscribeButton from './SubscribeButton';
import Databar from './Databar';

// photo, name, biograohy, subscribeButtonVisible, user, subscribtion

export default function ProfileTop(props) {
  return (
    <View>
      <View
        style={{
          flexDirection: 'row',
          height: constants.PROFILE_PIC_SIZE,
          marginBottom: SIZES.spacing * 5,
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
            marginLeft: SIZES.spacing * 8,
          }}>
          <View>
            <Text text={props.name} numberOfLines={1} style={{fontSize: 20}} />
            <Text
              numberOfLines={2}
              text={props.biography}
              style={{
                fontSize: 14,
                color: 'white',
                marginTop: SIZES.spacing * 3,
                fontWeight: 'normal',
              }}
            />
          </View>
          <View style={{marginTop: 'auto'}}>
            <Text
              text={'27.5k views'}
              style={{fontWeight: 'bold', fontSize: 10}}
            />
          </View>
        </View>
      </View>
      {!props.subscribeButtonVisible ? null : (
        <SubscribeButton
          user={props.user}
          subscribtion={props.subscribtion}
          onSubscribePress={props.onSubscribePress}
        />
      )}
      {!props.databarVisible ? null : (
        <Databar
          followerNumber={props.followerNumber}
          onChatPress={props.onChatPress}
        />
      )}
    </View>
  );
}

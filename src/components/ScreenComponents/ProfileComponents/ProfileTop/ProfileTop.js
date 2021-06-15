/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {constants} from '../../../../resources';
import {MyImage, Text, Button} from '../../../../components';
import {View} from 'react-native';
import {SIZES} from '../../../../resources/theme';
import SubscribeButton from './SubscribeButton';
import Databar from './Databar';
import {StackActions} from '@react-navigation/native';

// photo, name, biograohy, subscribeButtonVisible, user, subscribtion

export default function ProfileTop(props) {
  const goTo = (route, info = null) => {
    if (route === 'EditProfile') {
      const replaceActions = StackActions.push(route, {type: info});
      return props.navigation.dispatch(replaceActions);
    }
  };

  return (
    <View style={{marginBottom: SIZES.spacing * 8}}>
      <View
        style={{
          flexDirection: 'row',
          height: constants.PROFILE_PIC_SIZE,
          marginBottom: SIZES.spacing * 8,
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
              text={`${props.views ? props.views : 0} views`}
              style={{fontWeight: 'bold', fontSize: 10}}
            />
          </View>
        </View>
      </View>
      {!props.subscribeButtonVisible ? null : (
        <View style={{flexDirection: 'row', width: '100%'}}>
          <View style={{flex: 1, marginRight: SIZES.spacing * 3}}>
            <SubscribeButton
              user={props.user}
              subscribtion={props.subscribtion}
              onSubscribePress={props.onSubscribePress}
            />
          </View>
          <View style={{flex: 1}}>
            <Button secondary text={'Room'} onPress={props.onChatPress} />
          </View>
        </View>
      )}
      {!props.databarVisible ? null : (
        <Databar
          followerNumber={props.followerNumber}
          onChatPress={props.onChatPress}
        />
      )}
      {props.editProfileVisible ? (
        <Button
          onPress={() => goTo('EditProfile')}
          text={'Edit Profile'}
          secondary
        />
      ) : null}
    </View>
  );
}

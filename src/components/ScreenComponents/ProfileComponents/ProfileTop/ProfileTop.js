/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {constants} from '../../../../resources';
import {MyImage, Text, Button} from '../../../../components';
import {View} from 'react-native';
import {COLORS, SIZES} from '../../../../resources/theme';
import SubscribeButton from './SubscribeButton';
import Databar from './Databar';
import {StackActions} from '@react-navigation/native';
import {Icon} from 'react-native-elements';
import {TouchableOpacity} from 'react-native';
import Store from '../../../../store/Store';
import {isInfluencer, isAdmin} from '../../../../lib';

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
          <View
            style={{
              marginTop: 'auto',
              flexDirection: 'row',
              justifyContent: 'flex-start',
            }}>
            {typeof props.views !== 'undefined' ? (
              <Text
                text={`${props.views} views`}
                style={{fontWeight: 'bold', fontSize: 11}}
              />
            ) : null}
            {props.showSubscriberNumber && (
              <TouchableOpacity
                activeOpacity={props.subscriberOnPress ? 0.5 : 1}
                onPress={() =>
                  props.subscriberOnPress && props.subscriberOnPress()
                }>
                <Text
                  text={`${
                    props.subscriberNumber ? props.subscriberNumber : 0
                  } subscribers`}
                  style={{
                    fontWeight: 'bold',
                    fontSize: 11,
                    paddingLeft: SIZES.padding * 2,
                  }}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
      {!props.subscribeButtonVisible ? null : (
        <View style={{flexDirection: 'row', width: '100%'}}>
          {!isAdmin(props.user) ? (
            <View style={{flex: 1, marginRight: SIZES.spacing * 3}}>
              <SubscribeButton
                user={props.user}
                subscribtion={props.subscribtion}
                onSubscribePress={props.onSubscribePress}
              />
            </View>
          ) : null}
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
        <View style={{flexDirection: 'row', width: '100%'}}>
          <View
            style={{
              flex: 1,
              marginRight: isInfluencer(Store.user) || isAdmin(Store.user) ? SIZES.spacing * 3 : 0,
            }}>
            <Button
              onPress={() => goTo('EditProfile')}
              text={'Edit Profile'}
              secondary
            />
          </View>
          {isInfluencer(Store.user) || isAdmin(Store.user) ? (
            <View style={{flex: 1}}>
              <Button
                text={'Room'}
                onPress={props.onChatPress}
                secondary
              />
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

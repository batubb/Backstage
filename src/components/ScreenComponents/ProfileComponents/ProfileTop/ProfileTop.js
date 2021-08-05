/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {constants} from '../../../../resources';
import {MyImage, Text, Button} from '../../../../components';
import {Platform, View} from 'react-native';
import {SIZES} from '../../../../resources/theme';
import SubscribeButton from './SubscribeButton';
import Databar from './Databar';
import {StackActions} from '@react-navigation/native';
import {TouchableOpacity} from 'react-native';
import Store from '../../../../store/Store';
import {isInfluencer, isAdmin} from '../../../../lib';
import Story from '../../HomeComponents/Story/Story';

// photo, name, biograohy, subscribeButtonVisible, user, subscribtion

export default function ProfileTop(props) {
  const goTo = (route, info = null) => {
    if (route === 'EditProfile') {
      const replaceActions = StackActions.push(route, {type: info});
      return props.navigation.dispatch(replaceActions);
    } else if (route === 'WatchStory') {
      const replaceActions = StackActions.push(route, {
        stories: info,
        allStories: info,
      });
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
        {props.stories?.length > 0 ? (
          <Story
            onPress={() => goTo('WatchStory', props.stories)}
            photo={props.photo}
            profile
          />
        ) : (
          <MyImage
            style={{
              width: constants.PROFILE_PIC_SIZE,
              height: constants.PROFILE_PIC_SIZE,
              borderRadius: constants.PROFILE_PIC_SIZE / 2,
            }}
            photo={props.photo}
          />
        )}
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
            {false && typeof props.views !== 'undefined' ? (
              <Text
                text={`${props.views} views`}
                style={{
                  fontWeight: 'bold',
                  fontSize: 11,
                  paddingRight: SIZES.padding * 2,
                }}
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
                    fontSize: Platform.OS === 'ios' ? 11 : 13,
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
              marginRight:
                isInfluencer(Store.user) || isAdmin(Store.user)
                  ? SIZES.spacing * 3
                  : 0,
            }}>
            <Button
              onPress={() => goTo('EditProfile')}
              text={'Edit Profile'}
              secondary
            />
          </View>
          {isInfluencer(Store.user) || isAdmin(Store.user) ? (
            <View style={{flex: 1}}>
              <Button text={'Room'} onPress={props.onChatPress} secondary />
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

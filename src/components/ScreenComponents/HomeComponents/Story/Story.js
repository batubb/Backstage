/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {View, TouchableOpacity} from 'react-native';
import {constants} from '../../../../resources';
import {COLORS, SIZES} from '../../../../resources/theme';
import {MyImage, Text} from '../../../../components';
import {Icon} from 'react-native-elements';

function StoryCircle(props) {
  return (
    <View
      style={{
        width: SIZES.storyCircleWidth,
        height: SIZES.storyCircleWidth,
        borderRadius: SIZES.storyCircleWidth / 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: props.loading ? constants.BAR_COLOR : null,
        borderWidth: !props.loading ? 2.5 : null,
        borderColor: !props.loading ? COLORS.primary : null,
      }}>
      {props.children}
    </View>
  );
}

function StoryImage(props) {
  return (
    <MyImage
      style={{
        width: '100%',
        height: '100%',
        borderRadius: SIZES.storyCircleWidth / 2,
        borderWidth: 1,
        borderColor: COLORS.secondary,
      }}
      photo={props.photo}
    />
  );
}

// props:
// onPress, photo, text, addStory, loading
// 4 types of stories:
// 1. loading(totally gray)
// 2. my story and has a picture in it
// 3. my story and has no picture in it(addStory)
// 4. others' stories
export default function Story(props) {
  return (
    <TouchableOpacity
      onPress={props.onPress}
      style={{alignItems: 'center', marginRight: SIZES.spacing * 7}}>
      <StoryCircle loading={props.loading}>
        {!props.loading && !props.addStory ? (
          <StoryImage photo={props.photo} />
        ) : props.addStory ? (
          <Icon name="plus" color="#FFF" type="material-community" size={32} />
        ) : null}
        {props.isLive ? (
          <View
            style={{
              position: 'absolute',
              alignSelf: 'center',
              bottom: -5,
              height: '20%',
              backgroundColor: COLORS.primary,
              width: '50%',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 5,
              borderWidth: 1,
              borderColor: COLORS.secondary,
              padding: 1,
            }}>
            <Text text={'LIVE'} style={{fontSize: 8}} />
          </View>
        ) : null}
      </StoryCircle>

      {!props.loading ? (
        <Text
          text={props.text}
          style={{
            fontSize: 12,
            marginTop: SIZES.spacing * 3,
            fontWeight: '400',
          }}
        />
      ) : null}
    </TouchableOpacity>
  );
}

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
        borderWidth: !props.loading ? 2 : null,
        borderColor: !props.loading ? COLORS.secondary : null,
      }}>
      {props.children}
    </View>
  );
}

function StoryImage(props) {
  return (
    <MyImage
      style={{
        width: SIZES.storyCircleWidth,
        height: SIZES.storyCircleWidth,
        borderRadius: SIZES.storyCircleWidth / 2,
        borderWidth: 2,
        borderColor: '#fff',
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
      </StoryCircle>
      {!props.loading ? (
        <Text
          text={props.text}
          style={{
            fontSize: 12,
            marginTop: SIZES.spacing * 1,
            fontWeight: '400',
          }}
        />
      ) : null}
    </TouchableOpacity>
  );
}

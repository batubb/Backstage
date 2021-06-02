/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {View} from 'react-native';
import {constants} from '../../resources';
import {COLORS, SIZES} from '../../resources/theme';
import MyImage from '../MyImage';

function StoryCircle(props) {
  return (
    <View
      style={{
        width: SIZES.storyCircleWidth,
        height: SIZES.storyCircleWidth,
        borderRadius: SIZES.storyCircleWidth / 2,
        marginHorizontal: 5,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: props.loading ? constants.BAR_COLOR : null,
        borderWidth: props.myStory ? 2 : null,
        borderColor: props.myStory ? COLORS.secondary : null,
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
        borderColor: '#FFF',
      }}
      photo={props.photo}
    />
  );
}

export {StoryCircle, StoryImage};

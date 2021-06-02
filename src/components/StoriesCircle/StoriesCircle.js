/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {View} from 'react-native';
import {constants} from '../../resources';
import {COLORS, SIZES} from '../../resources/theme';

function StoriesCircle(props) {
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

export default StoriesCircle;

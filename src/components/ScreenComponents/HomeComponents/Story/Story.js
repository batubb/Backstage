/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {View, TouchableOpacity} from 'react-native';
import {constants} from '../../../../resources';
import {COLORS, SIZES} from '../../../../resources/theme';
import {MyImage, Text, VerifiedIcon} from '../../../../components';
import {Icon} from 'react-native-elements';
import ContentLoader, {Circle} from 'react-content-loader/native';

function StoryCircle(props) {
  return (
    <View
      style={{
        width: props.profile
          ? constants.PROFILE_PIC_SIZE
          : SIZES.storyCircleWidth,
        height: props.profile
          ? constants.PROFILE_PIC_SIZE
          : SIZES.storyCircleWidth,
        borderRadius:
          (props.profile
            ? constants.PROFILE_PIC_SIZE
            : SIZES.storyCircleWidth) / 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: props.loading ? constants.BAR_COLOR : null,
        borderWidth: !props.loading ? 3 : null,
        borderColor: !props.loading
          ? props.text === 'Add Story'
            ? COLORS.secondary
            : COLORS.primary
          : null,
      }}>
      {props.loading ? (
        <ContentLoader
          speed={1}
          backgroundColor={constants.BAR_COLOR}
          foregroundColor={'#828181'}>
          <Circle
            cx={
              (props.profile
                ? constants.PROFILE_PIC_SIZE
                : SIZES.storyCircleWidth) / 2
            }
            cy={
              (props.profile
                ? constants.PROFILE_PIC_SIZE
                : SIZES.storyCircleWidth) / 2
            }
            r={
              (props.profile
                ? constants.PROFILE_PIC_SIZE
                : SIZES.storyCircleWidth) / 2
            }
          />
        </ContentLoader>
      ) : (
        props.children
      )}
    </View>
  );
}

function StoryImage(props) {
  return (
    <MyImage
      style={{
        width: '100%',
        height: '100%',
        borderRadius:
          (props.profile
            ? constants.PROFILE_PIC_SIZE
            : SIZES.storyCircleWidth) / 2,
        borderWidth: 1.5,
        borderColor: COLORS.backgroundColor,
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
      style={{
        alignItems: 'center',
        marginRight: SIZES.spacing * (props.profile ? 0 : 7),
      }}>
      <StoryCircle
        loading={props.loading}
        text={props.text}
        profile={props.profile ?? false}>
        {!props.loading && !props.addStory ? (
          <StoryImage photo={props.photo} profile={props.profile ?? false} />
        ) : props.addStory ? (
          <Icon name="plus" color="#FFF" type="material-community" size={32} />
        ) : null}
        {props.isLive ? (
          <View
            style={{
              position: 'absolute',
              alignSelf: 'center',
              bottom: -8,
              height: 14,
              backgroundColor: COLORS.primary,
              width: 30,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 5,
              borderWidth: 1,
              borderColor: COLORS.secondary,
              padding: 1,
            }}>
            <Text
              text={'LIVE'}
              style={{fontSize: 9, color: COLORS.secondary}}
            />
          </View>
        ) : null}
      </StoryCircle>

      {!props.loading ? (
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Text
            text={props.text}
            style={{
              fontSize: 12,
              marginTop: SIZES.spacing * 3,
              fontWeight: '400',
            }}
          />
          {props.showVerificationIcon ? (
            <VerifiedIcon
              size={12}
              style={{
                paddingTop: SIZES.padding,
                paddingLeft: SIZES.spacing * 0.5,
                top: -1,
              }}
            />
          ) : null}
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

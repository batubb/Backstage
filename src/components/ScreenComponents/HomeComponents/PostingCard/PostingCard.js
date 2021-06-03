/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {constants} from '../../../../resources';
import {SIZES} from '../../../../resources/theme';
import {View, TouchableOpacity} from 'react-native';
import {MyImage, Text} from '../../../../components';
import LinearGradient from 'react-native-linear-gradient';
import {followerCount} from '../../../../lib';

const NUM_CARDS_IN_SCREEN = 2.5;
const DISTANCE_BETWEEN_CARDS = SIZES.spacing * 3;
const HEIGHT_MULTIPLIER = 1.5;
const BORDER_RADIUS = 16;

function PostingCardCaption(props) {
  const limit = props.longVersion ? 17 : 10;
  return (
    <Text
      text={
        props.caption.length >= limit
          ? `${props.caption.substring(0, limit)}...`
          : props.caption
      }
      style={{fontSize: 12}}
    />
  );
}

function PostingCardSmallCaption(props) {
  return (
    <Text
      text={`${followerCount(props.count)} ` + props.text}
      style={{fontSize: 12, fontWeight: 'normal'}}
    />
  );
}

// props:
// width, item, showProfilePicInCard, onPress
export default function PostingCard(props) {
  const widthOfElement =
    (props.width -
      (Math.ceil(NUM_CARDS_IN_SCREEN) - 1) * DISTANCE_BETWEEN_CARDS) /
    NUM_CARDS_IN_SCREEN;
  return (
    <View
      style={{
        width: widthOfElement,
        alignItems: 'center',
        marginRight: DISTANCE_BETWEEN_CARDS,
      }}>
      <TouchableOpacity onPress={props.onPress}>
        <View
          style={{
            borderRadius: BORDER_RADIUS,
            width: widthOfElement,
            height: HEIGHT_MULTIPLIER * widthOfElement,
            backgroundColor: '#4d4d4d',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <MyImage
            style={{
              width: widthOfElement,
              height: HEIGHT_MULTIPLIER * widthOfElement,
              borderRadius: BORDER_RADIUS,
            }}
            photo={props.item.photo}
          />
          <LinearGradient
            colors={['transparent', 'transparent', constants.BACKGROUND_COLOR]}
            style={{
              width: widthOfElement,
              height: HEIGHT_MULTIPLIER * widthOfElement,
              borderRadius: BORDER_RADIUS,
              position: 'absolute',
            }}
          />
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              paddingVertical: 5,
              paddingHorizontal: 10,
              width: widthOfElement,
              justifyContent: props.showProfilePicInCard
                ? 'space-between'
                : null,
              alignItems: props.showProfilePicInCard ? 'center' : null,
            }}>
            {props.showProfilePicInCard ? (
              <>
                <MyImage
                  style={{width: 40, height: 40, borderRadius: 20}}
                  photo={props.item.user.photo}
                />
                <View style={{width: props.width / 2.5 - 80}}>
                  <PostingCardCaption caption={props.item.user.name} />
                  <PostingCardSmallCaption
                    count={props.item.view}
                    text={'viewers'}
                  />
                </View>
              </>
            ) : (
              <>
                <PostingCardCaption caption={props.item.title} longVersion />
                <PostingCardSmallCaption
                  count={props.item.view}
                  text={'views'}
                />
              </>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

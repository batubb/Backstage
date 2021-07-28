/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {SIZES, COLORS} from '../../../../resources/theme';
import {View, TouchableOpacity} from 'react-native';
import {MyImage, Text} from '../../../../components';
import LinearGradient from 'react-native-linear-gradient';
import {followerCount} from '../../../../lib';
import {Icon} from 'react-native-elements';

const NUM_CARDS_IN_SCREEN = 2.1;
const DISTANCE_BETWEEN_CARDS = SIZES.spacing * 3;
const HEIGHT_MULTIPLIER = 1.5;
const BORDER_RADIUS = 6;

function PostingCardCumulativeViews(props) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: SIZES.spacing,
        position: 'absolute',
        bottom: 18,
      }}>
      <Icon
        name="play"
        type="ionicon"
        color={COLORS.primaryLabelColor}
        size={15}
        style={{
          shadowOffset: {width: 2, height: 2},
          shadowColor: 'rgba(0, 0, 0, 0.2)',
          shadowOpacity: 10,
          shadowRadius: 1,
        }}
      />
      <Text
        text={`${followerCount(props.views)}`}
        style={{
          fontSize: 12,
          marginLeft: SIZES.spacing,
          textShadowColor: 'rgba(0, 0, 0, 0.2)',
          textShadowOffset: {width: 2, height: 2},
          textShadowRadius: 10,
        }}
      />
    </View>
  );
}

function PostingCardCaption(props) {
  return props.caption ? (
    <Text
      text={props.caption}
      numberOfLines={1}
      style={{fontSize: 14, ...props.style}}
    />
  ) : null;
}

function PostingCardSmallCaption(props) {
  return (
    <Text
      text={`${followerCount(props.count)} ` + props.text}
      style={{fontSize: 12, fontWeight: 'normal', ...props.style}}
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
            gradientComponent={
              <LinearGradient
                colors={['rgba(0, 0, 0, 0.4)', 'rgba(0, 0, 0, 0.0)']}
                start={{x: 0, y: 0.8}}
                end={{x: 0, y: 0.35}}
                style={{
                  position: 'absolute',
                  top: 0,
                  width: '100%',
                  height: '100%',
                }}
              />
            }
          />
          {props.item.isLive === 0 ? (
            <View
              style={{
                position: 'absolute',
                top: SIZES.padding,
                right: SIZES.padding,
                opacity: 0.95,
                backgroundColor: COLORS.lightGray5,
                borderRadius: SIZES.radius * 0.15,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text
                text="LIVE"
                style={{
                  paddingVertical: SIZES.spacing * 1.5,
                  paddingHorizontal: SIZES.spacing * 2,
                  textAlign: 'center',
                  color: COLORS.secondary,
                  fontSize: SIZES.body5,
                }}
              />
            </View>
          ) : null}
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
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                  }}
                  photo={props.item.user.photo}
                />
                <View
                  style={{
                    width: props.width / 2.5 - 80,
                    paddingVertical: SIZES.spacing,
                  }}>
                  <PostingCardCaption
                    caption={props.item.user.username}
                    style={{textAlign: 'center'}}
                  />
                  <PostingCardSmallCaption
                    count={props.item.view}
                    text={'viewers'}
                    style={{textAlign: 'center'}}
                  />
                </View>
              </>
            ) : (
              <>
                <View style={{alignItems: 'flex-start'}}>
                  <PostingCardCumulativeViews
                    views={props.item.cumulativeViews ?? 0}
                  />
                  <PostingCardCaption caption={props.item.title} />
                </View>
              </>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

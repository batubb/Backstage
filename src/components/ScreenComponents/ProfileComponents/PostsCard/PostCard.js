/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import {MyImage, Text, VerifiedIcon} from '../../../../components';
import LinearGradient from 'react-native-linear-gradient';
import constants from '../../../../resources/constants';
import {followerCount} from '../../../../lib';

import {Icon} from 'react-native-elements';
import {COLORS, SIZES} from '../../../../resources/theme';

// onPress, item

const CARD_BORDER_RADIUS = 6;

export default function PostCard(props) {
  return (
    <TouchableOpacity
      onPress={() => props.onPress(props.item)}
      style={{width: '100%'}}>
      <View
        style={{
          borderRadius: CARD_BORDER_RADIUS,
          backgroundColor: props.addButton
            ? COLORS.secondaryBackgroundColor
            : '#4d4d4d',
          width: '100%',
          height: '100%',
          justifyContent: 'center',
        }}>
        {props.addButton ? (
          <Icon
            name="plus"
            type="material-community"
            color={COLORS.primaryLabelColor}
            size={60}
          />
        ) : props.item.photo === constants.DEFAULT_PHOTO ? (
          <Icon
            name="account"
            type="material-community"
            color={COLORS.primaryLabelColor}
            size={82}
          />
        ) : (
          <>
            <MyImage
              style={{
                borderRadius: CARD_BORDER_RADIUS,
                height: '100%',
                width: '100%',
              }}
              photo={props.item.photo}
              gradientComponent={
                <LinearGradient
                  colors={['rgba(0, 0, 0, 0.4)', 'rgba(0, 0, 0, 0.0)']}
                  start={{x: 0, y: 0.8}}
                  end={{x: 0, y: props.isPersonCard ? 0.65 : 0.35}}
                  style={{
                    position: 'absolute',
                    top: 0,
                    width: '100%',
                    height: '100%',
                  }}
                />
              }
            />
          </>
        )}
        {!props.addButton && (
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              paddingVertical: 5,
              paddingHorizontal: 10,
              width: '95%',
              borderRadius: 5,
              marginBottom: SIZES.padding * 0.3,
              marginHorizontal: SIZES.padding * 0.3,
            }}>
            <View style={{flexDirection: 'row'}}>
              {props.isPersonCard ? (
                <Text
                  text={props.item.username}
                  style={{
                    fontSize: 13,
                    paddingBottom: 2,
                    textShadowColor: 'rgba(0, 0, 0, 0.2)',
                    textShadowOffset: {width: 2, height: 2},
                    textShadowRadius: 10,
                  }}
                />
              ) : null}
              {props.showVerificationIcon ? (
                <VerifiedIcon
                  size={14}
                  style={{
                    paddingLeft: SIZES.padding * 0.2,
                  }}
                />
              ) : null}
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: props.item.title ? SIZES.spacing * 2 : 0,
              }}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
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
                  text={`${followerCount(
                    props.isPersonCard
                      ? props.item.cumulativeViewsUser
                      : props.item.cumulativeViews,
                  )}`}
                  style={{
                    fontSize: 12,
                    marginLeft: SIZES.spacing,
                    textShadowColor: 'rgba(0, 0, 0, 0.2)',
                    textShadowOffset: {width: 2, height: 2},
                    textShadowRadius: 10,
                  }}
                />
              </View>
            </View>
            {props.item.title ? (
              <Text
                text={
                  props.item.title.length >= 17
                    ? `${props.item.title.substring(0, 17)}...`
                    : props.item.title
                }
                style={{
                  left: 1.5,
                  fontSize: 13,
                  paddingBottom: 2,
                  textShadowColor: 'rgba(0, 0, 0, 0.2)',
                  textShadowOffset: {width: 2, height: 2},
                  textShadowRadius: 10,
                }}
              />
            ) : null}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

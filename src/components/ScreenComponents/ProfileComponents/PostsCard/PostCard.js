/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import {MyImage, Text} from '../../../../components';
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
          <MyImage
            style={{
              borderRadius: CARD_BORDER_RADIUS,
              height: '100%',
              width: '100%',
            }}
            photo={props.item.photo}
          />
        )}
        {!props.addButton && (
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              paddingVertical: 5,
              paddingHorizontal: 10,
              width: '95%',
              backgroundColor: constants.BAR_COLOR,
              borderRadius: 5,
              marginBottom: SIZES.padding * 0.3,
              marginHorizontal: SIZES.padding * 0.3,
            }}>
            <View style={{flexDirection: 'row'}}>
              <Text
                text={
                  props.isPersonCard
                    ? props.item.username
                    : props.item.title && props.item.title.length >= 17
                    ? `${props.item.title.substring(0, 17)}...`
                    : props.item.title
                }
                style={{fontSize: 12}}
              />
              {props.showVerificationIcon ? (
                <Icon
                  name="verified"
                  size={14}
                  color={COLORS.primary}
                  type="material-icons"
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
              }}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Icon
                  name="play-outline"
                  type="ionicon"
                  color={COLORS.primaryLabelColor}
                  size={16}
                />
                <Text
                  text={`${followerCount(
                    props.isPersonCard
                      ? props.item.cumulativeViewsUser
                      : props.item.cumulativeViews,
                  )}`}
                  style={{fontSize: 12, marginLeft: SIZES.spacing * 1}}
                />
              </View>
              {props.item.price && (
                <View>
                  <Text
                    text={`$${props.item.price}`}
                    style={{fontSize: 12, marginLeft: SIZES.spacing * 1}}
                  />
                </View>
              )}
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

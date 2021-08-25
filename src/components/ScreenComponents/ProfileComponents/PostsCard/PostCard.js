/* eslint-disable react-native/no-inline-styles */
import React, {useEffect} from 'react';
import {ActivityIndicator, TouchableOpacity, View} from 'react-native';
import {MyImage, Text, VerifiedIcon} from '../../../../components';
import LinearGradient from 'react-native-linear-gradient';
import constants from '../../../../resources/constants';
import {followerCount} from '../../../../lib';

import {Icon} from 'react-native-elements';
import {COLORS, SIZES} from '../../../../resources/theme';

// onPress, item

const CARD_BORDER_RADIUS = 6;

export default function PostCard(props) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {}, [props.item?.thumbnail?.url]);

  const processingView = () => (
    <View style={{flexDirection: 'column'}}>
      <ActivityIndicator size="small" color="white" />
      <Text
        text={
          props.item.status === 'ERROR'
            ? 'ERROR'
            : `%${props.item.loading} Processing`
        }
        style={{alignSelf: 'center', paddingTop: SIZES.spacing * 2}}
      />
    </View>
  );

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
        ) : props.item.thumbnail?.url === constants.DEFAULT_PHOTO ? (
          <Icon
            name="account"
            type="material-community"
            color={COLORS.primaryLabelColor}
            size={82}
          />
        ) : props.item.loading && !props.item.thumbnail?.url ? (
          <View
            style={{
              borderRadius: CARD_BORDER_RADIUS,
              height: '100%',
              width: '100%',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            {processingView()}
            <LinearGradient
              colors={[
                `rgba(0, 0, 0, ${props.isPersonCard ? '0.35' : '0.4'})`,
                'rgba(0, 0, 0, 0.0)',
              ]}
              start={{x: 0, y: 0.8}}
              end={{x: 0, y: 0.35}}
              style={{
                position: 'absolute',
                top: 0,
                width: '100%',
                height: '100%',
              }}
            />
          </View>
        ) : (
          <>
            <MyImage
              style={{
                borderRadius: CARD_BORDER_RADIUS,
                height: '100%',
                width: '100%',
              }}
              photo={
                props.isPersonCard
                  ? props.item.photo
                  : props.item.thumbnail?.url
              }
              gradientComponent={
                <>
                  <LinearGradient
                    colors={[
                      `rgba(0, 0, 0, ${
                        props.isPersonCard
                          ? '0.35'
                          : props.item.loading
                          ? '0.7'
                          : '0.4'
                      })`,
                      'rgba(0, 0, 0, 0.0)',
                    ]}
                    start={{
                      x: 0,
                      y: props.isPersonCard
                        ? 0.94
                        : props.item.loading
                        ? 0.7
                        : 0.8,
                    }}
                    end={{
                      x: 0,
                      y: props.isPersonCard
                        ? 0.78
                        : props.item.loading
                        ? 0
                        : 0.35,
                    }}
                    style={{
                      position: 'absolute',
                      top: 0,
                      width: '100%',
                      height: '100%',
                    }}
                  />
                  {props.item.loading ? processingView() : null}
                </>
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
            {false && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: SIZES.padding,
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
            )}
            {props.item.title ? (
              <Text
                text={props.item.title}
                numberOfLines={1}
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

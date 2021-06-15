/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import constants from '../../../../resources/constants';
import {SIZES} from '../../../../resources/theme';
import {TouchableOpacity, View, FlatList} from 'react-native';
import {MyImage, Text} from '../../../../components';

import LinearGradient from 'react-native-linear-gradient';
import {followerCount} from '../../../../lib';
import Store from '../../../../store/Store';
import {StackActions} from '@react-navigation/native';
import {Icon} from 'react-native-elements';

const CARD_BORDER_RADIUS = 6;

// onPress, posts, expired, isPersonCard, numCols, extraData

export default function PostsCard(props) {
  return (
    <FlatList
      data={props.posts}
      keyExtractor={(item) => item.uid}
      extraData={props.extraData}
      numColumns={props.numCols}
      renderItem={({item, index}) => (
        <View
          style={{
            flex: 1 / props.numCols,
            aspectRatio: 2 / 3,
            marginRight:
              index % props.numCols !== props.numCols - 1
                ? SIZES.spacing * 3
                : null,
            marginBottom: SIZES.spacing * 3,
          }}>
          <TouchableOpacity
            onPress={() => props.onPress(item)}
            style={{width: '100%'}}>
            <View
              style={{
                borderRadius: CARD_BORDER_RADIUS,
                backgroundColor: '#4d4d4d',
              }}>
              <MyImage
                style={{
                  borderRadius: CARD_BORDER_RADIUS,
                  height: '100%',
                  width: '100%',
                }}
                photo={item.photo}
              />
              <LinearGradient
                colors={[
                  'transparent',
                  'transparent',
                  constants.BACKGROUND_COLOR,
                ]}
                style={{
                  borderRadius: CARD_BORDER_RADIUS,
                  position: 'absolute',
                  height: '100%',
                  width: '100%',
                }}
              />
              {props.isPersonCard ? null : (
                <View
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    paddingVertical: 5,
                    paddingHorizontal: 10,
                  }}>
                  <Text
                    text={
                      item.title && item.title.length >= 17
                        ? `${item.title.substring(0, 17)}...`
                        : item.title
                    }
                    style={{fontSize: 12}}
                  />
                  <Text
                    text={`${followerCount(item.cumulativeViews)} views`}
                    style={{fontSize: 12, fontWeight: 'normal'}}
                  />
                </View>
              )}
            </View>
          </TouchableOpacity>
          {props.expired ? (
            <View
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'black',
                opacity: 0.8,
              }}>
              <Icon
                name="lock-outline"
                color="#FFF"
                type="material-community"
                size={48}
              />
            </View>
          ) : null}
        </View>
      )}
    />
  );
}

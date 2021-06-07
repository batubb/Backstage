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

const CARD_BORDER_RADIUS = 6;

export default function PostsCard(props) {
  const goTo = (route, info = null) => {
    if (route === 'WatchVideo') {
      const replaceActions = StackActions.push(route, {video: info});
      return props.navigation.dispatch(replaceActions);
    }
  };
  return (
    <FlatList
      data={props.posts}
      keyExtractor={(item) => item.uid}
      extraData={Store.posts}
      numColumns={constants.NUM_POSTS_PER_ROW_PROFILE}
      renderItem={({item, index}) => (
        <View
          style={{
            flex: 1 / constants.NUM_POSTS_PER_ROW_PROFILE,
            aspectRatio: 2 / 3,
            marginRight:
              index % constants.NUM_POSTS_PER_ROW_PROFILE !==
              constants.NUM_POSTS_PER_ROW_PROFILE - 1
                ? SIZES.spacing * 3
                : null,
            marginBottom: SIZES.spacing * 3,
          }}>
          <TouchableOpacity
            onPress={() => goTo('WatchVideo', item)}
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
              <View
                style={{
                  position: 'absolute',
                  bottom: 0,
                  paddingVertical: 5,
                  paddingHorizontal: 10,
                }}>
                <Text
                  text={
                    item.title.length >= 17
                      ? `${item.title.substring(0, 17)}...`
                      : item.title
                  }
                  style={{fontSize: 12}}
                />
                <Text
                  text={`${followerCount(item.view)} views`}
                  style={{fontSize: 12, fontWeight: 'normal'}}
                />
              </View>
            </View>
          </TouchableOpacity>
        </View>
      )}
    />
  );
}

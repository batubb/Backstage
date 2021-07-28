/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {COLORS, SIZES} from '../../../../resources/theme';
import {View, FlatList, TouchableOpacity} from 'react-native';
import {Icon} from 'react-native-elements';
import PostCard from './PostCard';
import Text from '../../../Text';

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
          <PostCard
            item={item}
            onPress={props.onPress}
            isPersonCard={props.isPersonCard}
            addButton={props.addButton ? true : false}
            showVerificationIcon={item.verified === true}
            showTitle={props.showTitle === true}
          />
          {item.isLive === 0 ? (
            <View
              style={{
                position: 'absolute',
                top: SIZES.padding,
                right: SIZES.padding,
                opacity: 0.95,
                // backgroundColor: constants.RED,
                // backgroundColor: constants.TRANSPARENT_BLACK_COLOR,
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
          {props.expired ? (
            <TouchableOpacity
              onPress={() => props.onPress(item)}
              activeOpacity={0.75}
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'black',
                opacity: 0.6,
              }}>
              <Icon
                name="eye-outline"
                color="#FFF"
                type="material-community"
                size={48}
              />
            </TouchableOpacity>
          ) : null}
        </View>
      )}
    />
  );
}

/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {SIZES} from '../../../../resources/theme';
import {View, FlatList} from 'react-native';
import {Icon} from 'react-native-elements';
import PostCard from './PostCard';

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
            showVerificationIcon={!!props.showVerificationIcon}
          />
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

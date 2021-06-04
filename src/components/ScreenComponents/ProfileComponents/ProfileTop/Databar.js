/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {View, TouchableOpacity} from 'react-native';
import {Text} from '../../../../components';
import {followerCount} from '../../../../lib';
import {Icon} from 'react-native-elements';

// props: followerNumber, onChatPress
export default function Databar(props) {
  return (
    <View
      style={{
        flexDirection: 'row',
        width: '100%',
        paddingVertical: 10,
        marginBottom: 10,
      }}>
      <View style={{alignItems: 'center', width: '50%'}}>
        <Text
          text={followerCount(props.followerNumber)}
          style={{fontSize: 18}}
        />
        <Text text="Members" style={{fontSize: 16}} />
      </View>
      <TouchableOpacity
        onPress={props.onChatPress}
        style={{alignItems: 'center', width: '50%'}}>
        <Icon
          name="account-group-outline"
          color="#FFF"
          type="material-community"
        />
        <Text text="Rooms" style={{fontSize: 16}} />
      </TouchableOpacity>
    </View>
  );
}

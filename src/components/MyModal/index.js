/* eslint-disable no-alert */
/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {View, Dimensions, ActivityIndicator} from 'react-native';
import Text from '../../components/Text';
import constants from '../../resources/constants';
import {COLORS, SIZES} from '../../resources/theme';
import MyImage from './../MyImage';

import Modal from 'react-native-modal';

const {width} = Dimensions.get('window');

export default function MyModal(props) {
  return (
    <Modal
      isVisible
      avoidKeyboard
      style={{margin: 0}}
      onBackdropPress={props.closeModal}>
      <View
        style={{
          backgroundColor: COLORS.tertiaryBackgroundColor,
          borderRadius: !props.loading ? SIZES.radius : SIZES.radius / 2,
          // 36 equals to large size of activity indicator.
          marginHorizontal: !props.loading ? SIZES.spacing * 4 : width / 2 - 36,
        }}
        behavior="padding">
        <View
          style={{
            width: constants.DEFAULT_PAGE_WIDTH,
            alignItems: 'center',
            alignSelf: 'center',
            paddingVertical: SIZES.spacing * 5,
          }}>
          {props.photo && (
            <View
              style={{
                marginVertical: SIZES.spacing * 7,
              }}>
              <MyImage
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: constants.PROFILE_PIC_SIZE / 4,
                }}
                photo={props.photo}
              />
            </View>
          )}
          {props.loading ? <ActivityIndicator size={'large'} style={{paddingLeft: 2}} /> : null}
          {props.text ? (
            <Text
              text={props.text}
              style={{
                textAlign: 'left',
                marginTop: SIZES.spacing * 3.5,
                marginBottom: SIZES.spacing * (props.photo ? 7 : 3.5),
                paddingHorizontal: SIZES.spacing * 2,
                fontSize: SIZES.h4,
                ...props.textStyle,
              }}
            />
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

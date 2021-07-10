/* eslint-disable no-alert */
/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {View, Dimensions} from 'react-native';
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
          borderRadius: SIZES.radius,
          marginHorizontal: SIZES.spacing * 4,
        }}
        behavior="padding">
        <View
          style={{
            width: constants.DEFAULT_PAGE_WIDTH,
            alignItems: 'center',
            alignSelf: 'center',
            paddingVertical: SIZES.spacing * 5,
          }}>
          <View
            style={{
              flexDirection: 'row',
              marginVertical: SIZES.spacing * 7,
            }}>
            {props.photo && (
              <MyImage
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: constants.PROFILE_PIC_SIZE / 4,
                }}
                photo={props.photo}
              />
            )}
          </View>
          {props.text ? (
            <Text
              text={props.text}
              style={{
                textAlign: 'left',
                marginTop: SIZES.spacing * 3.5,
                marginBottom: SIZES.spacing * 7,
                paddingHorizontal: SIZES.spacing * 2,
                fontSize: SIZES.h4,
              }}
            />
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

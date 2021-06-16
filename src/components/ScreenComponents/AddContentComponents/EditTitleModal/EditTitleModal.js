/* eslint-disable no-alert */
/* eslint-disable react-native/no-inline-styles */
import React, {useState} from 'react';
import {View, KeyboardAvoidingView, Dimensions} from 'react-native';
import {
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native-gesture-handler';
import {Text, Button, Divider} from '../../../../components';
import constants from '../../../../resources/constants';
import {COLORS, SIZES} from '../../../../resources/theme';
import MyImage from '../../../MyImage';

import Modal from 'react-native-modal';

export default function EditTitleModal(props) {
  const [title, setTitle] = useState(props.title);

  return (
    <Modal
      isVisible
      avoidKeyboard
      style={{margin: 0}}
      onBackdropPress={props.closeModal}>
      <View
        style={{
          marginTop: 'auto',
          backgroundColor: COLORS.tertiaryBackgroundColor,
          borderTopLeftRadius: 10,
          borderTopRightRadius: 10,
        }}
        behavior="padding">
        <View
          style={{
            width: constants.DEFAULT_PAGE_WIDTH,
            alignSelf: 'center',
            paddingVertical: SIZES.spacing * 5,
          }}>
          <View
            style={{
              width: '10%',
              height: '2%',
              borderRadius: 6,
              backgroundColor: COLORS.systemFill,
              alignSelf: 'center',
            }}
          />
          <View
            style={{
              flexDirection: 'row',
              marginVertical: SIZES.spacing * 7,
            }}>
            {props.photo && (
              <MyImage
                style={{
                  width: constants.PROFILE_PIC_SIZE / 2,
                  height: constants.PROFILE_PIC_SIZE / 2,
                  borderRadius: constants.PROFILE_PIC_SIZE / 4,
                }}
                photo={props.photo}
              />
            )}
            <TextInput
              placeholder={
                props.placeholder ? props.placeholder : 'Add a Title...'
              }
              underlineColorAndroid="transparent"
              onChangeText={(textInput) => setTitle(textInput)}
              value={title}
              maxLength={30}
              style={{
                marginLeft: SIZES.spacing * 4,
                width: '100%',
                color: COLORS.primaryLabelColor,
              }}
              placeholderTextColor={COLORS.placeholderTextColor}
            />
          </View>
          <Divider />
          <Text
            text={
              props.description
                ? props.description
                : 'Your followers watching this will see this title.'
            }
            style={{
              fontWeight: 'normal',
              marginBottom: SIZES.spacing * 7,
              marginTop: SIZES.spacing * 7,
            }}
          />
          <Button
            text={props.buttonText ? props.buttonText : 'Add Title'}
            onPress={() => {
              props.onChangeText(title);
            }}
          />
        </View>
      </View>
    </Modal>
  );
}

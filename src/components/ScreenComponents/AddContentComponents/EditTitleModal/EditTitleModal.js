/* eslint-disable no-alert */
/* eslint-disable react-native/no-inline-styles */
import React, {useState} from 'react';
import {View, Modal, KeyboardAvoidingView, Dimensions} from 'react-native';
import {
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native-gesture-handler';
import {Text, Button} from '../../../../components';
import constants from '../../../../resources/constants';
import {SIZES} from '../../../../resources/theme';
import MyImage from '../../../MyImage';
import {Divider} from 'react-native-elements';
import {Constants} from 'react-native-sms-verifycode/util';

const {height} = Dimensions.get('window');

export default function EditTitleModal(props) {
  const [title, setTitle] = useState(props.title);

  return (
    <Modal
      animationType="slide"
      visible
      transparent
      onRequestClose={props.closeModal}>
      <KeyboardAvoidingView
        style={{marginTop: 'auto', flex: 1}}
        behavior="padding">
        <View
          style={{
            marginTop: 'auto',
            backgroundColor: 'white',
            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,
          }}>
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
                backgroundColor: 'lightgray',
                alignSelf: 'center',
              }}
            />
            <View
              style={{flexDirection: 'row', marginVertical: SIZES.spacing * 7}}>
              <MyImage
                style={{
                  width: constants.PROFILE_PIC_SIZE / 2,
                  height: constants.PROFILE_PIC_SIZE / 2,
                  borderRadius: constants.PROFILE_PIC_SIZE / 4,
                }}
                photo={props.photo}
              />
              <TextInput
                placeholder="Add a Title..."
                underlineColorAndroid="transparent"
                onChangeText={(textInput) => setTitle(textInput)}
                value={title}
                maxLength={30}
                style={{marginLeft: SIZES.spacing * 4, width: '100%'}}
              />
            </View>
            <Divider />
            <Text
              text={'Your followers watching this will see this title.'}
              style={{
                color: 'black',
                fontWeight: 'normal',
                marginBottom: SIZES.spacing * 7,
                marginTop: SIZES.spacing * 7,
              }}
            />
            <Button
              text="Add Title"
              onPress={() => {
                props.onChangeText(title);
              }}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

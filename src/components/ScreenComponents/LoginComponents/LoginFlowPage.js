/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {SafeAreaView} from 'react-native';
import {View, TextInput, KeyboardAvoidingView} from 'react-native';
import constants from '../../../resources/constants';
import {Text, Button} from '../../../components';
import {COLORS, SIZES} from '../../../resources/theme';
import PropTypes from 'prop-types';
import {HeaderHeightContext} from '@react-navigation/stack';

export default function LoginFlowPage(props) {
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: constants.BACKGROUND_COLOR,
      }}>
      <HeaderHeightContext.Consumer>
        {(headerHeight) => (
          <KeyboardAvoidingView
            {...(Platform.OS === 'ios' ? {behavior: 'padding'} : {})}
            // you might need sometimes👇
            contentContainerStyle={{flex: 1}}
            // chances are you might be using react-navigation
            // if so 👇
            keyboardVerticalOffset={headerHeight + 64}
            // You can import Header Component from react-navigation and it has height attached to it
            // 64 is some extra padding, I feel good, feel free to tweak it
          >
            <View
              style={{
                width: '85%',
                height: '100%',
                alignSelf: 'center',
              }}>
              <View
                style={{
                  width: '100%',
                  height: '40%',
                  justifyContent: 'flex-end',
                }}>
                <Text
                  text={props.title}
                  style={{fontWeight: 'normal', fontSize: 30}}
                />
              </View>
              <View
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'space-around',
                }}>
                <View style={{width: '100%'}}>{props.component}</View>
              </View>
              <View
                style={{
                  width: '100%',
                  height: '30%',
                  alignItems: 'center',
                  marginBottom: SIZES.spacing * 5,
                }}>
                <Button
                  text={'Next'}
                  buttonStyle={{width: '100%'}}
                  onPress={props.onPressNext}
                />
              </View>
            </View>
          </KeyboardAvoidingView>
        )}
      </HeaderHeightContext.Consumer>
    </SafeAreaView>
  );
}

LoginFlowPage.propTypes = {
  title: PropTypes.string,
  component: PropTypes.elementType,
  onPressNext: PropTypes.func,
};

LoginFlowPage.defaultProps = {
  title: '',
  component: null,
  onPressNext: null,
};

/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {Platform, SafeAreaView} from 'react-native';
import {
  View,
  Dimensions,
  KeyboardAvoidingView,
  TouchableOpacity,
} from 'react-native';
import constants from '../../../resources/constants';
import {Text, Button, GradientText} from '../../../components';
import {COLORS, SIZES} from '../../../resources/theme';
import PropTypes from 'prop-types';
import {HeaderHeightContext} from '@react-navigation/stack';
import {Icon} from 'react-native-elements';

const {width} = Dimensions.get('window');

export default function LoginFlowPage(props) {
  return (
    <SafeAreaView
      style={{
        flex: 1,
      }}>
      <HeaderHeightContext.Consumer>
        {(headerHeight) => (
          <KeyboardAvoidingView
            behavior={constants.KEYBOARD_BEHAVIOR}
            contentContainerStyle={{flex: 1}}
            keyboardVerticalOffset={constants.KEYBOARD_VERTICAL_OFFSET}>
            <View
              style={{
                width: '85%',
                height: '100%',
                alignSelf: 'center',
                marginTop: '5%',
              }}>
              <View
                style={{
                  width: '100%',
                  height: '30%',
                  justifyContent: 'flex-end',
                }}>
                <Text
                  text={props.title}
                  style={{
                    fontSize: SIZES.h1,
                    fontWeight: 'bold',
                    fontFamily: 'SF Pro Display',
                  }}
                />
                {props.subtitle ? (
                  <Text
                    text={props.subtitle}
                    style={{
                      paddingTop: SIZES.spacing,
                      fontSize: SIZES.h4,
                      color: COLORS.secondaryLabelColor,
                      fontWeight: 'bold',
                      fontFamily: 'SF Pro Display',
                    }}
                  />
                ) : null}
              </View>
              <View
                style={{
                  height: '20%',
                  alignItems: 'center',
                  justifyContent: 'space-around',
                }}>
                <View style={{width: '100%'}}>{props.component}</View>
              </View>
              <View
                style={{
                  width: '100%',
                  alignItems: 'center',
                  marginBottom: SIZES.spacing * 5,
                }}>
                <TouchableOpacity
                  onPress={() => props.onPressNext()}
                  style={{
                    backgroundColor: '#ffffff',
                    paddingVertical: SIZES.padding * 1.2,
                    alignItems: 'center',
                    borderRadius: 12,
                    marginRight: width * 0.03,
                    paddingHorizontal: SIZES.padding * 3.5,
                    marginTop: SIZES.padding * 5,
                  }}>
                  <GradientText
                    colors={['#872EC4', '#B150E2']}
                    start={{x: -0.2, y: 0.7}}
                    end={{x: 0.7, y: 0}}
                    style={{
                      color: 'black',
                      fontSize: 27,
                      fontWeight: 'bold',
                      fontFamily: 'SF Pro Display',
                    }}>
                    Next
                    <Icon
                      name="arrow-right"
                      type="font-awesome-5"
                      size={25}
                      color={'#872EC4'}
                      style={{paddingLeft: 10}}
                    />
                  </GradientText>
                </TouchableOpacity>
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

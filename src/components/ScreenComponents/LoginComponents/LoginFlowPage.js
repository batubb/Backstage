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
import {RFValue} from 'react-native-responsive-fontsize';

const {width, height} = Dimensions.get('window');

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
                marginTop: RFValue(height * 0.05),
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
                    fontSize: RFValue(SIZES.h1),
                    fontWeight: 'bold',
                    fontFamily: 'SF Pro Display',
                  }}
                />
                {props.subtitle ? (
                  <Text
                    text={props.subtitle}
                    style={{
                      paddingTop: SIZES.spacing,
                      fontSize: RFValue(SIZES.h4),
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
                    marginTop: RFValue(SIZES.padding * 5),
                  }}>
                  <GradientText
                    colors={['#872EC4', '#B150E2']}
                    start={{x: -0.2, y: 0.7}}
                    end={{x: 0.7, y: 0}}
                    style={{
                      color: 'black',
                      fontSize: RFValue(23),
                      fontWeight: 'bold',
                      fontFamily: 'SF Pro Display',
                    }}>
                    Next
                    <Icon
                      name="arrow-right"
                      type="font-awesome-5"
                      size={RFValue(20)}
                      color={COLORS.primary}
                      style={[
                        {paddingLeft: 5},
                        Platform.OS === 'android' ? {top: 2} : null,
                      ]}
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

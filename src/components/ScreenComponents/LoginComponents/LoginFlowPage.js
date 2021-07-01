/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {SafeAreaView} from 'react-native';
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
                    fontWeight: 'normal',
                    fontSize: 30,
                    fontWeight: 'bold',
                    fontFamily: 'SF Pro Display',
                  }}
                />
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
                    locations={[0, 0.4, 1]}
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

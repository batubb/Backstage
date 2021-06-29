/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React, {Component} from 'react';
import {View, TouchableOpacity, Dimensions} from 'react-native';
import PropTypes from 'prop-types';
import Text from '../Text';
import {constants} from '../../resources';
import {Icon} from 'react-native-elements';
import {COLORS} from '../../resources/theme';
import {PlatformColor} from 'react-native';

const {width} = Dimensions.get('screen');

const secondaryStyle = {
  backgroundColor: 'transparent',
  borderColor: COLORS.separatorColor,
  borderWidth: 1,
};

export default class Button extends Component {
  render() {
    const {
      buttonStyle,
      textStyle,
      text,
      onPress,
      rightIconProps,
      leftIconProps,
      disabled,
    } = this.props;
    return (
      <TouchableOpacity
        onPress={() => onPress()}
        disabled={disabled}
        style={[
          {
            backgroundColor: COLORS.primary,
            padding: this.props.secondary
              ? 10
              : 10 + secondaryStyle.borderWidth,
            borderRadius: 6,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
          },
          this.props.secondary ? secondaryStyle : null,
          buttonStyle,
        ]}>
        {leftIconProps ? <Icon {...leftIconProps} /> : null}

        <Text
          text={text}
          style={
            !this.props.secondary
              ? [{color: COLORS.white}, textStyle]
              : [textStyle]
          }
        />

        {rightIconProps ? <Icon {...rightIconProps} /> : null}
      </TouchableOpacity>
    );
  }
}

Button.propTypes = {
  onPress: PropTypes.func,
  buttonStyle: PropTypes.object,
  textStyle: PropTypes.object,
  text: PropTypes.string,
};

Button.defaultProps = {
  buttonStyle: {},
  textStyle: {},
  onPress: () => console.log('Button Pressed'),
  text: 'Örnek Buton',
};

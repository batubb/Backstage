/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React, {Component} from 'react';
import {View, TouchableOpacity, Dimensions} from 'react-native';
import PropTypes from 'prop-types';
import Text from '../Text';
import {constants} from '../../resources';
import {Icon} from 'react-native-elements';

const {width} = Dimensions.get('screen');

const secondaryStyle = {
  backgroundColor: 'transparent',
  borderColor: constants.BAR_COLOR,
  borderWidth: 1.5,
};

const secondaryTextStyle = {};

export default class Button extends Component {
  render() {
    const {
      buttonStyle,
      textStyle,
      text,
      onPress,
      rightIconProps,
      disabled,
    } = this.props;
    return (
      <TouchableOpacity
        onPress={() => onPress()}
        disabled={disabled}
        style={[
          {
            backgroundColor: constants.BLUE,
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
        <Text
          text={text}
          style={[
            {fontSize: 14, fontWeight: 'bold', color: 'white'},
            this.props.secondary ? secondaryTextStyle : null,
            textStyle,
          ]}
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

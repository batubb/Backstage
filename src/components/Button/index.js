/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React, {Component} from 'react';
import {View, TouchableOpacity, Dimensions} from 'react-native';
import PropTypes from 'prop-types';
import Text from '../Text';
import {constants} from '../../resources';

const {width} = Dimensions.get('screen');

const secondaryStyle = {
  backgroundColor: 'transparent',
  borderColor: constants.BAR_COLOR,
  borderWidth: 1.5,
};

const secondaryTextStyle = {
  fontSize: 14,
  fontWeight: 'bold',
  color: 'white',
};

export default class Button extends Component {
  render() {
    const {buttonStyle, textStyle, text, onPress} = this.props;
    return (
      <TouchableOpacity
        onPress={() => onPress()}
        style={[
          {
            backgroundColor: '#ffa700',
            padding: 10,
            borderRadius: 6,
            alignItems: 'center',
          },
          buttonStyle,
          this.props.secondary ? secondaryStyle : null,
        ]}>
        <Text
          text={text}
          style={this.props.secondary ? secondaryTextStyle : textStyle}
        />
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

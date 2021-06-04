/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React, {Component} from 'react';
import {View, TouchableOpacity, Dimensions} from 'react-native';
import PropTypes from 'prop-types';
import Text from '../Text';

const {width} = Dimensions.get('screen');

export default class Button extends Component {
  render() {
    const {buttonStyle, textStyle, text, onPress} = this.props;
    return (
      <TouchableOpacity onPress={() => onPress()}>
        <View
          style={[
            {
              backgroundColor: '#ffa700',
              padding: 10,
              borderRadius: 2,
              alignItems: 'center',
              width: width - 40,
            },
            buttonStyle,
          ]}>
          <Text text={text} style={textStyle} />
        </View>
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

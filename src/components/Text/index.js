/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React, {Component} from 'react';
import {Text, Platform} from 'react-native';
import PropTypes from 'prop-types';
import {PlatformColor} from 'react-native';
import {COLORS} from '../../resources/theme';

const secondaryStyle = {
  color: COLORS.secondaryLabelColor,
};

export default class TextComponent extends Component {
  render() {
    const {text, style, numberOfLines, onPress} = this.props;
    return (
      <Text
        numberOfLines={numberOfLines}
        onPress={onPress}
        style={[
          {
            fontFamily:
              Platform.OS === 'ios' ? 'System' : 'Sf-Pro-Display-Bold',
            fontSize: Platform.OS === 'ios' ? 14 : 16,
            color: COLORS.primaryLabelColor,
            fontWeight: 'bold',
          },
          this.props.secondary ? secondaryStyle : null,
          style,
        ]}>
        {text}
      </Text>
    );
  }
}

TextComponent.propTypes = {
  style: PropTypes.object,
  text: PropTypes.string,
  numberOfLines: PropTypes.number,
};

TextComponent.defaultProps = {
  style: {},
  text: '',
  numberOfLines: 0,
};

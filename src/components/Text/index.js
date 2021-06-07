/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React, {Component} from 'react';
import {Text, Platform} from 'react-native';
import PropTypes from 'prop-types';

export default class TextComponent extends Component {
  render() {
    const {text, style, numberOfLines} = this.props;
    return (
      <Text
        numberOfLines={numberOfLines}
        style={[
          {
            fontFamily:
              Platform.OS === 'ios' ? 'Avenir' : 'sans-serif-condensed',
            fontSize: 14,
            color: '#FFF',
            fontWeight: 'bold',
          },
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

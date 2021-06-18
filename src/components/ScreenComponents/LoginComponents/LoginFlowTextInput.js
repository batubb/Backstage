/* eslint-disable react-native/no-inline-styles */
import React, {useState} from 'react';
import {TextInput} from 'react-native';

import PropTypes from 'prop-types';
import {COLORS} from '../../../resources/theme';

const BORDER_RADIUS = 6;

export default function LoginFlowTextInput(props) {
  return (
    <TextInput
      value={props.text}
      style={{
        backgroundColor: COLORS.white,
        borderRadius: BORDER_RADIUS,
        textAlign: 'center',
        height: 50,
        fontSize: 20,
      }}
      onChangeText={(name) => props.onChangeText(name)}
      autoFocus
      placeholder={props.placeholder}
      placeholderTextColor={'lightgray'}
      placeholderStyle={{fontSize: 50}}
      maxLength={props.maxLength}
    />
  );
}

LoginFlowTextInput.propTypes = {
  text: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  maxLength: PropTypes.number.isRequired,
};

LoginFlowTextInput.defaultProps = {
  placeholder: '',
};

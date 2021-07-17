/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React, {Component} from 'react';
import {View, Dimensions, TouchableOpacity, ActionSheetIOS} from 'react-native';
import Text from '../Text';
import {BottomSheet} from 'react-native-elements';
import PropTypes from 'prop-types';
import { Platform } from 'react-native';

const {width, height} = Dimensions.get('window');
const BOTTOM_PAD = height >= 812 ? 0 : 20;

export default class Options extends Component {
  state = {
    visible: false,
  };

  componentDidMount = () => {
    if (this.props.visible) {
      this.openActionSheet();
    }
  };

  UNSAFE_componentWillUpdate = (nextProps) => {
    if (nextProps.visible) {
      this.openActionSheet();
    }
  };

  openActionSheet = () => {
    const {list, cancelPress} = this.props;

    if (Platform.OS === 'ios') {
      if (!this.state.visible) {
        const options = [...list.map((l) => l.title), 'Cancel'];
        this.state.visible = true;
  
        ActionSheetIOS.showActionSheetWithOptions(
          {
            options,
            destructiveButtonIndex: list.findIndex((option) => option.danger === true),
            cancelButtonIndex: options.length - 1,
            tintColor: 'white',
            userInterfaceStyle: 'dark',
          },
          (buttonIndex) => {
            this.state.visible = false;
  
            if (buttonIndex === options.length - 1) {
              cancelPress();
            } else {
              list[buttonIndex].onPress();
            }
          },
        );
      }
    }
  };

  render() {

    if (Platform.OS === 'ios') {
      return null;
    }
    
    return (
      <BottomSheet
        isVisible={visible}
        containerStyle={{backgroundColor: 'rgba(0.5, 0.25, 0, 0.2)'}}>
        {list.map((l, i) => (
          <TouchableOpacity
            key={i}
            style={{width: width, alignItems: 'center'}}
            onPress={l.onPress}>
            <View
              key={i}
              style={[
                {
                  borderBottomWidth: i === list.length - 1 ? 0 : 0.5,
                  borderColor: '#4d4d4d',
                  width: width - 20,
                  backgroundColor: '#424242',
                  borderTopLeftRadius: i === 0 ? 8 : 0,
                  borderTopRightRadius: i === 0 ? 8 : 0,
                  borderBottomLeftRadius: i === list.length - 1 ? 8 : 0,
                  borderBottomRightRadius: i === list.length - 1 ? 8 : 0,
                  padding: 10,
                  alignItems: 'center',
                },
                buttonStyle,
              ]}>
              <Text
                text={l.title}
                style={{fontSize: 16, color: l.color ? l.color : 'white'}}
              />
            </View>
          </TouchableOpacity>
        ))}
        {cancelPress ? (
          <TouchableOpacity
            style={{
              width: width,
              alignItems: 'center',
              marginTop: 10,
              marginBottom: BOTTOM_PAD,
            }}
            onPress={cancelPress}>
            <View
              style={[
                {
                  width: width - 20,
                  backgroundColor: '#424242',
                  borderRadius: 8,
                  padding: 10,
                  alignItems: 'center',
                },
                buttonStyle,
              ]}>
              <Text text="Cancel" style={{fontSize: 16}} />
            </View>
          </TouchableOpacity>
        ) : null}
      </BottomSheet>
    );
  }
}

Options.propTypes = {
  list: PropTypes.array.isRequired,
  visible: PropTypes.bool.isRequired,
  cancelPress: PropTypes.func,
  buttonStyle: PropTypes.object,
};

Options.defaultProps = {
  visible: false,
  cancelPress: null,
  buttonStyle: {},
};

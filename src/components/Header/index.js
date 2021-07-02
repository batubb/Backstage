/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React from 'react';
import {Platform, Dimensions, StyleSheet, View} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {Icon, Header} from 'react-native-elements';
import PropTypes from 'prop-types';
import {constants} from '../../resources';
import {COLORS, SIZES} from '../../resources/theme';
import Text from '../Text';
import VerifiedIcon from '../VerifiedIcon';

const {width} = Dimensions.get('window');

export default class HeaderComponent extends React.Component {
  render() {
    const {
      borderColor,
      backgroundColor,
      rightButtonIcon,
      rightSecondButtonIcon,
      placement,
      leftButtonIcon,
      title,
      rightButtonPress,
      rightSecondButtonPress,
      leftButtonPress,
      rightButtonColor,
      rightSecondButtonColor,
      showVerificationIcon,
    } = this.props;

    return (
      <Header
        statusBarProps={{
          barStyle: 'light-content',
          backgroundColor: backgroundColor,
        }}
        leftComponent={
          leftButtonPress ? (
            <TouchableOpacity
              style={styles.leftIcon}
              onPress={() => leftButtonPress()}>
              <Icon
                name={leftButtonIcon}
                color="#FFF"
                type="material-community"
                size={40}
              />
            </TouchableOpacity>
          ) : null
        }
        centerComponent={
          <View style={{flexDirection: 'row'}}>
            <Text
              text={title.length >= 22 ? `${title.substring(0, 22)}...` : title}
              style={{fontSize: 18}}
            />
            {showVerificationIcon ? <VerifiedIcon size={18} /> : null}
          </View>
        }
        centerContainerStyle={{
          justifyContent: 'center',
        }}
        rightComponent={
          <View style={{flexDirection: 'row'}}>
            {rightSecondButtonPress ? (
              <TouchableOpacity
                style={styles.rightIcon}
                onPress={() => rightSecondButtonPress()}>
                <Icon
                  name={rightSecondButtonIcon}
                  color={
                    rightSecondButtonColor ? rightSecondButtonColor : '#FFF'
                  }
                  type="material-community"
                />
              </TouchableOpacity>
            ) : null}
            {rightButtonPress ? (
              <TouchableOpacity
                style={styles.secondRightIcon}
                onPress={() => rightButtonPress()}>
                <Icon
                  name={rightButtonIcon}
                  color={rightButtonColor ? rightButtonColor : '#FFF'}
                  type="material-community"
                />
              </TouchableOpacity>
            ) : null}
          </View>
        }
        placement={placement}
        containerStyle={{
          borderBottomWidth: borderColor === '' ? 0 : StyleSheet.hairlineWidth,
          backgroundColor: backgroundColor,
          borderColor: borderColor,
          alignItems: 'stretch',
        }}
        rightContainerStyle={{
          justifyContent: 'center',
        }}
        leftContainerStyle={{
          justifyContent: 'center',
        }}
      />
    );
  }
}

HeaderComponent.propTypes = {
  leftButtonIcon: PropTypes.string,
  rightButtonIcon: PropTypes.string,
  rightSecondButtonIcon: PropTypes.string,
  title: PropTypes.string,
  leftButtonPress: PropTypes.func,
  rightButtonPress: PropTypes.func,
  rightSecondButtonPress: PropTypes.func,
  backgroundColor: PropTypes.string,
  borderColor: PropTypes.string,
  placement: PropTypes.string,
};

HeaderComponent.defaultProps = {
  leftButtonIcon: 'star',
  rightButtonIcon: 'star',
  rightSecondButtonIcon: 'star',
  title: '',
  leftButtonPress: null,
  rightButtonPress: null,
  rightSecondButtonPress: null,
  backgroundColor: constants.BACKGROUND_COLOR,
  borderColor: '',
  placement: 'center',
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fdde02',
    width: width,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftIcon: {
    //paddingHorizontal: 15,
  },
  rightIcon: {
    paddingHorizontal: 15,
  },
  secondRightIcon: {
    paddingRight: 7,
  },
  title: {
    fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif-condensed',
    fontSize: 20,
    color: '#FFF',
    fontWeight: 'bold',
  },
});

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
import MyImage from '../MyImage';

const {width} = Dimensions.get('window');

export default class HeaderComponent extends React.Component {
  render() {
    const {
      borderColor,
      backgroundColor,
      rightButtonIcon,
      rightButtonIconSize,
      rightSecondButtonIcon,
      rightSecondButtonIconSize,
      placement,
      leftButtonIcon,
      leftButtonIconSize,
      title,
      centerComponent,
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
                size={leftButtonIconSize ?? 40}
              />
            </TouchableOpacity>
          ) : null
        }
        centerComponent={
          !centerComponent ? (
            <View style={{flexDirection: 'row'}}>
              <Text
                text={
                  title.length >= 22 ? `${title.substring(0, 22)}...` : title
                }
                style={{fontSize: 18}}
              />
              {showVerificationIcon ? <VerifiedIcon size={18} /> : null}
            </View>
          ) : (
            centerComponent
          )
        }
        centerContainerStyle={{
          justifyContent: 'center',
        }}
        rightComponent={
          <View style={{flexDirection: 'row'}}>
            {rightSecondButtonPress ? (
              <TouchableOpacity
                style={styles.secondRightIcon}
                onPress={() => rightSecondButtonPress()}>
                <Icon
                  name={rightSecondButtonIcon}
                  color={
                    rightSecondButtonColor ? rightSecondButtonColor : '#FFF'
                  }
                  size={rightSecondButtonIconSize ?? 24}
                  type="material-community"
                />
              </TouchableOpacity>
            ) : null}
            {rightButtonPress ? (
              <TouchableOpacity
                style={styles.rightIcon}
                onPress={() => rightButtonPress()}>
                <Icon
                  name={rightButtonIcon}
                  color={rightButtonColor ? rightButtonColor : '#FFF'}
                  size={rightButtonIconSize ?? 24}
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
    paddingRight: 15,
  },
  secondRightIcon: {
    paddingRight: 15,
  },
  title: {
    fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif-condensed',
    fontSize: 20,
    color: '#FFF',
    fontWeight: 'bold',
  },
});

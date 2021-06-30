/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React, {Component} from 'react';
import {Dimensions, TouchableOpacity, View, StyleSheet} from 'react-native';
import {Icon} from 'react-native-elements';
import Text from '../Text';
import {constants} from '../../resources';

const {width} = Dimensions.get('window');

export default class ProfileLabels extends Component {
  render() {
    const {
      onPressFunction,
      icon,
      text,
      border,
      style = {},
      showRightIcon = true,
      showLeftIcon = true,
      customRightComponent,
      touchableOpacityProps,
    } = this.props;

    return (
      <TouchableOpacity onPress={() => onPressFunction()} {...touchableOpacityProps}>
        <View
          style={[
            styles.labelCont,
            {borderBottomWidth: border ? 0.5 : 0},
            style,
          ]}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            {showLeftIcon ? (
              <View style={styles.icon}>
                <Icon name={icon} color="#FFF" type="material-community" />
              </View>
            ) : null}
            <Text text={text} style={styles.labelText} />
          </View>
          {!customRightComponent && showRightIcon ? (
            <View style={styles.chevron}>
              <Icon name="chevron-right" color="gray" />
            </View>
          ) : null}
          {customRightComponent}
        </View>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  containerStyle: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  labelCont: {
    borderColor: constants.BAR_COLOR,
    flexDirection: 'row',
    width: width,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  icon: {
    width: 30,
    alignItems: 'center',
  },
  labelText: {
    marginLeft: 10,
    fontSize: 16,
  },
  chevron: {
    padding: 5,
  },
});

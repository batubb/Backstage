/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React, {Component} from 'react';
import {
  View,
  Platform,
  TextInput,
  Dimensions,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import PropTypes from 'prop-types';
import Text from '../../components/Text';
import {Icon} from 'react-native-elements';
import {COLORS, SIZES} from '../../resources/theme';
import Animated from 'react-native-reanimated';
import {runTiming} from '../../lib';

const {width} = Dimensions.get('window');

export default class SearchBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      search: '',
      showCancelButton: false,
    };
  }
  animatedWidthClock = new Animated.Clock();
  animatedWidthValue = new Animated.Value(width - 20);

  openCancelButton = () => {
    this.animatedWidthValue = runTiming(
      this.animatedWidthClock,
      300,
      new Animated.Value(width - 20),
      new Animated.Value(width - 90),
    );
    this.setState({showCancelButton: true});
  };

  closeCancelButton = () => {
    this.setState({showCancelButton: false});
    this.animatedWidthValue = runTiming(
      this.animatedWidthClock,
      400,
      new Animated.Value(width - 90),
      new Animated.Value(width - 20),
    );
  };

  render() {
    const {searchUser, text} = this.props;
    const {search, showCancelButton} = this.state;

    return (
      <View
        style={{
          width,
          paddingHorizontal: 10,
          flexDirection: 'row',
          ...this.props.style,
        }}>
        <Animated.View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: this.animatedWidthValue,
            borderRadius: 4,
            paddingHorizontal: 10,
            backgroundColor: COLORS.secondaryBackgroundColor,
          }}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Icon name="magnify" color="gray" type="material-community" />
            <TextInput
              placeholder={text ?? "Search"}
              style={{
                fontFamily:
                  Platform.OS === 'ios' ? 'Avenir' : 'sans-serif-condensed',
                color: '#FFF',
                width: width - (showCancelButton ? 150 : 20),
                fontSize: 16,
                padding: SIZES.padding,
              }}
              onFocus={() => {
                if (!this.state.showCancelButton) {
                  this.openCancelButton();
                }
              }}
              underlineColorAndroid="transparent"
              onChangeText={(searchInput) => {
                searchUser(searchInput);
                this.setState({search: searchInput});
              }}
              value={search}
              placeholderTextColor="gray"
            />
          </View>
          {search !== '' ? (
            <TouchableOpacity
              onPress={() => {
                searchUser('');
                this.setState({search: ''});
              }}
              style={{right: 10}}>
              <View style={{padding: 10}}>
                <Icon
                  name="close-circle"
                  color="#FFF"
                  type="material-community"
                  size={16}
                />
              </View>
            </TouchableOpacity>
          ) : null}
        </Animated.View>
        {showCancelButton ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              this.closeCancelButton();
              if (search !== '') {
                searchUser('');
                this.setState({search: ''});
              }
              Keyboard.dismiss();
            }}
            style={{
              alignSelf: 'center',
              justifyContent: 'center',
              width: 90,
              paddingRight: 16,
              padding: SIZES.padding,
            }}>
            <Text
              text="Cancel"
              style={{color: COLORS.gray, textAlign: 'center'}}
            />
          </TouchableOpacity>
        ) : null}
      </View>
    );
  }
}

SearchBar.propTypes = {
  searchUser: PropTypes.func,
  style: PropTypes.object,
};

SearchBar.defaultProps = {
  searchUser: null,
  style: {},
};

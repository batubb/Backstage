/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React, {Component} from 'react';
import {
  View,
  Platform,
  TextInput,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import PropTypes from 'prop-types';
import {Icon} from 'react-native-elements';
import {constants} from '../../resources';

const {width} = Dimensions.get('window');

export default class SearchBar extends Component {
  state = {
    search: '',
  };

  render() {
    const {searchUser} = this.props;
    const {search} = this.state;

    return (
      <View style={{width, alignItems: 'center'}}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: width - 20,
            borderRadius: 4,
            paddingHorizontal: 10,
            backgroundColor: constants.BAR_COLOR,
          }}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Icon name="magnify" color="gray" type="material-community" />
            <TextInput
              placeholder="Search"
              style={{
                fontFamily:
                  Platform.OS === 'ios' ? 'Avenir' : 'sans-serif-condensed',
                color: '#FFF',
                width: width - 110,
                fontSize: 16,
                padding: 10,
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
              }}>
              <View style={{paddingVertical: 10}}>
                <Icon
                  name="close-circle"
                  color="#FFF"
                  type="material-community"
                  size={16}
                />
              </View>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    );
  }
}

SearchBar.propTypes = {
  searchUser: PropTypes.func,
};

SearchBar.defaultProps = {
  searchUser: null,
};

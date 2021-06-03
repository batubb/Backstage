/* eslint-disable react/no-did-mount-set-state */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React, {Component} from 'react';
import {
  View,
  Dimensions,
  Platform,
  Alert,
  TextInput,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {observer} from 'mobx-react';
import {Loading, Header, Button, MyImage} from '../../components';
import {constants} from '../../resources';
import {checkUserInfo, checkUsernameValid} from '../../services';
import Store from '../../store/Store';
import {regexCheck} from '../../lib';
import {StackActions} from '@react-navigation/native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import database from '@react-native-firebase/database';
import storage from '@react-native-firebase/storage';

const {width} = Dimensions.get('window');

class MyInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      refreshing: false,
      input: '',
      type: this.props.route.params.type,
    };
  }

  componentDidMount = async () => {
    if (this.state.type === 'name') {
      this.setState({
        input: typeof Store.user.name === 'undefined' ? '' : Store.user.name,
      });
    } else if (this.state.type === 'biography') {
      this.setState({
        input:
          typeof Store.user.biography === 'undefined'
            ? ''
            : Store.user.biography,
      });
    } else if (this.state.type === 'username') {
      this.setState({
        input:
          typeof Store.user.username === 'undefined' ? '' : Store.user.username,
      });
    }

    this.setState({loading: false});
  };

  saveInfo = async () => {
    if (this.state.input === '' && this.state.type === 'name') {
      return Alert.alert('Oops', 'You have to enter your name.', [
        {text: 'Okay'},
      ]);
    }

    if (this.state.input === '' && this.state.type === 'username') {
      return Alert.alert('Oops', 'You have to enter your username.', [
        {text: 'Okay'},
      ]);
    }

    if (this.state.type === 'username') {
      const checkValid = await checkUsernameValid(this.state.input);

      if (regexCheck(this.state.input)) {
        return Alert.alert(
          'Oops',
          'You can not user any symbol. Please use only letters and numbers',
          [{text: 'Okay'}],
        );
      }

      if (checkValid && Store.user.username !== this.state.input) {
        return Alert.alert(
          'Oops',
          'This username is taken. You have to choose another username.',
          [{text: 'Okay'}],
        );
      }
    }

    this.setState({loading: true});

    var updates = {};
    updates[`users/${Store.user.uid}/${this.state.type}`] = this.state.input;

    try {
      await database().ref().update(updates);
      await checkUserInfo(Store.uid, true);
      this.props.navigation.dispatch(StackActions.pop());
    } catch (error) {
      return Alert.alert('Oops', 'Something unexpected happens.', [
        {text: 'Okay'},
      ]);
    }

    this.setState({loading: false});
  };

  setInput = (text) => {
    if (this.state.type === 'username') {
      this.setState({input: text.toLowerCase()});
    } else {
      this.setState({input: text});
    }
  };

  render() {
    const {loading, refreshing, type, input} = this.state;
    var placeholder = '';

    if (type === 'name') {
      placeholder = 'Your Name';
    } else if (type === 'biography') {
      placeholder = 'Biography';
    } else if (type === 'username') {
      placeholder = 'Username';
    }

    return (
      <View style={{flex: 1, backgroundColor: constants.BACKGROUND_COLOR}}>
        <Header
          title={`Change ${placeholder}`}
          leftButtonPress={() =>
            this.props.navigation.dispatch(StackActions.pop())
          }
          leftButtonIcon="chevron-left"
          rightButtonPress={() => this.saveInfo()}
          rightButtonIcon="check"
        />
        {loading ? (
          <Loading
            loadingStyle={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            textStyle={{marginTop: 10, fontWeight: 'normal'}}
            text="Loading"
          />
        ) : (
          <ScrollView
            refreshControl={
              <RefreshControl refreshing={refreshing} tintColor="white" />
            }>
            <TextInput
              placeholder={placeholder}
              style={{
                fontFamily:
                  Platform.OS === 'ios' ? 'Avenir' : 'sans-serif-condensed',
                margin: 10,
                width: width - 20,
                padding: 13,
                color: 'white',
                fontWeight: 'bold',
                fontSize: 14,
                borderRadius: 4,
                backgroundColor: '#424242',
              }}
              underlineColorAndroid="transparent"
              onChangeText={(textInput) => this.setInput(textInput)}
              value={input}
              maxLength={type === 'username' ? 20 : 50}
              placeholderTextColor="gray"
            />
          </ScrollView>
        )}
      </View>
    );
  }
}

export default observer(MyInfo);

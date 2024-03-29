/* eslint-disable react/no-did-mount-set-state */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React, {Component} from 'react';
import {
  View,
  Dimensions,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
} from 'react-native';
import {observer} from 'mobx-react';
import {StackActions} from '@react-navigation/native';
import {
  Loading,
  Header,
  Text,
  Button,
  MyImage,
  SearchBar,
} from '../../components';
import {constants} from '../../resources';
import {
  checkUserInfo,
  createUser,
  getFollowList,
  getDealsData,
  searchUser,
  checkUsernameValid,
} from '../../services';
import {Icon} from 'react-native-elements';
import {followerCount, controlArray, regexCheck} from '../../lib';

import Store from '../../store/Store';
import {SafeAreaView} from 'react-native';
import {COLORS, SIZES} from '../../resources/theme';
import LoginFlowPage from '../../components/ScreenComponents/LoginComponents/LoginFlowPage';
import LoginFlowTextInput from '../../components/ScreenComponents/LoginComponents/LoginFlowTextInput';

const {width} = Dimensions.get('window');
const BORDER_RADIUS = 6;

class CheckInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      name: '',
      username: '@',
      step: 1,
      followingArray: [],
      userArray: [],
      search: '',
      searchArray: [],
    };
  }

  componentDidMount = async () => {
    const result = await checkUserInfo(Store.uid, true);
    await getFollowList(Store.uid);

    if (!result) {
      const userArray = await getDealsData();
      this.setState({loading: false, userArray});
    } else {
      //this.setState({loading: false});
      const replaceActions = StackActions.replace('TabBarMenu');
      return this.props.navigation.dispatch(replaceActions);
    }
  };

  createAccount = async () => {
    const data = {
      name: this.state.name,
      username: this.state.username.toLowerCase().substring(1),
      type: 'user',
      follower: 0,
      like: 0,
      price: 0,
    };

    const result = await createUser(
      Store.uid,
      Store.phone,
      data,
      this.state.followingArray,
    );

    if (result) {
      const replaceActions = StackActions.replace('TabBarMenu', {
        screen: 'TabBarBottom',
        params: {screen: 'SearchMenu'},
      });
      return this.props.navigation.dispatch(replaceActions);
    }
  };
  onPressNextUsername = async () => {
    if (this.state.username === '' || this.state.username === '@') {
      Alert.alert('Oops', 'Username can not be empty', [{text: 'Okay'}]);
    } else {
      if (regexCheck(this.state.username.substring(1))) {
        Alert.alert(
          'Oops',
          'You can not user any symbol. Please use only letters and numbers',
          [{text: 'Okay'}],
        );
      } else {
        this.setState({loading: true});
        const checkUsername = await checkUsernameValid(
          this.state.username.substring(1),
        );
        if (checkUsername) {
          Alert.alert(
            'Oops',
            'This username is taken. Please try a different username.',
            [{text: 'Okay'}],
          );
          this.setState({loading: false});
        } else {
          this.createAccount();
        }
      }
    }
  };

  render() {
    console.log(this.props.navigation);
    const {loading, step} = this.state;
    if (loading) {
      return (
        <View style={{flex: 1, backgroundColor: constants.BACKGROUND_COLOR}}>
          <Header />
          <Loading
            loadingStyle={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            textStyle={{marginTop: 10, fontWeight: 'normal'}}
            text="Loading"
          />
        </View>
      );
    } else {
      return (
        <View style={{flex: 1, backgroundColor: constants.BACKGROUND_COLOR}}>
          <Header
            leftButtonPress={
              step === 2 ? () => this.setState({step: step - 1}) : null
            }
            leftButtonIcon={step === 2 ? 'chevron-left' : null}
          />
          {step === 1 ? (
            <LoginFlowPage
              title={"What's your full name?"}
              component={
                <LoginFlowTextInput
                  text={this.state.name}
                  onChangeText={(name) => this.setState({name: name})}
                  placeholder={'Jane Doe'}
                  maxLength={25}
                />
              }
              onPressNext={() => {
                this.state.name === ''
                  ? Alert.alert('Oops', 'Name can not be empty', [
                      {text: 'Okay'},
                    ])
                  : this.setState({step: step + 1});
              }}
            />
          ) : step === 2 ? (
            <LoginFlowPage
              title={'Pick a username'}
              component={
                <LoginFlowTextInput
                  text={this.state.username}
                  onChangeText={(username) =>
                    this.setState({
                      username: (this.state.username !== ''
                        ? username
                        : username === '@'
                        ? username
                        : '@' + username
                      ).toLocaleLowerCase(),
                    })
                  }
                  maxLength={20}
                />
              }
              onPressNext={() => this.onPressNextUsername()}
            />
          ) : null}
        </View>
      );
    }
  }
}

export default observer(CheckInfo);

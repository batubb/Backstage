/* eslint-disable react/no-did-mount-set-state */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React, {Component} from 'react';
import {View, Alert, Linking, LogBox} from 'react-native';
import {observer} from 'mobx-react';
import {StackActions} from '@react-navigation/native';
import {Loading, Header} from '../../components';
import {constants} from '../../resources';
import {
  checkUserInfo,
  createUser,
  getFollowList,
  getDealsData,
  checkUsernameValid,
  setUserDeviceInfo,
  checkReferenceCode,
} from '../../services';

import Store from '../../store/Store';
import LoginFlowPage from '../../components/ScreenComponents/LoginComponents/LoginFlowPage';
import LoginFlowTextInput from '../../components/ScreenComponents/LoginComponents/LoginFlowTextInput';
import LinearGradient from 'react-native-linear-gradient';
import {sleep, regexCheck, handleURLSchemes} from '../../lib';
import OneSignal from 'react-native-onesignal';
import * as Sentry from '@sentry/react-native';

LogBox.ignoreLogs([
  "Warning: Can't perform a React status update on an unmounted component",
]);

class CheckInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      name: '',
      username: '@',
      referenceCode: '',
      step: 1,
      followingArray: [],
      userArray: [],
      search: '',
      searchArray: [],
      userUidReferedBy: props.route.params?.userUidReferedBy,
    };
  }

  componentDidMount = async () => {
    const result = await checkUserInfo(Store.uid, true);
    await getFollowList(Store.uid);

    if (!result) {
      const userArray = await getDealsData();
      this.setState({loading: false, userArray});
    } else {
      let deviceState = await OneSignal.getDeviceState();
      if (!deviceState.isSubscribed) {
        OneSignal.disablePush(false);
        deviceState = await OneSignal.getDeviceState();
      }
      await setUserDeviceInfo(Store, deviceState);

      Sentry.setUser({
        id: Store.uid,
        username: Store.user.username,
        data: Store.user,
      });

      const replaceActions = StackActions.replace('TabBarMenu');
      this.props.navigation.dispatch(replaceActions);

      if (this.props.route.params?.goToDiscover === true) {
        await sleep(500);
        this.props.navigation.navigate('SearchMenu', {screen: 'Search'});
      }

      if (!this.props.route.params?.userUidReferedBy) {
        Linking.getInitialURL().then(async (url) => {
          if (url) {
            handleURLSchemes({url}, {navigation: this.props.navigation});
          }
        });
      }
    }
  };

  createAccount = async () => {
    const deviceState = await OneSignal.getDeviceState();
    const data = {
      name: this.state.name,
      username: this.state.username.toLowerCase().substring(1),
      type: 'user',
      follower: 0,
      like: 0,
      price: 0,
      devices: deviceState.isSubscribed ? [deviceState.userId] : [],
      referedBy: this.state.userUidReferedBy ?? undefined,
    };

    const result = await createUser(
      Store.uid,
      Store.phone,
      data,
      this.state.followingArray,
    );

    if (result) {
      if (this.state.userUidReferedBy) {
        Alert.alert(
          'Your referral code has been applied',
          'Welcome to Backstage!',
          [{text: 'Okay'}],
        );
      }
      const replaceActions = StackActions.replace('TabBarMenu', {
        screen: 'TabBarBottom',
        params: {screen: 'SearchMenu'},
      });
      return this.props.navigation.dispatch(replaceActions);
    }
  };

  onPressNextUsername = async () => {
    if (this.state.username === '' || this.state.username === '@') {
      Alert.alert('Oops', 'Username can not be empty.', [{text: 'Okay'}]);
    } else if (regexCheck(this.state.username.substring(1))) {
      Alert.alert('Oops', 'Please only use letters and numbers.', [
        {text: 'Okay'},
      ]);
    } else {
      this.setState({loading: true});
      const checkUsername = await checkUsernameValid(
        this.state.username.substring(1),
      );
      if (checkUsername) {
        Alert.alert(
          'Oops',
          'This username is already taken. Please try a different one.',
          [{text: 'Okay'}],
        );
        this.setState({loading: false});
      } else if (this.state.userUidReferedBy) {
        this.createAccount();
      } else {
        this.setState({step: 3, loading: false});
      }
    }
  };

  applyReferenceCode = async () => {
    if (this.state.referenceCode === '') {
      this.createAccount();
      return;
    }

    this.setState({loading: true});
    const referedByUser = await checkReferenceCode(this.state.referenceCode);

    if (!referedByUser) {
      this.setState({loading: false});
      Alert.alert(
        'Oops',
        'The referral code could not be found. Please try again.',
        [{text: 'Okay'}],
      );
      return;
    }

    this.setState({userUidReferedBy: referedByUser.uid});
    this.createAccount();
  };

  render() {
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
        <LinearGradient
          colors={constants.CUSTOM_PURPLE_GRADIENT}
          start={{x: -0.2, y: 0.7}}
          end={{x: 0.7, y: 0}}
          locations={[0, 0.4, 1]}
          style={{flex: 1}}>
          <Header
            leftButtonPress={
              step === 2 || step === 3
                ? () => this.setState({step: step - 1})
                : null
            }
            leftButtonIcon={step === 2 || step === 3 ? 'chevron-left' : null}
            backgroundColor={'transparent'}
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
          ) : step === 3 ? (
            <LoginFlowPage
              title={'Referral Code'}
              subtitle={'Optional'}
              component={
                <LoginFlowTextInput
                  text={this.state.referenceCode}
                  onChangeText={(code) =>
                    this.setState({
                      referenceCode: code,
                    })
                  }
                  maxLength={30}
                />
              }
              onPressNext={() => this.applyReferenceCode()}
            />
          ) : null}
        </LinearGradient>
      );
    }
  }
}

export default observer(CheckInfo);

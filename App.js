/* eslint-disable prettier/prettier */
import React, { Component } from 'react';
import Main from './src';
import { Provider } from 'mobx-react';
import MainStore from './src/store/Store';
import codePush from 'react-native-code-push';
import OneSignal from 'react-native-onesignal';
import AsyncStorage from '@react-native-async-storage/async-storage';

class App extends Component {
  componentDidMount = async () => {
    OneSignal.setLogLevel(6, 0);
    OneSignal.setAppId('9a94991e-d65d-4782-b126-e6c7e3e500c2');

    OneSignal.promptForPushNotificationsWithUserResponse(response => {
      console.log('Prompt response:', response);
    });

    OneSignal.setNotificationOpenedHandler(notification => {
      console.log('OneSignal: notification opened:', notification);
    });

    this.onIds();
  }

  onIds = async () => {
    const deviceState = await OneSignal.getDeviceState();

    console.log('Device info: ', deviceState.userId);
    try {
      await AsyncStorage.setItem('pushInfo', deviceState.userId);
    } catch (e) {
      // saving error
    }
  }
  render() {
    return (
      <Provider MainStore={MainStore}>
        <Main />
      </Provider>
    );
  }
}

const codePushOptions = {
  checkFrequency: codePush.CheckFrequency.ON_APP_RESUME,
  installMode: codePush.InstallMode.IMMEDIATE,
};

App = codePush(codePushOptions)(App);

export default App;


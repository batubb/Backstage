/* eslint-disable prettier/prettier */
import React, {Component} from 'react';
import Main from './src';
import {Provider} from 'mobx-react';
import MainStore from './src/store/Store';
import codePush from 'react-native-code-push';

class App extends Component {
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

//App = codePush(codePushOptions)(App);

export default App;

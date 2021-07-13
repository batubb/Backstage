/* eslint-disable prettier/prettier */
import React, {Component} from 'react';
import Main from './src';
import {Provider} from 'mobx-react';
import MainStore from './src/store/Store';
import codePush from 'react-native-code-push';
import OneSignal from 'react-native-onesignal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNIap from 'react-native-iap';
import {Alert} from 'react-native';
import database from '@react-native-firebase/database';
import {subscribeInfluencer, setUserDeviceInfo} from './src/services';

class App extends Component {
  constructor(props) {
    super(props);

    this.purchaseUpdatedListener = null;
    this.purchaseErrorListener = null;
  }

  validate = async (receipt, originalTransactionIdentifierIOS) => {
    console.log('in validate');
    console.log('receipt sending to server is ', receipt);
    const receiptBody = {
      'receipt-data': receipt,
      password: '2fc108dab79448b4a61f238ba37e4742',
      originalTransactionId: originalTransactionIdentifierIOS,
    };
    try {
      const deliveryReceipt = await fetch(
        'https://us-central1-backstage-ceb27.cloudfunctions.net/validateIOS',
        {
          headers: {'Content-Type': 'application/json'},
          method: 'POST',
          body: JSON.stringify({data: receiptBody}),
        },
      );
      const other = await deliveryReceipt.json();
      console.log(other.result);
      console.log('receipt received from the server is ', other.result);
      return other.result;
    } catch (error) {
      console.log('caught error ', error);
    }
  };

  getInfluencerUIDFromProductId = async (productId) => {
    const snapshot = await database().ref('users').once('value');
    let foundUser = null;
    snapshot.forEach((user) => {
      if (user.val().appStoreProductId === productId) {
        foundUser = user.val().uid;
      }
    });
    return foundUser;
  };

  updateTimeOnDbIfTransactionExists = async (
    originalTransactionId,
    expiryDate,
  ) => {
    const snapshot = await database().ref('followList').once('value');
    let followerUID = null;
    let infUID = null;
    snapshot.forEach((user) => {
      // key is the influencer uid
      // user.val()[key][followerUID] is the user id
      for (const key in user.val()) {
        if (
          user.val()[key]['appStoreOriginalTransactionId'] ===
          originalTransactionId
        ) {
          console.log('found transaction');
          followerUID = user.val()[key].followerUID;
          infUID = user.val()[key].uid;
        }
      }
    });
    if (followerUID && infUID) {
      const curEnd = await database()
        .ref('followList')
        .child(followerUID)
        .child(infUID)
        .child('endTimestamp')
        .once('value');
      const curEndV = Number(curEnd.val());
      console.log('current end is ', curEndV);
      var updates = {};
      console.log(expiryDate);
      console.log(' max date is ', Math.max(curEndV, expiryDate));
      updates[`followList/${followerUID}/${infUID}/endTimestamp`] = Math.max(
        curEndV,
        expiryDate,
      );
      await database().ref().update(updates);
      return true;
    }
    return false;
  };

  updateSubscriptionOnDb = async (
    originalTransactionId,
    expiryDate,
    productId,
  ) => {
    // 1. if the originalTransactionId exists in the db, update its expiryDate
    const transactionExistsInDb = await this.updateTimeOnDbIfTransactionExists(
      originalTransactionId,
      expiryDate,
    );
    if (transactionExistsInDb) return;
    // 2. if it does not, create a new subscription
    console.log('in create sub on db');
    const sub = {
      type: 'apple',
      current_period_end: expiryDate,
      originalTransactionId: originalTransactionId,
    };
    const inf = {
      uid: await this.getInfluencerUIDFromProductId(productId),
    };
    console.log('user id is ', MainStore.user);
    console.log('influencer id is');
    const subResult = await subscribeInfluencer(MainStore.user, inf, sub);
    console.log('subs result is ', subResult);
  };

  componentDidMount = async () => {
    OneSignal.setLogLevel(6, 0);
    OneSignal.setAppId('9a94991e-d65d-4782-b126-e6c7e3e500c2');

    OneSignal.promptForPushNotificationsWithUserResponse((response) => {
      console.log('Prompt response:', response);
    });

    OneSignal.setNotificationOpenedHandler((notification) => {
      console.log('OneSignal: notification opened:', notification);
    });

    this.onIds();

    await RNIap.initConnection();
    console.log('Connected to store..');

    this.purchaseUpdatedListener = RNIap.purchaseUpdatedListener(
      async (purchase) => {
        try {
          const receipt = purchase.transactionReceipt;
          console.log('in receipt', receipt);
          console.log('in purchase', purchase);
          if (receipt) {
            const validateRes = await this.validate(
              receipt,
              purchase.originalTransactionIdentifierIOS,
            );
            const {receiptValidated, expiryDate} = validateRes;
            if (receiptValidated) {
              console.log('receipt validated', validateRes);
              this.updateSubscriptionOnDb(
                purchase.originalTransactionIdentifierIOS
                  ? purchase.originalTransactionIdentifierIOS
                  : purchase.transactionId,
                Number(expiryDate),
                purchase.productId,
              );
              await RNIap.finishTransaction(purchase, false, false);
            }
          }
        } catch (error) {
          console.log('purchase update listener faced an error ', error);
        }
      },
    );

    this.purchaseErrorListener = RNIap.purchaseErrorListener(async (error) => {
      console.log(error);
      //this.updateSubscriptionOnDb('1000000833092407', '1624726772000');
      if (error['responseCode'] === '2') {
        console.log('cancelled by user');
      } else {
        Alert.alert('there has been an error with the purchase');
      }
    });
  };

  componentWillUnmount = () => {
    if (this.purchaseUpdatedListener) {
      this.purchaseUpdatedListener.remove();
      this.purchaseUpdatedListener = null;
    }
    if (this.purchaseErrorListener) {
      this.purchaseErrorListener.remove();
      this.purchaseErrorListener = null;
    }

    RNIap.endConnection().catch((error) => {
      console.log('error ending connection ', error);
    });
  };

  onIds = async () => {
    const deviceState = await OneSignal.getDeviceState();

    console.log('Device info: ', deviceState.userId);
    try {
      await AsyncStorage.setItem('pushInfo', deviceState.userId);
      await setUserDeviceInfo(deviceState);
    } catch (e) {
      // saving error
    }
  };
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

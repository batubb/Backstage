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
import {
  subscribeInfluencer,
  sendNotificationToUserDevices,
} from './src/services';
import {constants} from './src/resources';
import {environment} from './src/lib';
import Orientation from 'react-native-orientation-locker';

class App extends Component {
  constructor(props) {
    super(props);

    this.purchaseUpdatedListener = null;
    this.purchaseErrorListener = null;
  }

  validate = async (receipt, originalTransactionIdentifierIOS) => {
    console.log('in validate', {originalTransactionIdentifierIOS});
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
      return {receiptValidated: false, expiryDate: 0};
    }
  };

  getInfluencerUIDFromProductId = async (productId, originalTransactionId) => {
    const snapshot = Object.values(
      Object.assign(
        {},
        await (
          await database()
            .ref('users')
            .orderByChild('appStoreProductId')
            .equalTo(productId)
            .once('value')
        ).val(),
      ),
    );
    // let foundUser = null;
    // snapshot.forEach((user) => {
    //   if (user.val().appStoreProductId === productId) {
    //     foundUser = user.val().uid;
    //   }
    // });
    console.log({snapshot0: snapshot?.[0], productId, originalTransactionId});
    return snapshot?.[0].uid ?? null;
  };

  updateTimeOnDbIfTransactionExists = async (
    originalTransactionId,
    expiryDate,
  ) => {
    const snapshot = await database().ref('followList').once('value');
    let followerUID = null;
    let isFollowerInDevelopmentMode = null;
    let infUID = null;
    snapshot.forEach((user) => {
      // key is the influencer uid
      // user.val()[key][followerUID] is the user id
      for (const key in user.val()) {
        if (
          user.val()[key]['appStoreOriginalTransactionId'] ===
          originalTransactionId
        ) {
          console.log('found transaction ', originalTransactionId);
          followerUID = user.val()[key].followerUID;
          infUID = user.val()[key].uid;
          isFollowerInDevelopmentMode = user.val()[key].test ?? null;
        }
      }
    });
    console.log({followerUID, infUID, originalTransactionId, env: environment()});
    if (followerUID && infUID) {
      if (isFollowerInDevelopmentMode === null && environment() !== 'Sandbox') {
        isFollowerInDevelopmentMode =
          (await (
            await database()
              .ref('users')
              .child(followerUID)
              .child('isInTestMode')
              .once('value')
          ).val()) === true
            ? true
            : false;
      }

      const curEnd = await database()
        .ref('followList')
        .child(followerUID)
        .child(infUID)
        .child('endTimestamp')
        .once('value');
      const curEndV = Number(curEnd.val());
      var updates = {};
      updates[`followList/${followerUID}/${infUID}/test`] =
        isFollowerInDevelopmentMode === true || environment() === 'Sandbox'
          ? true
          : false;
      updates[`followList/${followerUID}/${infUID}/endTimestamp`] = Math.max(
        curEndV,
        expiryDate,
      );
      await database().ref().update(updates);
      if (isFollowerInDevelopmentMode !== true && environment() !== 'Sandbox') {
        const influencerUsername = await (
          await database()
            .ref('users')
            .child(infUID)
            .child('username')
            .once('value')
        ).val();
        await sendNotificationToUserDevices(
          'new-subscriber',
          [infUID],
          undefined,
          `${constants.APP_WEBSITE}/${influencerUsername}/subscribers/new`,
        );
      }
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
    console.log({transactionExistsInDb, originalTransactionId});
    if (transactionExistsInDb) return;
    // 2. if it does not, create a new subscription
    console.log('in create sub on db ', originalTransactionId);
    const sub = {
      type: 'apple',
      current_period_end: expiryDate,
      originalTransactionId: originalTransactionId,
    };
    const inf = {
      uid: await this.getInfluencerUIDFromProductId(
        productId,
        originalTransactionId,
      ),
    };
    if (inf.uid === null || inf.uid === undefined) {
      console.log(
        'Could not find an influencer with product id ',
        productId,
        originalTransactionId,
      );
      return;
    }
    if (MainStore.user === null) {
      console.log(
        'Could not find a user with product id ',
        productId,
        originalTransactionId,
      );
      return;
    }
    console.log(
      'user id inf id originalTransactionId',
      MainStore.user.uid,
      inf.uid,
      originalTransactionId,
    );
    const subResult = await subscribeInfluencer(MainStore.user, inf, sub);
    console.log('subs result is ', subResult);
  };

  componentDidMount = async () => {
    OneSignal.setLogLevel(6, 0);
    OneSignal.setAppId('9a94991e-d65d-4782-b126-e6c7e3e500c2');

    OneSignal.promptForPushNotificationsWithUserResponse((response) => {
      console.log('Prompt response:', response);
    });

    Orientation.lockToPortrait();

    this.onIds();

    await RNIap.initConnection();
    console.log('Connected to store..');

    this.purchaseUpdatedListener = RNIap.purchaseUpdatedListener(
      async (purchase) => {
        try {
          const receipt = purchase.transactionReceipt;
          if (receipt) {
            const validateRes = await this.validate(
              receipt,
              purchase.originalTransactionIdentifierIOS
                ? purchase.originalTransactionIdentifierIOS
                : purchase.transactionId,
            );
            const {receiptValidated, expiryDate} = validateRes;
            if (receiptValidated) {
              console.log(
                'receipt validated',
                validateRes,
                purchase.originalTransactionIdentifierIOS
                  ? purchase.originalTransactionIdentifierIOS
                  : purchase.transactionId,
              );
              this.updateSubscriptionOnDb(
                purchase.originalTransactionIdentifierIOS
                  ? purchase.originalTransactionIdentifierIOS
                  : purchase.transactionId,
                Number(expiryDate),
                purchase.productId,
              );
            }
          }
        } catch (error) {
          console.log('purchase update listener faced an error ', error);
        }
        await RNIap.finishTransaction(purchase, false, false);
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

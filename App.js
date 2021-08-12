/* eslint-disable prettier/prettier */
import React, {Component} from 'react';
import Main from './src';
import {Provider} from 'mobx-react';
import MainStore from './src/store/Store';
import codePush from 'react-native-code-push';
import OneSignal from 'react-native-onesignal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNIap from 'react-native-iap';
import {Alert, Platform} from 'react-native';
import database from '@react-native-firebase/database';
import {
  subscribeInfluencer,
  sendNotificationToUserDevices,
} from './src/services';
import {constants} from './src/resources';
import {environment} from './src/lib';
import Orientation from 'react-native-orientation-locker';
import {ProductPurchase} from 'react-native-iap';
import {SubscriptionPurchase} from 'react-native-iap';
import Store from './src/store/Store';
import {Buffer} from 'buffer';
import * as Sentry from '@sentry/react-native';
import __PACKAGE_JSON__ from './package.json';

class App extends Component {
  constructor(props) {
    super(props);

    this.purchaseUpdatedListener = null;
    this.purchaseErrorListener = null;
  }

  validate = async (
    purchase: ProductPurchase | SubscriptionPurchase,
    receipt,
  ) => {
    const originalTransactionIdentifierIOS = purchase.originalTransactionIdentifierIOS
      ? purchase.originalTransactionIdentifierIOS
      : purchase.transactionId;

    console.log('purchase in validate', {purchase, receipt});

    const receiptBody =
      Platform.OS === 'ios'
        ? {
            'receipt-data': receipt,
            password: '2fc108dab79448b4a61f238ba37e4742',
            originalTransactionId: originalTransactionIdentifierIOS,
          }
        : {
            message: {
              data: new Buffer(
                JSON.stringify({
                  version: '1.0',
                  packageName: 'com.cooldigital.backstage',
                  eventTimeMillis: new Date().getTime(),
                  subscriptionNotification: {
                    version: '1.0',
                    notificationType: 4,
                    purchaseToken: purchase.purchaseToken,
                    subscriptionId: purchase.productId,
                  },
                }),
              ).toString('base64'),
              message_id: '',
              publish_time: new Date().toLocaleString(),
              publishTime: new Date().toLocaleString(),
              messageId: '',
              userUID: Store.uid,
              testing: Store.user?.isInTestMode === true,
            },
            subscription:
              'projects/pc-api-6305812914772691251-434/subscriptions/validateAndroidSubscriptions',
          };

    if (Platform.OS === 'android') {
      console.log(receiptBody);
      try {
        const deliveryReceipt = await fetch(
          'https://us-central1-backstage-ceb27.cloudfunctions.net/validateAndroid',
          {
            headers: {'Content-Type': 'application/json'},
            method: 'POST',
            body: JSON.stringify(receiptBody),
          },
        );
        const validatedAndroidData = await deliveryReceipt.json();
        console.log(
          'Android receipt received from the server is ',
          validatedAndroidData,
        );
        return {
          receiptValidated: true,
          expiryDate: validatedAndroidData.expiryDate,
        };
      } catch (error) {
        console.log('Android caught error ', error);
        return {receiptValidated: false, expiryDate: 0};
      }
    }

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
    let service = Platform.OS === 'android' ? 'google' : 'apple';
    snapshot.forEach((user) => {
      // key is the influencer uid
      // user.val()[key][followerUID] is the user id
      for (const key in user.val()) {
        if (
          user.val()[key]['appStoreOriginalTransactionId'] ===
            originalTransactionId ||
          user.val()[key]['googlePlayOriginalTransactionId'] ===
            originalTransactionId
        ) {
          console.log('found transaction ', originalTransactionId);
          followerUID = user.val()[key].followerUID;
          infUID = user.val()[key].uid;
          isFollowerInDevelopmentMode = user.val()[key].test ?? null;
          service =
            user.val()[key]['googlePlayOriginalTransactionId'] ===
            originalTransactionId
              ? 'google'
              : 'apple';
        }
      }
    });
    console.log({
      service,
      followerUID,
      infUID,
      originalTransactionId,
      env: environment(),
    });
    if (followerUID && infUID) {
      if (isFollowerInDevelopmentMode === null && environment() !== 'Sandbox') {
        isFollowerInDevelopmentMode =
          (await (
            await database()
              .ref('users')
              .child(followerUID)
              .child('isInTestMode')
              .once('value')
          ).val()) === true;
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
        isFollowerInDevelopmentMode === true || environment() === 'Sandbox';
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
    if (transactionExistsInDb) {
      console.log('purchaseUpdatedListener completed');
      return;
    }
    // 2. if it does not, create a new subscription
    console.log('in create sub on db ', originalTransactionId);
    const sub = {
      type: Platform.OS === 'android' ? 'google' : 'apple',
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
    this.initSentry();

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
            const validateRes = await this.validate(purchase, receipt);
            const {receiptValidated, expiryDate} = validateRes;
            if (receiptValidated) {
              console.log(
                'receipt validated',
                validateRes,
                purchase.originalTransactionIdentifierIOS
                  ? purchase.originalTransactionIdentifierIOS
                  : purchase.purchaseToken,
              );
              await this.updateSubscriptionOnDb(
                purchase.originalTransactionIdentifierIOS
                  ? purchase.originalTransactionIdentifierIOS
                  : purchase.purchaseToken,
                Number(expiryDate),
                purchase.productId,
              );
            }
          }
        } catch (error) {
          console.log('purchase update listener faced an error ', error);
        }
        await RNIap.finishTransaction(purchase, false);
      },
    );

    this.purchaseErrorListener = RNIap.purchaseErrorListener(async (error) => {
      console.log(error);
      //this.updateSubscriptionOnDb('1000000833092407', '1624726772000');
      if (Platform.OS === 'ios') {
        if (error['responseCode'] === '2') {
          console.log('Cancelled by user');
        } else {
          Alert.alert(
            'There has been an error with the purchase. Please try again.',
          );
        }
      } else if (error['code'] === 'E_USER_CANCELLED') {
        Alert.alert(error['message']);
      } else {
        Alert.alert(
          'There has been an error with the purchase. Please try again.',
        );
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

    Sentry.close();
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

  initSentry = () => {
    Sentry.init({
      dsn:
        'https://61df52d49bcf407688368a5d708e3429@o954702.ingest.sentry.io/5903895',
    });

    Sentry.setTags({
      environment: __DEV__ ? 'development' : 'production',
      version: __PACKAGE_JSON__.version,
    });
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

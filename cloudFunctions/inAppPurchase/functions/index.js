/* eslint-disable quotes */
const functions = require('firebase-functions');
const axios = require('axios');
const admin = require('firebase-admin');
const {google} = require('googleapis');
const {JWT} = require('google-auth-library');
const iap = require('in-app-purchase');
const account = require('./service-account.json');
admin.initializeApp(functions.config().firebase);

iap.config({
  googleServiceAccount: {
    clientEmail: account.client_email,
    privateKey: account.private_key,
  },
  test: true, // For Apple and Google Play to force Sandbox validation only
  verbose: false, // Output debug logs to stdout stream
});

google.options({
  auth: new JWT(account.client_email, null, account.private_key, [
    'https://www.googleapis.com/auth/androidpublisher',
  ]),
});

const androidGoogleApi = google.androidpublisher({version: 'v3'});

exports.helloWorld2 = functions.https.onRequest(async (request, response) => {
  try {
    const data = JSON.stringify({
      'receipt-data':
        //  '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',
      password: 'afdbdba9a7324686b23d860edb59ca27',
      'exclude-old-transactions': true,
    });
    let result = await axios.post(
      'https://buy.itunes.apple.com/verifyReceipt',
      data,
    );

    let receiptData = null;
    if (result['data']['status'] === 21007) {
      result = await axios.post(
        'https://sandbox.itunes.apple.com/verifyReceipt',
        data,
      );
    }
    // print some stats on what the latest_receipt info looks like
    // number of unique product_id's, original_transaction_id's, transaction_id's
    let productIds = new Set();
    let origTransIds = new Set();
    let transIds = new Set();
    for (let i = 0; i < result['data']['latest_receipt_info'].length; i++) {
      productIds.add(result['data']['latest_receipt_info'][i].product_id);
      origTransIds.add(
        result['data']['latest_receipt_info'][i].original_transaction_id,
      );
      transIds.add(result['data']['latest_receipt_info'][i].transaction_id);
    }
    console.log(productIds);
    console.log(origTransIds);
    console.log(transIds);

    receiptData = result['data']['latest_receipt_info'][0];
    functions.logger.info(receiptData, {structuredData: true});
    return response.status(200).send('assdd');
    return {
      receiptValidated: true,
      expiryDate: receiptData.expires_date_ms,
      originalTransactionId: receiptData.original_transaction_id,
    };
  } catch (error) {
    return {
      error: error,
      expiryDate: 'null',
    };
  }
});

exports.validateIOS = functions.https.onCall(async (d) => {
  try {
    const data = JSON.stringify({
      'receipt-data': d['receipt-data'],
      password: d.password,
      'exclude-old-transactions': true,
    });
    let result = await axios.post(
      'https://buy.itunes.apple.com/verifyReceipt',
      data,
    );

    let receiptData = null;
    if (result['data']['status'] === 21007) {
      result = await axios.post(
        'https://sandbox.itunes.apple.com/verifyReceipt',
        data,
      );
    }
    for (let i = 0; i < result['data']['latest_receipt_info'].length; i++) {
      if (
        result['data']['latest_receipt_info'][i].original_transaction_id ===
        d.originalTransactionId
      ) {
        functions.logger.info(
          'Receipt returning to server is:',
          result['data']['latest_receipt_info'][i],
          {structuredData: true},
        );
        return {
          receiptValidated: true,
          expiryDate: result['data']['latest_receipt_info'][i].expires_date_ms,
        };
      }
    }
    return {
      receiptValidated: false,
    };
  } catch (error) {
    return {
      error: error,
      expiryDate: 'null',
    };
  }
});

exports.validateAndroid = functions.https.onRequest(
  async (request, response) => {
    if (typeof request.body === 'undefined') {
      return response.status(204).end();
    }

    const data =
      typeof request.body === 'string'
        ? JSON.parse(request.body)
        : request.body;

    const bodyToken = data['message']['data'];
    const decodedData = JSON.parse(Buffer.from(bodyToken, 'base64'));

    functions.logger.log({
      body: data,
      decodedData: decodedData,
    });

    if (typeof decodedData['testNotification'] !== 'undefined') {
      return response.status(204).end();
    }

    try {
      await iap.setup();

      const validationResponse = await iap.validate({
        packageName: decodedData['packageName'],
        productId: decodedData['subscriptionNotification']['subscriptionId'],
        purchaseToken: decodedData['subscriptionNotification']['purchaseToken'],
        subscription: true,
      });

      // https://developer.android.com/google/play/billing/rtdn-reference#sub
      const notificationType =
        decodedData['subscriptionNotification']['notificationType'];

      const purchaseData = iap.getPurchaseData(validationResponse);
      const firstPurchaseItem = purchaseData[0];

      const {productId} = firstPurchaseItem;
      const isCancelled = iap.isCanceled(firstPurchaseItem);
      const isExpired = iap.isExpired(firstPurchaseItem);
      const isValidated = iap.isValidated(firstPurchaseItem);
      const originalTransactionId = firstPurchaseItem.transactionId;
      const orderId = firstPurchaseItem.orderId;
      const latestReceipt = purchaseData.transactionReceipt;
      const startDate = new Date(
        parseInt(firstPurchaseItem.startTimeMillis, 10),
      ).getTime();
      const expiryDate = new Date(
        parseInt(firstPurchaseItem.expiryTimeMillis, 10),
      ).getTime();
      const purchaseDate =
        typeof firstPurchaseItem.purchaseDate !== 'undefined'
          ? new Date(firstPurchaseItem.purchaseDate).getTime()
          : startDate;

      if (validationResponse.acknowledgementState === 0) {
        androidGoogleApi.purchases.subscriptions.acknowledge({
          packageName: decodedData['packageName'],
          subscriptionId:
            decodedData['subscriptionNotification']['subscriptionId'],
          token: decodedData['subscriptionNotification']['purchaseToken'],
        });
      }

      let userUID = null;
      let influencerUID = null;
      let influencerUsername = null;
      let isUserInDevelopmentMode = false;

      if (typeof data['message']['userUID'] !== 'undefined') {
        userUID = data['message']['userUID'];
        const influencer = Object.values(
          (
            await admin
              .database()
              .ref('users')
              .orderByChild('appStoreProductId')
              .equalTo(productId)
              .once('value')
          ).val(),
        )[0];
        influencerUID = influencer.uid;
        influencerUsername = influencer.username;
      } else {
        const snapshot = await admin.database().ref('followList').once('value');
        snapshot.forEach((user) => {
          // key is the influencer uid
          // user.val()[key][followerUID] is the user id
          for (let key in user.val()) {
            if (
              user.val()[key]['googlePlayOriginalTransactionId'] ===
              originalTransactionId
            ) {
              influencerUID = user.val()[key]['uid'];
              userUID = user.val()[key]['followerUID'];
              break;
            }
          }
        });
      }

      if (!(userUID !== null && influencerUID !== null)) {
        console.error(
          'Could not find a matching transaction id for  ' +
            originalTransactionId,
        );
        return response.status(204).end();
      }

      if (notificationType === 4) {
        isUserInDevelopmentMode =
          (
            await admin
              .database()
              .ref('users')
              .child(userUID)
              .child('isInTestMode')
              .once('value')
          ).val() === true;
      } else {
        isUserInDevelopmentMode =
          (
            await admin
              .database()
              .ref('followList')
              .child(userUID)
              .child(influencerUID)
              .child('test')
              .once('value')
          ).val() === true;
      }

      await admin
        .database()
        .ref('followList')
        .child(userUID)
        .child(influencerUID)
        .set({
          active:
            notificationType !== 10 &&
            isExpired === false &&
            isCancelled === false,
          cancel: isCancelled === true,
          expired: notificationType === 10 || isExpired === true,
          timestamp: startDate,
          endTimestamp: expiryDate,
          uid: influencerUID,
          followerUID: userUID,
          googlePlayOriginalTransactionId: originalTransactionId,
          test: data['message']['testing'] === true,
        });

      await admin
        .database()
        .ref('follows')
        .child(influencerUID)
        .child(userUID)
        .set(
          notificationType !== 10 &&
            isExpired === false &&
            isCancelled === false,
        );

      if (
        isUserInDevelopmentMode === false &&
        isExpired === false &&
        isCancelled === false &&
        (notificationType === 2 ||
          notificationType === 4 ||
          notificationType === 7)
      ) {
        await admin
          .database()
          .ref('transactions')
          .child(influencerUID)
          .child(orderId.replace(/\./g, '-'))
          .set({
            environment: 'GooglePlay',
            followerUID: userUID,
            originalTransactionId: originalTransactionId,
            orderId: orderId,
            purchaseDate: purchaseDate,
            test: data['message']['testing'] === true,
          });
      }

      if (
        isUserInDevelopmentMode === false &&
        isExpired === false &&
        isCancelled === false &&
        (notificationType === 1 ||
          notificationType === 2 ||
          notificationType === 4 ||
          notificationType === 7)
      ) {
        await admin
          .database()
          .ref('users')
          .child(influencerUID)
          .child('numLifetimeSubscribed')
          .set(admin.database.ServerValue.increment(1));

        if (notificationType !== 4) {
          await axios
            .post(
              'https://us-central1-backstage-ceb27.cloudfunctions.net/api/sendNotificationToUserDevices',
              JSON.stringify({
                type: 'new-subscriber',
                userUIDs: [influencerUID],
                replaceContents: undefined,
                url: `https://www.joinbackstage.co/${influencerUsername}/subscribers/new`,
              }),
              {
                headers: {
                  'Content-Type': 'application/json',
                },
              },
            )
            .then(() => {
              functions.logger.info('notification send.');
            })
            .catch((error) => {
              functions.logger.error('notification cannot send.', {
                error,
                orderId,
                influencerUID,
              });
            });
        }
      }

      const responseBody = {
        notificationType,
        productId,
        isCancelled,
        isExpired,
        isValidated,
        originalTransactionId,
        latestReceipt,
        startDate,
        expiryDate,
        orderId,
      };

      return response.status(200).send(responseBody);
    } catch (error) {
      console.log(error);
      // In case of an error status like 403 is returned,
      // google cloud will repeatedly send requests back.
      return response.status(204).end();
    }
  },
);

exports.getUserAndInfluencerFromOrigTransactionId = functions.https.onRequest(
  async (req, res) => {
    const snapshot = await admin
      .database()
      .ref('transactionsasd')
      .child('OllmubrfMxcsClSbjp8iGb28hHg')
      .child('1000000843790521')
      .once('value');
    console.log(snapshot.exists());
    snapshot.forEach((user) => {
      console.log(user.val());
    });
    return res.status(200).send('assdd');
  },
);

exports.iapStatusUpdate2 = functions.https.onRequest(async (req, res) => {
  //all receipt info will be in req.body
  functions.logger.info('notificaiton type is');
  console.log(req.body.notification_type);
  functions.logger.info(req.body, {structuredData: true});
  console.log('latest receipt is');
  functions.logger.info(
    'notification type is:',
    req.body.notification_type,
    req.body.unified_receipt.latest_receipt_info[0],
    {
      structuredData: true,
    },
  );
  //functions.logger.info(req.body.unified_receipt.latest_receipt_info[1], {
  //  structuredData: true,
  //});

  if (
    req.body.notification_type === 'INITIAL_BUY' ||
    (req.body.notification_type === 'DID_CHANGE_RENEWAL_STATUS' &&
      req.body.auto_renew_status) ||
    req.body.notification_type === 'DID_RENEW'
  ) {
    const originalTransactionIdFromReceipt =
      req.body.unified_receipt.latest_receipt_info[0].original_transaction_id;
    const endTimestamp =
      req.body.unified_receipt.latest_receipt_info[0].expires_date_ms;
    // 1. update time looking at original transaction id at our database
    const snapshot = await admin.database().ref('followList').once('value');
    let userUID = null;
    let influencerUID = null;
    snapshot.forEach((user) => {
      // key is the influencer uid
      // user.val()[key][followerUID] is the user id
      for (key in user.val()) {
        if (
          user.val()[key]['appStoreOriginalTransactionId'] ===
          originalTransactionIdFromReceipt
        ) {
          influencerUID = user.val()[key]['uid'];
          userUID = user.val()[key]['followerUID'];
          break;
        }
      }
    });
    //functions.logger.info('we are updating our db');
    //functions.logger.info(updates, {structuredData: true});

    if (userUID !== null && influencerUID !== null) {
      var updates = {};
      updates[
        `followList/${userUID}/${influencerUID}/endTimestamp`
      ] = endTimestamp;
      updates[
        `followList/${userUID}/${influencerUID}/timestamp`
      ] = new Date().getTime();
      await admin.database().ref().update(updates);
    } else {
      console.error(
        'Could not find a matching transaction id for  ' +
          originalTransactionIdFromReceipt,
      );
    }

    // 2. increment this
    const value = await admin.database().ref('users').once('value');
    value.forEach((element) => {
      if (element.val().appStoreProductId === req.body.auto_renew_product_id) {
        admin
          .database()
          .ref('users')
          .child(element.val().uid)
          .child('numLifetimeSubscribed')
          .set(admin.database.ServerValue.increment(1));
        return res.status(200).end();
      }
    });
  }
  // refund case ini yapmadik
  //else if (req.body.notification_type === 'DID_CHANGE_RENEWAL_STATUS' || req.body.notification_type === 'CANCEL') {
  // latest receipt.cancellation_date_ms
  //}

  return res.status(200).end();
});

exports.iapStatusUpdate = functions.https.onRequest(async (req, res) => {
  //all receipt info will be in req.body
  functions.logger.info('request body is: ', req.body, {structuredData: true});
  functions.logger.info(
    'notification type and latest receipt info is: ',
    req.body.notification_type,
    req.body.environment,
    req.body.unified_receipt.latest_receipt_info[0],
    {
      structuredData: true,
    },
  );
  if (
    req.body.notification_type === 'INITIAL_BUY' ||
    (req.body.notification_type === 'DID_CHANGE_RENEWAL_STATUS' &&
      req.body.auto_renew_status === 'true') ||
    req.body.notification_type === 'DID_RENEW'
  ) {
    const originalTransactionIdFromReceipt =
      req.body.unified_receipt.latest_receipt_info[0].original_transaction_id;
    const endTimestamp =
      req.body.unified_receipt.latest_receipt_info[0].expires_date_ms;
    const transactionIdFromReceipt =
      req.body.unified_receipt.latest_receipt_info[0].transaction_id;
    const environment = req.body.environment;
    // 1. update time looking at original transaction id at our database
    const snapshot = await admin.database().ref('followList').once('value');
    let userUID = null;
    let isUserInDevelopmentMode = false;
    let influencerUID = null;
    snapshot.forEach((user) => {
      // key is the influencer uid
      // user.val()[key][followerUID] is the user id
      for (key in user.val()) {
        if (
          user.val()[key]['appStoreOriginalTransactionId'] ===
          originalTransactionIdFromReceipt
        ) {
          influencerUID = user.val()[key]['uid'];
          userUID = user.val()[key]['followerUID'];
          break;
        }
      }
    });

    if (userUID !== null && influencerUID !== null) {
      isUserInDevelopmentMode =
        (await (
          await admin
            .database()
            .ref('users')
            .child(userUID)
            .child('isInTestMode')
            .once('value')
        ).val()) === true
          ? true
          : false;

      var updates = {};
      updates[`followList/${userUID}/${influencerUID}/test`] =
        isUserInDevelopmentMode === true && environment === 'Sandbox'
          ? true
          : false;
      updates[
        `followList/${userUID}/${influencerUID}/endTimestamp`
      ] = endTimestamp;
      updates[
        `followList/${userUID}/${influencerUID}/timestamp`
      ] = new Date().getTime();
      await admin.database().ref().update(updates);
    } else {
      console.error(
        'Could not find a matching transaction id for  ' +
          originalTransactionIdFromReceipt,
      );
    }

    if (influencerUID === null) {
      const value = await admin.database().ref('users').once('value');
      value.forEach((element) => {
        if (
          element.val().appStoreProductId === req.body.auto_renew_product_id
        ) {
          influencerUID = element.val().uid;
        }
      });
    }

    if (influencerUID === null) {
      functions.logger.error(
        'Could not find a matching influencer uid for product_id=',
        req.body.auto_renew_product_id,
        ' with request=',
        req.body,
        ' and latest receipt= ',
        req.body.unified_receipt.latest_receipt_info[0],
        ' in environment ',
        environment,
        {structuredData: true},
      );
      return;
    }

    if (userUID === null) {
      functions.logger.error(
        'Could not find a matching user uid for product_id=',
        req.body.auto_renew_product_id,
        ' with request=',
        req.body,
        ' and latest receipt= ',
        req.body.unified_receipt.latest_receipt_info[0],
        ' in environment ',
        environment,
        {structuredData: true},
      );
    }

    // 2. check if this is a new transaction
    const transactionSnapshot = await admin
      .database()
      .ref('transactions')
      .child(influencerUID)
      .child(transactionIdFromReceipt)
      .once('value');

    let isNewTransaction = true;
    if (transactionSnapshot.exists()) {
      isNewTransaction = false;
    }

    // 3. update transactions
    const data = {
      originalTransactionId: originalTransactionIdFromReceipt,
      purchaseDate: parseInt(
        req.body.unified_receipt.latest_receipt_info[0].purchase_date_ms,
        10,
      ),
      followerUID: userUID,
      environment: req.body.environment,
      test: isUserInDevelopmentMode,
    };

    var transactionUpdates = {};
    transactionUpdates[
      `transactions/${influencerUID}/${transactionIdFromReceipt}`
    ] = data;
    await admin.database().ref().update(transactionUpdates);

    // 4. increment numLifetimeSubscribed if it is a new transaction
    if (isNewTransaction && isUserInDevelopmentMode !== true) {
      await admin
        .database()
        .ref('users')
        .child(influencerUID)
        .child('numLifetimeSubscribed')
        .set(admin.database.ServerValue.increment(1));
    }
  }
  // refund case ini yapmadik
  //else if (req.body.notification_type === 'DID_CHANGE_RENEWAL_STATUS' || req.body.notification_type === 'CANCEL') {
  // latest receipt.cancellation_date_ms
  //}

  return res.status(200).end();
});

// exports.dummyTest = functions.https.onRequest(async (req, res) => {
//   const snapshot = await admin.database().ref('followList').once('value');
//   let userUID = null;
//   let influencerUID = null;
//   snapshot.forEach((user) => {
//     // key is the influencer uid
//     // user.val()[key][followerUID] is the user id
//     for (key in user.val()) {
//       if (
//         user.val()[key]['appStoreOriginalTransactionId'] === '1000000832278248'
//       ) {
//         influencerUID = user.val()[key]['uid'];
//         userUID = user.val()[key]['followerUID'];
//         break;
//       }
//     }
//   });
//   return res.status(200).send(influencerUID);
// });

/* eslint-disable prettier/prettier */
import database from '@react-native-firebase/database';
import constants from '../resources/constants';
import getFollowList from './getFollowList';
import sendNotificationToUserDevices from './sendNotificationToUserDevices';

export default async function subscribeInfluencer(user, influencer, sub) {
  const data = {
    uid: influencer.uid,
    followerUID: user.uid,
    endTimestamp:
      sub.type === 'apple'
        ? sub.current_period_end
        : sub.current_period_end * 1000,
    timestamp: new Date().getTime(),
    active: true,
    expired: false,
    stripeId: sub.id,
    cancel: false,
    test: user.isInDevelopmentMode === true,
  };

  if (sub.type === 'apple') {
    data.appStoreOriginalTransactionId = sub.originalTransactionId;
  }

  try {
    var updates = {};

    updates[`followList/${user.uid}/${influencer.uid}`] = data;
    updates[`follows/${influencer.uid}/${user.uid}`] = true;

    await database().ref().update(updates);
    await getFollowList(user.uid);
    if (user.isInDevelopmentMode !== true) {
      const influencerUsername = await (
        await database()
          .ref('users')
          .child(influencer.uid)
          .child('username')
          .once('value')
      ).val();
      await sendNotificationToUserDevices(
        'new-subscriber',
        [influencer.uid],
        undefined,
        `${constants.APP_WEBSITE}/${influencerUsername}/subscribers/new`,
      );
    }
    return true;
  } catch (error) {
    console.log('subscribing to inf failed with error: ', error);
    //console.error(error);
    return false;
  }
}

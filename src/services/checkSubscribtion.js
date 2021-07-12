/* eslint-disable prettier/prettier */
import database from '@react-native-firebase/database';
import getFollowList from './getFollowList';
import readSubs from './readSubs';

export default async function checkSubscribtion(uid, influencerUID) {
  const value = await database()
    .ref('followList')
    .child(uid)
    .child(influencerUID)
    .once('value');
  const info = value.val();

  if (uid === influencerUID) {
    return {subscribtion: true, ...info};
  }

  if (!info) {
    return {subscribtion: false, ...info};
  }

  if (info.endTimestamp > new Date().getTime()) {
    return {subscribtion: true, ...info};
  } else {
    return {subscribtion: false, ...info};
  }

  // if (info.expired || !info.active) {
  //     return { subscribtion: false, ...info };
  // }

  // if (new Date().getTime() > info.endTimestamp) {
  //     const status = await readSubs(info.stripeId);

  //     if (!status.cancel_at_period_end && status.current_period_end * 1000 > new Date().getTime()) {
  //         var updates = {};

  //         updates[`followList/${uid}/${influencerUID}/active`] = true;
  //         updates[`followList/${uid}/${influencerUID}/expired`] = false;
  //         updates[`followList/${uid}/${influencerUID}/endTimestamp`] = status.current_period_end * 1000;

  //         await database().ref().update(updates);
  //         await getFollowList(uid);
  //         return { subscribtion: true, ...info };
  //     } else {
  //         var updates = {};

  //         updates[`followList/${uid}/${influencerUID}/active`] = false;
  //         updates[`followList/${uid}/${influencerUID}/expired`] = true;
  //         updates[`follows/${influencerUID}/${uid}`] = null;

  //         await database().ref().update(updates);
  //         await getFollowList(uid);

  //         return { subscribtion: false, ...info };
  //     }
  // }

  // return { subscribtion: true, ...info };
}

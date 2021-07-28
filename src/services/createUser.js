/* eslint-disable prettier/prettier */
import database from '@react-native-firebase/database';
import {Alert} from 'react-native';
import constants from '../resources/constants';
import Store from '../store/Store';

export default async function checkUserInfo(
  uid,
  phone,
  otherInfos,
  followingArray = [],
) {
  const data = {
    uid: uid,
    phone: phone,
    createTimestamp: new Date().getTime(),
    lastActivity: new Date().getTime(),
    verified: false,
    photo:
      'http://newgatehotel.com/wp-content/plugins/all-in-one-seo-pack/images/default-user-image.png',
    notifications: {
      videos: true,
      likes: true,
      roomActivities: true,
    },
  };

  Store.setUser({...data, ...otherInfos});

  var followingList = {};

  for (let i = 0; i < followingArray.length; i++) {
    const element = followingArray[i];
    followingList[element.uid] = {
      active: false,
      timestamp: 0,
      day: 0,
      expired: true,
      followerUID: uid,
      uid: element.uid,
    };
  }

  try {
    if (followingArray.length === 0) {
      followingList = null;
    } else {
      Store.setFollowList(followingList);
      await database().ref('followList').child(uid).update(followingList);
    }

    await database()
      .ref('users')
      .child(uid)
      .set({...data, ...otherInfos});

    if (otherInfos.referedBy) {
      await database()
        .ref('users')
        .child(otherInfos.referedBy)
        .child('numLifetimeRefered')
        .set(database.ServerValue.increment(1));
    }
    return true;
  } catch (error) {
    Alert.alert('Oops', constants.ERROR_ALERT_MSG, [{text: 'Okay'}]);
    return false;
  }
}

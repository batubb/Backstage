/* eslint-disable prettier/prettier */
import database from '@react-native-firebase/database';
import {Alert} from 'react-native';
import constants from '../resources/constants';
import sendNotificationToUserSubscribers from './sendNotificationToUserSubscribers';

// isLive:
// 1: is currently live
// 0: is not currently live but was a live video in the past
// -1: never was a live video
export default async function createVideoData(
  user,
  video,
  type = 'video',
  isLive = -1,
) {
  const data = {
    active: true,
    type,
    timestamp: new Date().getTime(),
    view: 0,
    comment: 0,
    user,
    isLive: isLive,
  };

  var updates = {};

  if (type === 'live') {
    updates[`live/${video.uid}`] = {...data, ...video};
  } else {
    updates[`posts/${user.uid}/${video.uid}`] = {...data, ...video};
  }

  updates[`users/${user.uid}/lastActivity`] = new Date().getTime();
  const video_url = `backstage://video/${user.uid}/${video.uid}`;
  const notification_type = type === 'live' ? 'live' : 'new-post';

  try {
    await database().ref().update(updates);
    await sendNotificationToUserSubscribers(
      notification_type,
      user,
      [{key: '{username}', value: user.username}],
      video_url,
    );
    return true;
  } catch (error) {
    Alert.alert('Oops', constants.ERROR_ALERT_MSG, [{text: 'Okay'}]);
    return false;
  }
}

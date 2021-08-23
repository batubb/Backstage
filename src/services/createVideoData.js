import database from '@react-native-firebase/database';
import {Alert} from 'react-native';
import constants from '../resources/constants';
import sendNotificationToUserSubscribers from './sendNotificationToUserSubscribers';
import * as Sentry from '@sentry/react-native';
import Store from '../store/Store';
import {Severity} from '@sentry/react-native';

/**
 * @param user
 * @param video
 * @param {'video', 'live'} type
 * @param {1, 0, -1} isLive 1 is currently live, 0 s not currently
 * live but was a live video in the past, -1 never was a live video
 * @returns {Promise<boolean>} true if operation is successful
 */
export default async function createVideoData(
  user,
  video,
  type = 'video',
  isLive = -1,
) {
  const data = {
    active: true,
    type: type,
    timestamp: new Date().getTime(),
    view: 0,
    comment: 0,
    user: user,
    isLive: isLive,
  };
  var updates = {};

  if (type === 'live') {
    updates[`live/${video.uid}`] = {...data, ...video};
  } else {
    updates[`posts/${user.uid}/${video.uid}`] = {...data, ...video};
  }

  updates[`users/${user.uid}/lastActivity`] = new Date().getTime();
  const video_url = `${constants.APP_WEBSITE}/${user.username}/${
    type === 'live' ? 'live' : 'posts'
  }/${video.uid}`;
  const notification_type = type === 'live' ? 'live' : 'new-post';

  try {
    await database().ref().update(updates);
    if (video.active !== false) {
      await sendNotificationToUserSubscribers(
        notification_type,
        user,
        [{key: '{username}', value: user.username}],
        video_url,
      );
    }
    return true;
  } catch (error) {
    Sentry.captureEvent({
      user: {
        id: Store.user.uid,
        username: Store.user.username,
        data: Store.user,
      },
      message: 'Create Video Data Error',
      tags: ['video', 'post', 'influencer', 'processing'],
      level: __DEV__ ? Severity.Debug : Severity.Critical,
      exception: error,
      contexts: {
        data,
        updates,
      },
      timestamp: new Date().getTime(),
      environment: __DEV__,
    });
    Alert.alert('Oops', constants.ERROR_ALERT_MSG, [{text: 'Okay'}]);
    return false;
  }
}

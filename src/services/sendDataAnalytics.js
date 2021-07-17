import database from '@react-native-firebase/database';
import {makeid} from '../lib';

/// @required action_name - string
/// @required status - must be one of 'success', 'warning', 'error'
/// data - object - extra data to store
/// key - string - primary key to filter - 'default' when undefined
///              - 'default' must be used when any other error will not occur
export default async function sendDataAnalytics(
  action_name,
  status,
  data = {},
  key = 'default',
) {
  if (typeof action_name !== 'undefined' && typeof status !== 'undefined') {
    const analyticsRef = database()
      .ref('analytics')
      .child(status)
      .child(action_name);

    const currentData = await analyticsRef
      .orderByChild('key')
      .equalTo(key)
      .once('value');

    if (currentData.exists()) {
      await analyticsRef
        .child(Object.keys(currentData.val())[0])
        .child('num')
        .set(database.ServerValue.increment(1));
    } else {
      const uuid = makeid(40, 'uuid');

      await analyticsRef.child(uuid).set({
        ...data,
        status,
        uid: uuid,
        key,
        mobile: true,
        num: database.ServerValue.increment(1),
      });
    }
  }
}

/* eslint-disable prettier/prettier */
import database from '@react-native-firebase/database';
import {makeid} from '../lib';
import sendNotificationToUserDevices from './sendNotificationToUserDevices';

export default async function sendComment(user, video, comment, reply = null) {
  const id = makeid(0, 'uuid');

  try {
    if (reply) {
      await database()
        .ref('comments')
        .child(video.uid)
        .child(reply.uid)
        .child('reply')
        .child(id)
        .set({
          comment: comment,
          timestamp: new Date().getTime(),
          uid: id,
          user: user,
          like: 0,
        });

      const userVal = await database()
        .ref('users')
        .child(reply.user.uid)
        .once('value');
      const userData = userVal.val();

      if (typeof userData.token !== 'undefined') {
        if (typeof userData.notifications.roomActivities !== 'undefined') {
          if (userData.notifications.roomActivities) {
            const video_url = `backstage://video/${video.user.uid}/${video.uid}/reply`;

            await sendNotificationToUserDevices(
              'new-comment',
              [userData.uid],
              [
                {
                  key: '{fromusername}',
                  value: user.username,
                },
                {
                  key: '{comment}',
                  value: comment,
                },
              ],
              video_url,
            );
          }
        }
      }
    } else {
      await database().ref('comments').child(video.uid).child(id).set({
        comment: comment,
        timestamp: new Date().getTime(),
        uid: id,
        user: user,
        like: 0,
      });
    }

    return true;
  } catch (error) {
    return false;
  }
}

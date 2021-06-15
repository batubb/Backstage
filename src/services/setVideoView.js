/* eslint-disable prettier/prettier */
import database from '@react-native-firebase/database';

export default async function setVideoView(uid, video) {
  await database()
    .ref('users')
    .child(video.user.uid)
    .child('cumulativeViewsUser')
    .set(database.ServerValue.increment(1));

  await database()
    .ref('posts')
    .child(video.user.uid)
    .child(video.uid)
    .child('cumulativeViews')
    .set(database.ServerValue.increment(1));

  const viewCount2 = await database()
    .ref('posts')
    .child(video.user.uid)
    .child(video.uid)
    .child('cumulativeViews')
    .once('value');

  return viewCount2.val();
}

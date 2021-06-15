/* eslint-disable prettier/prettier */
import database from '@react-native-firebase/database';

export default async function setVideoView(uid, video) {
  const data = {
    timestamp: new Date().getTime(),
    uid: uid,
    video: video.uid,
    viewed: true,
  };

  await database().ref('views').child(video.uid).child(uid).set(data);

  const videoViewData = await database()
    .ref('views')
    .child(video.uid)
    .once('value');
  const viewCount = Object.keys(videoViewData.val()).length;

  await database()
    .ref('posts')
    .child(video.user.uid)
    .child(video.uid)
    .child('view')
    .set(viewCount);

  await database()
    .ref('posts')
    .child(video.user.uid)
    .child(video.uid)
    .child('cumulativeViews')
    .set(database.ServerValue.increment(1));

  await database()
    .ref('users')
    .child(video.user.uid)
    .child('cumulativeViewsUser')
    .set(database.ServerValue.increment(1));

  const viewCount2 = await database()
    .ref('posts')
    .child(video.user.uid)
    .child(video.uid)
    .child('cumulativeViews')
    .once('value');

  return viewCount2.val();
}

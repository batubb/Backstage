import database from '@react-native-firebase/database';

export default function likeVideo(user, video, isRemove = false) {
  return new Promise(async (resolve, reject) => {
    const likeData = await database()
      .ref('posts')
      .child(video.user.uid)
      .child(video.uid)
      .child('likes')
      .child(user.uid);

    if (!isRemove) {
      await likeData
        .set({
          timestamp: new Date().getTime(),
          uid: user.uid,
        })
        .then(() => resolve(true))
        .catch(() => reject(false));
    } else {
      await likeData
        .remove()
        .then(() => resolve(true))
        .catch(() => reject(false));
    }
  });
}

import database from '@react-native-firebase/database';
import Store from '../store/Store';

export default async function getUserStories(uid = Store.uid) {
  const userStories = await database().ref('stories').child(uid).once('value');
  const user = await (
    await database().ref('users').child(uid).once('value')
  ).val();
  const list = [];

  userStories.forEach((story) => {
    const {active, timestamp} = story.val();

    if (
      active === true &&
      new Date().getTime() - timestamp < 24 * 60 * 60 * 1000
    ) {
      list.push({
        ...story.val(),
        user,
      });
    }
  });

  list.sort(function (a, b) {
    return a.timestamp - b.timestamp;
  });

  if (uid === Store.uid) {
    Store.setUser(user);
    Store.setDevices(user.devices);
  }

  return list;
}

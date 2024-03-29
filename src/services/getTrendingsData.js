/* eslint-disable prettier/prettier */
import database from '@react-native-firebase/database';
import Store from '../store/Store';

export default async function getTrendingsData(uid = Store.uid) {
  const value = await database()
    .ref('users')
    .orderByChild('type')
    .equalTo('influencer')
    .once('value');

  var trendingsArray = [];
  value.forEach((element) => {
    if (uid !== element.val().uid) {
      trendingsArray.push(element.val());
    }
  });

  return trendingsArray;
}

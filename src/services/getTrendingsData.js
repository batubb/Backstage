/* eslint-disable prettier/prettier */
import database from '@react-native-firebase/database';
import isInfluencer from '../lib/isInfluencer';
import isAdmin from '../lib/isAdmin';
import Store from '../store/Store';

export default async function getTrendingsData(
  uid = Store.uid,
  includeAdmins = true,
) {
  const value = await database().ref('users').once('value');

  var trendingsArray = [];
  value.forEach((element) => {
    if (
      (uid !== element.val().uid && isInfluencer(element.val())) ||
      (includeAdmins === true && isAdmin(element.val()))
    ) {
      trendingsArray.push(element.val());
    }
  });

  return trendingsArray;
}

/* eslint-disable prettier/prettier */
import database from '@react-native-firebase/database';
import isInfluencer from '../lib/isInfluencer';
import Store from '../store/Store';

// NOTE Parameters
// level: 'all' | 'influencer', default: 'all'
//

export default async function searchUser(
  search,
  level = 'all',
  uid = Store.uid,
) {
  const value = await database()
    .ref('users')
    .orderByChild('name')
    .startAt(search)
    .endAt(search + '\uf8ff')
    .once('value');
  var searchArray = [];
  var userType = 'Follower';

  value.forEach((element) => {
    const {type} = element.val();
    if (type === 'user') {
      userType = 'Follower';
    } else if (type === 'influencer') {
      userType = 'Influencer';
    }

    if (uid !== element.val().uid) {
      if (level === 'all') {
        searchArray.push({...element.val(), userType});
      } else if (level === 'influencer' && isInfluencer(element.val())) {
        searchArray.push({...element.val(), userType});
      }
    }
  });

  searchArray.slice(0, 9);

  return searchArray;
}

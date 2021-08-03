/* eslint-disable prettier/prettier */
import database from '@react-native-firebase/database';
import isInfluencer from '../lib/isInfluencer';
import isAdmin from '../lib/isAdmin';
import Store from '../store/Store';

// NOTE Parameters
// level: 'all' | 'influencer', default: 'all'
//

export default async function searchUser(
  search,
  level = 'all',
  uid = Store.uid,
  includeAdmins = true,
) {
  const value = await database()
    .ref('users')
    .orderByChild('username')
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
    } else if (type === 'admin') {
      userType = 'Admin';
    }

    const admin = !!(includeAdmins === true && isAdmin(element.val()));

    if (uid !== element.val().uid || admin === true) {
      if (level === 'all' || admin === true) {
        searchArray.push({...element.val(), userType});
      } else if (level === 'influencer' && isInfluencer(element.val())) {
        searchArray.push({...element.val(), userType});
      }
    }
  });

  searchArray.slice(0, 9);

  return searchArray;
}

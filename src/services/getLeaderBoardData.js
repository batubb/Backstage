/* eslint-disable prettier/prettier */
import database from '@react-native-firebase/database';
import {constants} from '../resources';
import Store from '../store/Store';

export default async function getLeaderBoardData(
  curUid = Store.uid,
  limit = constants.DEALS_LIMIT,
) {
  const value = await database()
    .ref('users')
    .orderByChild('cumulativeViewsUser')
    .once('value');

  var userType = 'Follower';
  var leaderBoardArray = [];

  value.forEach((element) => {
    const {type, uid} = element.val();

    if (curUid === uid) {
      return;
    }

    if (type === 'user') {
      userType = 'Follower';
    } else if (type === 'influencer') {
      userType = 'Influencer';
    }

    leaderBoardArray.push({...element.val(), userType: userType});
  });

  leaderBoardArray = leaderBoardArray.filter(
    (user) => user.type === 'influencer',
  );
  leaderBoardArray.reverse();

  leaderBoardArray.slice(0, 20);

  var newleaderBoardArray = [];

  for (let i = 0; i < leaderBoardArray.length; i++) {
    const element = leaderBoardArray[i];
    newleaderBoardArray.push({...element, index: i + 1});
  }

  return newleaderBoardArray;
}

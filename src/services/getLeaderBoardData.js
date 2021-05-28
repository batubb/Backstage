/* eslint-disable prettier/prettier */
import database from '@react-native-firebase/database';
import { constants } from '../resources';

export default async function getLeaderBoardData(uid = '', limit = constants.DEALS_LIMIT) {
    const value = await database().ref('users').orderByChild('follower').once('value');

    var x = 1;
    var userType = 'Follower';
    var leaderBoardArray = [];

    value.forEach(element => {
        const { type } = element.val();

        if (type === 'user') {
            userType = 'Follower';
        } else if (type === 'influencer') {
            userType = 'Influencer';
        }

        leaderBoardArray.push({ ...element.val(), userType: userType });
        x++;
    });

    leaderBoardArray.reverse();
    
    leaderBoardArray.slice(0, 20);

    var newleaderBoardArray = [];

    for (let i = 0; i < leaderBoardArray.length; i++) {
        const element = leaderBoardArray[i];
        newleaderBoardArray.push({ ...element, index: i + 1 });
    }

    const result = newleaderBoardArray.filter(user => user.type === 'influencer');

    return result;
}

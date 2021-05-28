/* eslint-disable prettier/prettier */
import database from '@react-native-firebase/database';
import { constants } from '../resources';

export default async function getDealsData(uid = '', limit = constants.DEALS_LIMIT) {
    const value = await database().ref('users').orderByChild('type').equalTo('influencer').once('value');

    var dealsArray = [];
    value.forEach(element => {
        if (uid !== element.val().uid) {
            dealsArray.push(element.val());
        }
    });

    dealsArray.sort(function(a, b){return b.follower - a.follower});

    return dealsArray;
}

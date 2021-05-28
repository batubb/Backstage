/* eslint-disable prettier/prettier */
import database from '@react-native-firebase/database';

export default async function getTrendingsData(uid = '') {
    const value = await database().ref('users').orderByChild('type').equalTo('influencer').once('value');

    var trendingsArray = [];
    value.forEach(element => {
        if (uid !== element.val().uid) {
            trendingsArray.push(element.val());
        }
    });

    return trendingsArray;
}

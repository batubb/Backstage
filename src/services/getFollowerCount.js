/* eslint-disable prettier/prettier */
import database from '@react-native-firebase/database';

export default async function getFollowerCount(uid) {
    const value = await database().ref('follows').child(uid).once('value');
    var counter = 0;

    value.forEach(element => {
        if (element.val()) {
            counter++;
        }
    });

    database().ref('users').child(uid).child('follower').set(counter);

    return counter;
}

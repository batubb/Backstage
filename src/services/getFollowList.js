/* eslint-disable prettier/prettier */
import database from '@react-native-firebase/database';
import Store from '../store/Store';

export default async function getFollowList(uid) {
    const value = await database().ref('followList').child(uid).once('value');
    var list = [];
    var updates = {};

    value.forEach(element => {
        const { active, expired } = element.val();

        if (active || expired) {
            list.push(element.val());
        }

        if (expired) {
            updates[`follows/${element.val().uid}/${uid}`] = null;
        }
    });

    try {
        if (Object.keys(updates).length > 0) {
            database().ref().update(updates);
        }
    } catch (error) {
        console.log(error);
    }

    Store.setFollowList(list);

    return list;
}

/* eslint-disable prettier/prettier */
import database from '@react-native-firebase/database';
import Store from '../store/Store';

export default async function getFollowList(uid) {
    const value = await database().ref('followList').child(uid).once('value');
    var list = [];

    value.forEach(element => {
        const { active, expired } = element.val();

        if (active || expired) {
            list.push(element.val());
        }
    });

    Store.setFollowList(list);

    return list;
}

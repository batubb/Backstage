/* eslint-disable prettier/prettier */
import database from '@react-native-firebase/database';
import Store from '../store/Store';

export default async function checkUserInfo(uid, setStore = false) {
    const value = await database().ref('users').child(uid).once('value');
    const info = value.val();

    if (!info) {
        return false;
    }

    if (setStore) {
        Store.setUser(info);
    }

    return info;
}

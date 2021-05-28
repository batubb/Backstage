/* eslint-disable prettier/prettier */
import database from '@react-native-firebase/database';

export default async function checkUsernameValid(username) {
    const value = await database().ref('users').orderByChild('username').equalTo(username).once('value');
    const info = value.val();

    if (!info) {
        return false;
    }

    return info;
}

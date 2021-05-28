/* eslint-disable prettier/prettier */
import database from '@react-native-firebase/database';
import { Alert } from 'react-native';

export default async function createStoryData(user, video, type = 'video', title = '') {
    const data = {
        active: true,
        type,
        timestamp: new Date().getTime(),
        user,
        title,
    };

    var updates = {};

    updates[`stories/${user.uid}/${video.uid}`] = { ...data, ...video };
    updates[`users/${user.uid}/lastActivity`] = new Date().getTime();

    try {
        await database().ref().update(updates);
        return true;
    } catch (error) {
        Alert.alert('Oops', 'Something went wrong. We are sorry for this', [{ text: 'Okay' }]);
        return false;
    }
}

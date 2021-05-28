/* eslint-disable prettier/prettier */
import database from '@react-native-firebase/database';
import { Alert } from 'react-native';

export default async function createVideoData(user, video, type = 'video') {
    const data = {
        active: true,
        type,
        timestamp: new Date().getTime(),
        view: 0,
        comment: 0,
        user,
    };

    var updates = {};

    if (type === 'live') {
        updates[`live/${video.uid}`] = { ...data, ...video };
    } else {
        updates[`posts/${user.uid}/${video.uid}`] = { ...data, ...video };
    }

    updates[`users/${user.uid}/lastActivity`] = new Date().getTime();

    try {
        await database().ref().update(updates);
        return true;
    } catch (error) {
        Alert.alert('Oops', 'Something went wrong. We are sorry for this', [{ text: 'Okay' }]);
        return false;
    }
}

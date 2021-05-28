/* eslint-disable prettier/prettier */
import database from '@react-native-firebase/database';

export default async function getVideoInfo(uid, user, type = 'video') {
    if (type === 'video') {
        const postsValue = await database().ref('posts').child(user.uid).child(uid).once('value');

        return postsValue.val();
    } else if (type === 'live') {
        const postsValue = await database().ref('live').child(uid).once('value');

        return postsValue.val();
    }

}


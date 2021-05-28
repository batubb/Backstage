/* eslint-disable prettier/prettier */
import database from '@react-native-firebase/database';
import { makeid } from '../lib';

export default async function sendComment(user, video, comment, reply = null) {
    const id = makeid(0, 'uuid');

    if (reply) {
        await database().ref('comments').child(video.uid).child(reply.uid).child('reply').child(id).set({
            comment: comment,
            timestamp: new Date().getTime(),
            uid: id,
            user: user,
            like: 0,
        });
    } else {
        await database().ref('comments').child(video.uid).child(id).set({
            comment: comment,
            timestamp: new Date().getTime(),
            uid: id,
            user: user,
            like: 0,
        });
    }


    return true;
}


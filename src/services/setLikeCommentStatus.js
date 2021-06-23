/* eslint-disable prettier/prettier */
import database from '@react-native-firebase/database';

export default async function setLikeCommentStatus(user, video, comment, status = false, reply = false, mainComment) {
    try {
        if (reply) {
            await database().ref('comments').child(video.uid).child(mainComment.uid).child('reply').child(comment.uid).child('likes').child(user.uid).set(!status);
        } else {
            await database().ref('comments').child(video.uid).child(comment.uid).child('likes').child(user.uid).set(!status);
        }

        const userVal = await database().ref('users').child(video.uid).once('value');
        const userData = userVal.val();

        if (typeof userData.token !== 'undefined' && !status) {
            if (typeof userData.notifications.likes !== 'undefined') {
                if (userData.notifications.likes) {
                    database().ref('pushList').child(video.uid).set({
                        token: video.token,
                        message: `Your comment "${comment.comment}" is liked by ${user.name}`,
                        title: 'You have a new like',
                    });
                }
            }
        }

        return true;
    } catch (error) {
        return false;
    }
}


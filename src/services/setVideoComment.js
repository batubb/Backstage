/* eslint-disable prettier/prettier */
import database from '@react-native-firebase/database';

export default async function setVideoComment(uid, video) {
    const videoCommentData = await database().ref('comments').child(video.uid).once('value');

    var commentCount = 0;
    var comments = [];

    videoCommentData.forEach(element => {
        const { reply, likes } = element.val();
        var replyArray = [];
        var likeStatus = false;
        var likeCount = 0;
        var keys = [];

        commentCount++;

        if (typeof reply !== 'undefined') {
            const replyKeys = Object.keys(reply);

            for (let i = 0; i < replyKeys.length; i++) {
                const k = replyKeys[i];

                if (typeof reply[k].likes !== 'undefined') {
                    keys = Object.keys(reply[k].likes);

                    for (let j = 0; j < keys.length; j++) {
                        const m = keys[j];

                        if (reply[k].likes[m]) {
                            likeCount++;
                        }
                    }

                    if (typeof reply[k].likes[uid] !== 'undefined') {
                        likeStatus = reply[k].likes[uid];
                    }
                }

                replyArray.push({ ...reply[k], likeStatus, likeCount });
                commentCount++;
            }

            replyArray.sort(function (a, b) { return b.timestamp - a.timestamp; });
        }

        likeStatus = false;
        likeCount = 0;

        if (typeof likes !== 'undefined') {
            keys = Object.keys(likes);
            for (let j = 0; j < keys.length; j++) {
                const m = keys[j];

                if (likes[m]) {
                    likeCount++;
                }
            }

            if (typeof likes[uid] !== 'undefined') {
                likeStatus = likes[uid];
            }
        }

        comments.push({ ...element.val(), reply: replyArray, showReply: false, likeStatus, likeCount });
    });

    comments.sort(function (a, b) { return b.timestamp - a.timestamp; });

    await database().ref('posts').child(video.user.uid).child(video.uid).child('comments').set(commentCount);

    return comments;
}


/* eslint-disable prettier/prettier */
import database from '@react-native-firebase/database';
import Store from '../store/Store';

export default async function getUserPosts(uid, store = false) {
    const postsValue = await database().ref('posts').child(uid).once('value');
    const postsArray = [];

    postsValue.forEach(post => {
        if (post.val()) {
            postsArray.push(post.val());
            postsArray.sort(function (a, b) { return b.timestamp - a.timestamp; });
        }
    });

    if (store) {
        Store.setPosts(postsArray);
    }

    return postsArray;
}


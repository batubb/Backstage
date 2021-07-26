import database from '@react-native-firebase/database';
import Store from '../store/Store';
import getUserSubscribers from './getUserSubscribers';

export default async function getSubscriberCount(uid = Store.user.uid) {
    const value = await getUserSubscribers(uid);

    database().ref('users').child(uid).child('numSubscribers').set(value.length);

    Store.setUser({...Store.user, numSubscribers: value.length});

    return value.length;
}

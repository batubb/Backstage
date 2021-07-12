import database from '@react-native-firebase/database';

export default async function getSubscriberCount(uid) {
    const value = await database().ref('followList').child(uid).once('value');
    var counter = 0;

    value.forEach(element => {
        if (element.val() && element.val()?.expired === false && element.val()?.active === true) {
            counter++;
        }
    });

    database().ref('users').child(uid).child('numSubscribers').set(counter);

    return counter;
}

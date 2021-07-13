import database from '@react-native-firebase/database';
import sendNotificationToUserDevices from './sendNotificationToUserDevices';
import Store from '../store/Store';

/// @required type from notificationTemplates data.
/// 
/// @optional replaceContents
/// Show messages dynamically by replacing messages. It can contain more than one.
/// The content and messages both will be replaced.
/// [{
///     key: '{username}'
///     value: 'johndoe',
/// }]
export default async function sendNotificationToUserSubscribers(type, user = Store.user.uid, replaceContents = undefined) {
    const subscribersData = await database().ref('followList').child(user.uid).once('value');
    var allSubscribers = Object.values(Object.assign({}, subscribersData.val()));
    const activeSubscriberUserUIDs = [];

    for (let i = 0; i < allSubscribers.length; i++) {
        const item = allSubscribers[i];

        if (item.active === true && item.expired === false) {
            activeSubscriberUserUIDs.push(item.uid);
        }
    }

    if (activeSubscriberUserUIDs.length > 0) {
        await sendNotificationToUserDevices(type, [Store.user.uid], replaceContents);
    }

    return true;
}
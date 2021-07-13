import axios from 'axios';

/// @required type from notificationTemplates data.
///
/// @required userUIDs should contain just users' uids in a list.
/// 
/// @optional replaceContents
/// Show messages dynamically by replacing messages. It can contain more than one.
/// The content and messages both will be replaced.
/// [{
///     key: '{username}'
///     value: 'johndoe',
/// }]
export default async function sendNotificationToUserDevices(type, userUIDs = [], replaceContents = undefined) {
    var data = JSON.stringify({ type, userUIDs, replaceContents });

    var config = {
        method: 'post',
        url: 'https://us-central1-backstage-ceb27.cloudfunctions.net/api/sendNotificationToUserDevices',
        headers: {
            'Content-Type': 'application/json',
        },
        data: data,
    };

    try {
        const result = await axios(config);
        return result.data;
    } catch (error) {
        console.log(error);
        return false;
    }
}
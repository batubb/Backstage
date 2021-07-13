import axios from 'axios';
import database from '@react-native-firebase/database';

/// TYPES
/// "new-subscriber", "approved-creator", "withdraw-approved", "new-post"
///
/// userUIDs should contain just users' uids in a list.
export default async function sendNotificationToUserDevices(type, userUIDs = []) {
    var data = JSON.stringify({ type, userUIDs });

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
import Store from '../store/Store';
import axios from 'axios';

export default async function getUserSubscribers(uid = Store.user.uid) {
    var data = JSON.stringify({ uid });

    var config = {
        method: 'post',
        url: 'https://us-central1-backstage-ceb27.cloudfunctions.net/api/getUserSubscribers',
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
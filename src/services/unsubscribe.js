/* eslint-disable prettier/prettier */
import axios from 'axios';

export default async function unsubscribe(subId) {
    var data = JSON.stringify({ subId });

    var config = {
        method: 'post',
        url: 'https://us-central1-backstage-ceb27.cloudfunctions.net/api/cancelSubsription',
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

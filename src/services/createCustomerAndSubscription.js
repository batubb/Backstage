/* eslint-disable prettier/prettier */
import axios from 'axios';

export default async function createCustomerAndSubscription(user, influencer, token, planId) {
    var data = JSON.stringify({ user, token: token.id, planId, influencer });

    var config = {
        method: 'post',
        url: 'https://us-central1-backstage-ceb27.cloudfunctions.net/api/createCustomerAndSubscription',
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

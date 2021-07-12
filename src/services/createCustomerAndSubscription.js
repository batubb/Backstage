/* eslint-disable prettier/prettier */
import axios from 'axios';
import { constants } from '../resources';

export default async function createCustomerAndSubscription(user, influencer, token, price) {
    const tier = constants.TIERS.find(tierObj => tierObj.price === price);
    var data = JSON.stringify({ user, token: token.id, planId: tier.stripe, influencer });

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

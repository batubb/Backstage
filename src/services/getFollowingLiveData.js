/* eslint-disable prettier/prettier */
import axios from 'axios';

export default async function getFollowingLiveData(uid, followList) {
    var data = JSON.stringify({ followList });

    var config = {
        method: 'post',
        url: 'https://us-central1-backstage-ceb27.cloudfunctions.net/api/getFollowingLiveData',
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

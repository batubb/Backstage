/* eslint-disable prettier/prettier */
import database from '@react-native-firebase/database';
import getFollowList from './getFollowList';

export default async function subscribeInfluencer(user, influencer, sub) {
    const data = {
        uid: influencer.uid,
        followerUID: user.uid,
        endTimestamp: sub.current_period_end * 1000,
        timestamp: new Date().getTime(),
        active: true,
        expired: false,
        stripeId: sub.id,
        cancel: false,
    };

    try {
        var updates = {};

        updates[`followList/${user.uid}/${influencer.uid}`] = data;
        updates[`follows/${influencer.uid}/${user.uid}`] = true;

        await database().ref().update(updates);
        await getFollowList(user.uid);
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}

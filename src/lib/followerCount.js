/* eslint-disable prettier/prettier */

export default function followerCount(count = 0) {
    var follower = count;

    if (follower >= 1000000) {
        follower = follower / 1000000;
        return `${follower.toFixed(1)}m`;
    }

    if (follower >= 1000) {
        follower = follower / 1000;
        return `${follower.toFixed(1)}k`;
    }

    return follower.toString();
}

/* eslint-disable prettier/prettier */
export default function setPosts(posts) {
    var dailyVideos = [];
    var otherVideos = {};
    var post = {};
    var otherVideosArray = [];

    for (let i = 0; i < posts.length; i++) {
        const element = posts[i];
        var post = {};

        if (element.active) {
            dailyVideos.push(element);
        }

        if (element.groups) {
            post[element.uid] = element;
            const keys = Object.keys(element.groups);
            for (var z = 0; z < keys.length; z++) {
                const k = keys[z];
                otherVideos[element.groups[k].uid] = { ...otherVideos[element.groups[k].uid], ...post };
            }
        }
    }

    const keys = Object.keys(otherVideos);
    for (let i = 0; i < keys.length; i++) {
        const k = keys[i];
        const elementKeys = Object.keys(otherVideos[k]);
        var elementArray = [];

        for (let j = 0; j < elementKeys.length; j++) {
            const x = elementKeys[j];
            elementArray.push({ ...otherVideos[k][x], group: otherVideos[k][x].groups[k].uid, groupName: otherVideos[k][x].groups[k].name });
        }

        elementArray.sort(function (a, b) { return b.timestamp - a.timestamp; });
        otherVideosArray.push(elementArray);
    }

    dailyVideos.sort(function (a, b) { return b.timestamp - a.timestamp; });
    otherVideosArray.sort(function (a, b) { return b[0].timestamp - a[0].timestamp; });
    return { postsArray: otherVideosArray, daily: dailyVideos };
}

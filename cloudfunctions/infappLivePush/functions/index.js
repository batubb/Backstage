const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

exports.livePushToAll = functions.database.ref('/live/{userId}').onWrite((snap, context) => {
    const liveData = snap.after.val();

    if (typeof liveData.user === 'undefined') {
        return 0;
    } else {
        run();
    }

    async function run() {
        const followerDatas = await admin.database().ref('follows').child(liveData.user.uid).once('value');
        const uids = Object.keys(followerDatas.val());

        for (let i = 0; i < uids.length; i++) {
            try {
                const k = uids[i];
                const follower = await admin.database().ref('users').child(k).once('value');

                await admin.database().ref('pushList').child(k).set({
                    token: follower.val().token,
                    title: `${liveData.user.username} is live`,
                    message: `Hey ${liveData.user.name} is streaming now. We thought you'd like to watch.`
                });
            } catch (e) {
                if (e instanceof OneSignal.HTTPError) {
                    console.log(e.statusCode);
                    console.log(e.body);
                }
            }
        }
    }
})
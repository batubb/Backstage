const functions = require('firebase-functions');
const OneSignal = require('onesignal-node');
const admin = require('firebase-admin');

admin.initializeApp();

exports.pushh = functions.database.ref('/pushList/{userId}').onWrite((snap, context) => {
    const client = new OneSignal.Client('9a94991e-d65d-4782-b126-e6c7e3e500c2', 'OGEyMGZjOTEtYTZiZi00MDczLTlkMzktYjNmNmVkMjEzZWE3');

    const userPush = snap.after.val();
    let updates = {};
    updates['/pushList/{userId}'] = null;

    if (typeof userPush.message === 'undefined' || typeof userPush.title === 'undefined' || typeof userPush.token === 'undefined') {
        return snap.after.ref.set(null);
    }

    const notification = {
        contents: {
            'en': userPush.message,
        },
        headings: {
            'en': userPush.title
        },
        include_player_ids: [userPush.token],
    };

    run();

    async function run() {
        try {
            const response = await client.createNotification(notification);
            console.log(response.body.id);
            return snap.after.ref.set(null);
        } catch (e) {
            if (e instanceof OneSignal.HTTPError) {
                console.log(e.statusCode);
                console.log(e.body);
            }
        }
    }
})
/* eslint-disable prettier/prettier */
import database from '@react-native-firebase/database';

export default async function setHighlights(user, highlights, group, remove = false) {
    const updates = {};

    for (let i = 0; i < highlights.length; i++) {
        const element = highlights[i];

        if (element.active && !remove) {
            updates[`${element.uid}/groups/${group.uid}/uid`] = group.uid;
            updates[`${element.uid}/groups/${group.uid}/name`] = group.name === '' ? 'Highlight' : group.name;
        } else {
            updates[`${element.uid}/groups/${group.uid}`] = null;
        }
    }

    await database().ref('posts').child(user.uid).update(updates);

    return true;
}

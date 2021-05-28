/* eslint-disable prettier/prettier */
import database from '@react-native-firebase/database';
import { Alert } from 'react-native';
import Store from '../store/Store';
import { makeid } from '../lib';

export default async function report(item, type = 'video') {
    const uid = makeid(40, 'uuid');

    if (type === 'video') {
        const data = {
            report: item,
            user: Store.user,
            createTimestamp: new Date().getTime(),
            uid,
            type,
        };

        try {
            await database().ref('reports').child(type).child(uid).update(data);
            return true;
        } catch (error) {
            Alert.alert('Oops', 'Something went wrong. We are sorry for this', [{ text: 'Okay' }]);
        }
    } else if (type === 'account') {
        const data = {
            report: item,
            user: Store.user,
            createTimestamp: new Date().getTime(),
            uid,
            type,
        };

        try {
            await database().ref('reports').child(type).child(uid).update(data);
            return true;
        } catch (error) {
            Alert.alert('Oops', 'Something went wrong. We are sorry for this', [{ text: 'Okay' }]);
        }
    }

    return false;
}

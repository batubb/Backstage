/* eslint-disable prettier/prettier */
import database from '@react-native-firebase/database';
import {Alert} from 'react-native';
import Store from '../store/Store';
import {makeid} from '../lib';
import constants from '../resources/constants';

export default async function withdraw(amount, callback = undefined) {
  const uid = makeid(40, 'uuid');

  try {
    const data = {
      createTimestamp: new Date().getTime(),
      user: Store.user,
      uid,
      amount: parseFloat(amount),
      status: 0, // 0 = Pending, 1 = Completed, 2 = Error
    };
    
    await database().ref('withdraws').child(uid).set(data);
    callback && callback();
    return true;
  } catch (error) {
    Alert.alert('Oops', constants.ERROR_ALERT_MSG, [{text: 'Okay'}]);
  } 

  return false;
}

import {Alert} from 'react-native';
import {StackActions} from '@react-navigation/routers';
import isInfluencer from './isInfluencer';
import Store from '../store/Store';

export default function checkAndShowInfluencerModal(navigation, user = Store.user) {
  if (!isInfluencer(user)) {
    Alert.alert('Oops', 'You are not enrolled as a creator yet.', [
      {
        text: 'Enroll as a creator',
        onPress: () => navigation.dispatch(StackActions.push('AddContent')),
      },
      {
        text: 'Cancel',
        style: 'cancel',
        onPress: () => navigation.dispatch(StackActions.pop()),
      },
    ]);
    return true;
  }
  return false;
}

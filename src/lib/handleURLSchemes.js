import {Alert} from 'react-native';
import database from '@react-native-firebase/database';
import {StackActions} from '@react-navigation/routers';
import {constants} from '../resources';

/// Supported Links:
/// backstage://profile/USERNAME
/// backstage://my-profile
/// backstage://videos/USER_ID/VIDEO_ID
/// backstage://withdraw
/// backstage://new-subscriber
export default function handleURLSchemes(event, {navigation}) {
  return new Promise(async (resolve, reject) => {
    const URL = event.url;
    const route = URL.replace(/.*?:\/\//g, '');
    const matches = route.split('/');

    switch (matches?.[0]) {
      case 'profile':
        navigation.navigate('SearchMenu', { screen: 'Search' });
        if (typeof matches?.[1] !== undefined) {
          await database()
            .ref('users')
            .orderByChild('username')
            .equalTo(matches[1])
            .once('value', (snap) => {
              const user = snap.val();

              if (user) {
                navigation.dispatch(
                  StackActions.push('UserProfile', {
                    user: Object.values(user)[0],
                  }),
                );
                resolve();
              } else {
                Alert.alert(
                  'Oops',
                  'The user ' + matches?.[2] + ' does not exist.',
                );
                reject();
              }
            })
            .catch(() => reject());
        } else {
          reject();
        }
        break;

      case 'my-profile':
        navigation.navigate('ProfileMenu', { screen: 'Profile' });
        break;

      case 'video':
        navigation.navigate('SearchMenu', { screen: 'Search' });
        if (
          typeof matches?.[1] !== 'undefined' &&
          typeof matches?.[2] !== 'undefined'
        ) {
          await database()
            .ref('posts')
            .child(matches?.[1])
            .child(matches?.[2])
            .once('value', (snap) => {
              const video = snap.val();

              if (video && video?.active === true) {
                navigation.dispatch(StackActions.push('WatchVideo', {video}));

                if (matches?.[3] === 'reply') {
                  navigation.dispatch(StackActions.push('Comments', {video}));
                }

                resolve();
              } else {
                Alert.alert('Oops', 'The video does not exist.');
                reject();
              }
            })
            .catch(() => reject());
        } else {
          reject();
        }
        break;
  
      case 'withdraw':
        navigation.navigate('ProfileMenu', { screen: 'Profile' });
        setTimeout(() => navigation.dispatch(StackActions.push('WithdrawalHistory')), 1000);
        resolve();
        break;

      case 'new-subscriber':
        navigation.navigate('ProfileMenu', { screen: 'Profile' });
        setTimeout(() => navigation.dispatch(StackActions.push('Subscribers')), 1000);
        resolve();
        break;

      default:
        Alert.alert('Oops', constants.ERROR_ALERT_MSG);
        break;
    }
  });
}

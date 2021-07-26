import {Alert} from 'react-native';
import database from '@react-native-firebase/database';
import {StackActions} from '@react-navigation/routers';
import {constants} from '../resources';

/// Supported Links:
/// backstage://profile/USERNAME
/// backstage://my-profile
/// backstage://new-post/USER_ID/VIDEO_ID
/// backstage://live/USER_ID/VIDEO_ID
/// backstage://withdraw
/// backstage://new-subscriber
export default function handleURLSchemes(event, {navigation}) {
  return new Promise(async (resolve, reject) => {
    const URL = event.url;
    const route = URL.replace(/.*?:\/\//g, '');
    let matches = route.split('/');

    if (matches.length === 0) return;

    if (matches[0].replace('www.', '') === 'joinbackstage.co') {
      matches = `profile/${matches.slice(1, matches.length).join('/')}`.split('/');
    }

    switch (matches[0]) {
      case 'profile':
        navigation.navigate('SearchMenu', {screen: 'Search'});
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
        navigation.navigate('ProfileMenu', {screen: 'Profile'});
        break;

      case 'new-post':
        navigation.navigate('SearchMenu', {screen: 'Search'});
        if (
          typeof matches?.[1] !== 'undefined' &&
          typeof matches?.[2] !== 'undefined'
        ) {
          const videoOwner = await (
            await database().ref('users').child(matches?.[1]).once('value')
          ).val();
          if (videoOwner) {
            navigation.dispatch(
              StackActions.push('UserProfile', {user: videoOwner}),
            );
          }

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

      case 'live':
        navigation.navigate('SearchMenu', {screen: 'Search'});
        if (
          typeof matches?.[1] !== 'undefined' &&
          typeof matches?.[2] !== 'undefined'
        ) {
          const videoOwner = await (
            await database().ref('users').child(matches?.[1]).once('value')
          ).val();
          if (videoOwner) {
            navigation.dispatch(
              StackActions.push('UserProfile', {user: videoOwner}),
            );
          }

          await database()
            .ref('posts')
            .child(matches?.[1])
            .child(matches?.[2])
            .once('value', (snap) => {
              const video = snap.val();

              if (video) {
                navigation.dispatch(StackActions.push('WatchVideo', {video}));

                resolve();
              } else {
                Alert.alert('Oops', 'The live-stream does not exist.');
                reject();
              }
            })
            .catch(() => reject());
        } else {
          reject();
        }
        break;

      case 'withdraw':
        navigation.navigate('ProfileMenu', {screen: 'Profile'});
        setTimeout(
          () => navigation.dispatch(StackActions.push('WithdrawalHistory')),
          1000,
        );
        resolve();
        break;

      case 'new-subscriber':
        navigation.navigate('ProfileMenu', {screen: 'Profile'});
        setTimeout(
          () => navigation.dispatch(StackActions.push('Subscribers')),
          1000,
        );
        resolve();
        break;

      default:
        Alert.alert('Oops', constants.ERROR_ALERT_MSG);
        break;
    }
  });
}

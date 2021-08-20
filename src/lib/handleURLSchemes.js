import {Alert} from 'react-native';
import database from '@react-native-firebase/database';
import {StackActions} from '@react-navigation/routers';
import {constants} from '../resources';
import Store from '../store/Store';

export default function handleURLSchemes(event, {navigation}) {
  return new Promise(async (resolve, reject) => {
    const URL = event.url;
    const initial = event.initial;
    const route = URL.replace(/.*?:\/\//g, '');
    let matches = route.split('/');

    if (matches.length === 0 || matches?.[1] === '') {
      return;
    }

    if (Store.user) {
      navigation.navigate('SearchMenu', {screen: 'Search'});
    }

    if (typeof matches?.[1] !== undefined) {
      if (
        matches[1] === 'invite' &&
        typeof matches?.[2] !== 'undefined' &&
        matches.length === 3
      ) {
        if (Store.user) {
          Alert.alert('Oops', 'You are already signed up.');
          reject();
          return;
        }

        await database()
          .ref('users')
          .orderByChild('referralCode')
          .equalTo(matches[2])
          .once('value', async (snap) => {
            if (snap.exists()) {
              const userReferedBy = Object.values(snap.val())[0];

              navigation.dispatch(
                StackActions.push('Login', {
                  userUidReferedBy: userReferedBy.uid,
                }),
              );
            } else {
              Alert.alert('Oops', 'The referral code does not exist.');
              reject();
            }
          });
        return;
      }

      if (!Store.user || initial) {
        reject();
        return;
      }

      await database()
        .ref('users')
        .orderByChild('username')
        .equalTo(matches[1])
        .once('value', async (snap) => {
          const user = Object.values(Object.assign({}, snap.val()))?.[0];

          if (typeof user !== 'undefined') {
            if (
              matches.length === 2 ||
              matches?.[2] === '' ||
              typeof matches?.[2] === 'undefined'
            ) {
              navigation.dispatch(
                StackActions.push('UserProfile', {
                  user,
                }),
              );
              resolve();
              return;
            }

            switch (matches[2]) {
              case 'profile':
                navigation.navigate('ProfileMenu', {screen: 'Profile'});
                break;

              case 'posts':
                if (matches[1] === Store.user.username) {
                  navigation.navigate('ProfileMenu', {screen: 'Profile'});
                } else {
                  navigation.navigate('SearchMenu', {screen: 'Search'});
                }

                if (typeof matches?.[3] !== 'undefined') {
                  if (matches[1] !== Store.user.username) {
                    navigation.dispatch(
                      StackActions.push('UserProfile', {user}),
                    );
                  }

                  await database()
                    .ref('posts')
                    .child(user.uid)
                    .child(matches[3])
                    .once('value', (snap) => {
                      const video = snap.val();

                      if (video && video?.active === true) {
                        navigation.dispatch(
                          StackActions.push('WatchVideo', {video}),
                        );

                        if (matches?.[4] === 'reply') {
                          navigation.dispatch(
                            StackActions.push('Comments', {video}),
                          );
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
                if (typeof matches?.[3] !== 'undefined') {
                  navigation.dispatch(StackActions.push('UserProfile', {user}));

                  await database()
                    .ref('posts')
                    .child(user.uid)
                    .child(matches[3])
                    .once('value', (snap) => {
                      const video = snap.val();

                      if (video) {
                        navigation.dispatch(
                          StackActions.push('WatchVideo', {video}),
                        );

                        resolve();
                      } else {
                        Alert.alert('Oops', 'The livestream does not exist.');
                        reject();
                      }
                    })
                    .catch(() => reject());
                } else {
                  reject();
                }
                break;

              case 'withdraws':
                navigation.navigate('ProfileMenu', {screen: 'Profile'});
                setTimeout(
                  () =>
                    navigation.dispatch(
                      StackActions.push('WithdrawalHistory', {
                        showApproveds: !!(matches?.[3] === 'approved'),
                      }),
                    ),
                  1000,
                );
                resolve();
                break;

              case 'subscribers':
                navigation.navigate('ProfileMenu', {screen: 'Profile'});
                setTimeout(
                  () => navigation.dispatch(StackActions.push('Subscribers')),
                  1000,
                );
                resolve();
                break;

              default:
                Alert.alert('Oops', constants.ERROR_ALERT_MSG);
                reject();
                break;
            }
            resolve();
          } else {
            Alert.alert('Oops', 'The user ' + matches[1] + ' does not exist.');
            reject();
          }
        })
        .catch(() => reject());
    } else {
      reject();
    }
  });
}

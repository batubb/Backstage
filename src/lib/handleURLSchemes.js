import {Alert} from 'react-native';
import database from '@react-native-firebase/database';
import {StackActions} from '@react-navigation/routers';

export default function handleURLSchemes(event, navigation) {
  return new Promise(async (resolve, reject) => {
    const URL = event.url;
    const route = URL.replace(/.*?:\/\//g, '');
    const matches = route.match(/(.*?)\/(.*?)(\/.*)?$/);

    switch (matches?.[1]) {
      case 'profile':
        if (matches?.[2]) {
          await database()
            .ref('users')
            .orderByChild('username')
            .equalTo(matches[2])
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
        }
        break;

      default:
        Alert.alert('Oops', constants.ERROR_ALERT_MSG);
        break;
    }
  });
}

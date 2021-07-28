import database from '@react-native-firebase/database';

export default async function checkReferenceCode(code) {
  const value = await database()
    .ref('users')
    .orderByChild('referralCode')
    .equalTo(code)
    .once('value');
  const info = value.val();

  if (!info) {
    return false;
  }

  return Object.values(Object.assign({}, info))?.[0];
}

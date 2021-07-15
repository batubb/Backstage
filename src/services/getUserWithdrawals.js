import database from '@react-native-firebase/database';
import Store from '../store/Store';

export default async function getUserWithdrawals(userUID = Store.user.uid) {
  const withdraws = await (
    await database()
      .ref('withdraws')
      .orderByChild('user/uid')
      .equalTo(userUID)
      .once('value')
  ).val();

  const withdrawsList = Object.values(Object.assign({}, withdraws));
  const pendingWithdrawList = withdrawsList.filter((item) => item.status === 0);
  const completedWithdrawList = withdrawsList.filter(
    (item) => item.status === 1,
  );

  return {pendingWithdrawList, completedWithdrawList};
}

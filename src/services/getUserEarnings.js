import Store from '../store/Store';
import database from '@react-native-firebase/database';
import {constants} from '../resources';

/// @param @required user - Store user object
/// @param @required monthsData - total number of earnings data indicating
///                             - the data of each month. First element of the array is January.
/// @param months - default is constants.MONTHS
/// @param @required renderMonths - it's a list with the name of the months to be rendered.
export default async function getUserEarnings(
  user = Store.user,
  monthsData = [],
  months = constants.MONTHS,
  renderMonths = [],
) {
  const parseFloatToFixed = (value) => parseFloat(parseFloat(value).toFixed(2));

  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  currentDate.setDate(1);
  currentDate.setMonth(currentDate.getMonth() - 4);

  const transactionsData = await database()
    .ref('transactions')
    .child(Store.user.uid)
    .once('value');

  let totalEarnings =
    parseFloat(user.price * (user.numLifetimeSubscribed ?? 0)) ?? 0;
  const subscriptionEarnings = totalEarnings;

  let withdrawableBalance =
    parseFloat(totalEarnings - (user.lifetimeWithdrawnAmount ?? 0)) ?? 0;

  if (transactionsData.exists()) {
    const transactions = Object.values(
      Object.assign({}, transactionsData.val()),
    );

    transactions.forEach((transaction) => {
      if (transaction.test !== true && transaction.environment !== 'Sandbox') {
        const purchaseDate = new Date(parseInt(transaction.purchaseDate));
        const purchaseMonthName = months[purchaseDate.getMonth()].substr(0, 3);
        const purchaseMonthIndex = renderMonths.findIndex(
          (m) => m === purchaseMonthName,
        );

        if (purchaseMonthIndex) {
          monthsData[purchaseMonthIndex] += parseFloat(user.price);
        }
      }
    });
  }

  const referedUsers =
    typeof user.referralCode !== 'undefined'
      ? (await (
          await database()
            .ref('users')
            .orderByChild('referedBy')
            .equalTo(Store.uid)
            .once('value')
        ).val()) || []
      : [];

  let referralEarnings = 0;

  for (const referedUser of Object.values(Object.assign({}, referedUsers))) {
    const referedUserTransactionsData = await database()
      .ref('transactions')
      .child(referedUser.uid)
      .once('value');

    let referedUserTotalEarnings = 0;

    const referedUserTransactions = Object.values(
      Object.assign({}, referedUserTransactionsData.val()),
    );

    referedUserTransactions.forEach((referedUserTransaction) => {
      if (
        referedUserTransaction.test !== true &&
        referedUserTransaction.environment !== 'Sandbox'
      ) {
        const purchaseDate = new Date(
          parseInt(referedUserTransaction.purchaseDate),
        );
        const purchaseMonthName = months[purchaseDate.getMonth()].substr(0, 3);
        const purchaseMonthIndex = renderMonths.findIndex(
          (m) => m === purchaseMonthName,
        );

        if (purchaseMonthIndex) {
          monthsData[purchaseMonthIndex] += parseFloatToFixed(
            referedUser.price * 0.05,
          );
          referedUserTotalEarnings += parseFloatToFixed(
            referedUser.price * 0.05,
          );
        }
      }
    });

    totalEarnings += referedUserTotalEarnings;
    withdrawableBalance += referedUserTotalEarnings;
    referralEarnings += referedUserTotalEarnings;
  }

  return {
    data: monthsData.map((d) => parseFloat(d.toFixed(2))),
    totalEarnings: parseFloatToFixed(totalEarnings),
    withdrawableBalance: parseFloatToFixed(withdrawableBalance),
    referralEarnings: parseFloatToFixed(referralEarnings),
    subscriptionEarnings: parseFloatToFixed(subscriptionEarnings),
  };
}

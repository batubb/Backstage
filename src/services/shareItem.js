/* eslint-disable prettier/prettier */
import Share from 'react-native-share';
import sendDataAnalytics from './sendDataAnalytics';

export default async function shareItem(
  text = null,
  analyticsType = 'unnamed',
) {
  const shareOptions = {
    message: text,
  };

  await Share.open(shareOptions)
    .then((value) => {
      if (!value.dismissedAction) {
        sendDataAnalytics(
          analyticsType,
          'success',
          {app: value.app},
          value.app,
        );
      }
    })
    .catch((reason) => {
      if (reason.message !== 'User did not share') {
        sendDataAnalytics(
          analyticsType,
          'success',
          {name: reason.name, message: reason.message},
          value.message,
        );
      }
    });
}

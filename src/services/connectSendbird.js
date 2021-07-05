import {Alert} from 'react-native';
import SendBird from 'sendbird';
import axios from 'axios';
import {constants} from '../resources';
import Store from '../store/Store';
import database from '@react-native-firebase/database';

export const sendbird = new SendBird({appId: constants.SENDBIRD_APP_ID});

export function sendBirdLoginWithAccessToken(user_id, access_token) {
  return new Promise((resolve, reject) => {
    sendbird.connect(user_id, access_token, async (user, error) => {
      if (error) {
        reject(error);
        return;
      }
      user = await checkUserInfo();
      resolve(user);
    });
  });
}

export function sendBirdCreateUser() {
  return new Promise((resolve, reject) =>
    axios
      .post(
        `${constants.SENDBIRD_API_REQUEST_URL}/${constants.SENDBIRD_API_VERSION}/users`,
        {
          user_id: Store.user.uid,
          nickname: Store.user.username,
          profile_url: Store.user.photo,
          issue_access_token: true,
        },
        {
          headers: {
            'Api-Token': constants.SENDBIRD_ACCESS_TOKEN,
            'Content-Type': 'application/json',
          },
        },
      )
      .then(async ({data}) => {
        try {
          const updates = {
            sendbirdAccessToken: data.access_token,
          };
          await database().ref('users').child(Store.user.uid).update(updates);
          await Store.setUser({...Store.user, ...updates});
          resolve(
            sendBirdLoginWithAccessToken(data.user_id, data.access_token),
          );
        } catch (error) {
          return Alert.alert('Oops', constants.ERROR_ALERT_MSG, [
            {text: 'Okay'},
          ]);
        }
      })
      .catch((error) => {
        if (error.response.data.code === 400202) {
          resolve(
            sendBirdLoginWithAccessToken(
              Store.user.uid,
              data.sendbirdAccessToken,
            ),
          );
        } else {
          console.error(error);
        }
      }),
  );
}

export async function sendBirdDisconnect() {
  return await sendbird.disconnect();
}

function checkUserInfo() {
  return new Promise((resolve, reject) => {
    if (
      sendbird.currentUser.nickname !== Store.user.username ||
      sendbird.currentUser.profileUrl !== Store.user.photo
    ) {
      sendbird.updateCurrentUserInfo(
        Store.user.username,
        Store.user.photo,
        (user, error) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(user);
        },
      );
      return;
    }
    resolve(sendbird.currentUser);
  });
}

// - should be called after publishing an video by influencer.
export function sendBirdCreateChannel(videoData) {
  const params = new sendbird.OpenChannelParams();
  params.name = `${Store.user.uid}-${videoData.uid}`;
  params.coverUrlOrImage = videoData.thumbnail.url;
  params.operatorUserIds = constants.SENDBIRD_OPERATOR_USER_IDS;

  return new Promise((resolve, reject) =>
    sendbird.OpenChannel.createChannel(
      params,
      async (openChannel, error) => {
        if (error) {
          reject(error);
          return;
        }
        console.log(openChannel);
        // openChannel.updateChannel();
      },
    ),
  );
}

export function sendBirdEnterChannel() {
  return new Promise((resolve, reject) => {
    //sendbird.OpenChannel.getChannel()
  });
}

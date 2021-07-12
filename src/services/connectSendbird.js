import {Alert} from 'react-native';
import SendBird from 'sendbird';
import axios from 'axios';
import {constants} from '../resources';
import Store from '../store/Store';
import database from '@react-native-firebase/database';
import {makeid} from '../lib';

export const sendbird = new SendBird({appId: constants.SENDBIRD_APP_ID});

export async function authSendBird() {
  if (sendbird.currentUser === null) {
    if (Store.user.sendbirdAccessToken) {
      await sendBirdLoginWithAccessToken(
        Store.user.uid,
        Store.user.sendbirdAccessToken,
      );
    } else {
      await sendBirdCreateUser();
    }
  }
}

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

// TODO: if it's anonymus, user should be updated.
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

export function sendBirdCreateChannel(userData) {
  return new Promise((resolve, reject) =>
    authSendBird().then(async () => {
      await checkUserInfo();
      const params = new sendbird.OpenChannelParams();
      params.name = `${userData.uid}`;
      params.operatorUserIds = constants.SENDBIRD_OPERATOR_USER_IDS;
      params.customType = `${userData.uid}`;

      sendbird.OpenChannel.createChannel(params, async (openChannel, error) => {
        if (error) {
          reject(error);
          return;
        }
        try {
          await database()
            .ref('users')
            .child(userData.uid)
            .update({
              ...userData,
              sendbirdRoomUrl: openChannel.url,
            });
          resolve(openChannel.url);
        } catch (error) {
          reject(error);
        }
      });
    }),
  );
}

export async function getSendBirdChannelFromUrl(url) {
  return await sendbird.OpenChannel.getChannel(url);
}

export async function sendBirdEnterChannel(url) {
  return new Promise((resolve, reject) =>
    authSendBird().then(async () => {
      await checkUserInfo();
      getSendBirdChannelFromUrl(url)
        .then(async (openChannel) =>
          openChannel.enter((response, error) => {
            if (error) {
              reject(error);
            } else {
              resolve(openChannel);
            }
          }),
        )
        .catch((error) => reject(error));
    }),
  );
}

export function sendBirdLeaveChannel(connection) {
  return new Promise((resolve, reject) =>
    connection.exit((response, error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(response);
    }),
  );
}

export const SENDBIRD_MESSAGE_CALLBACK_TYPES = {
  RECEIVE: 'RECEIVE',
  DELETE: 'DELETE',
  BAN: 'BAN',
};

export function startSendBirdChannelHandler(channelUrl, callback) {
  const channelHandler = new sendbird.ChannelHandler();
  const channelHandlerId = makeid(12);

  channelHandler.onMessageReceived = (channel, message) => {
    console.log(message);
    if (channel.url === channelUrl) {
      callback(SENDBIRD_MESSAGE_CALLBACK_TYPES.RECEIVE, channel, message);
    }
  };
  channelHandler.onMessageDeleted = (channel, messageId) => {
    if (channel.url === channelUrl) {
      callback(SENDBIRD_MESSAGE_CALLBACK_TYPES.DELETE, channel, {messageId});
    }
  };
  channelHandler.onMessageUpdated = (channel, message) => {
    if (channel.url === channelUrl) {
      callback(SENDBIRD_MESSAGE_CALLBACK_TYPES.RECEIVE, channel, message);
    }
  };
  channelHandler.onUserBanned = (channel, user) => {
    if (channel.url === channelUrl) {
      callback(SENDBIRD_MESSAGE_CALLBACK_TYPES.BAN, channel, user);
    }
  };

  sendbird.addChannelHandler(channelHandlerId, channelHandler);

  return [channelHandler, () => sendbird.removeChannelHandler(channelHandlerId)];
}

export function sendMessageToSendBirdChannel(message, connection) {
  const params = new sendbird.UserMessageParams();
  params.message = message;
  return new Promise((resolve, reject) =>
    connection.sendUserMessage(params, (message, error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(message);
    }),
  );
}

export function loadSendBirdChannelMessages(
  channel,
  offset = 0,
  limit = 30,
  reverse = false,
) {
  const listQuery = channel.createPreviousMessageListQuery();

  if (offset === 0) {
    listQuery.includeReplies = true;
    listQuery.includeThreadInfo = false;
    listQuery.includeParentMessageText = false;
    return new Promise((resolve, reject) => {
      listQuery.load(
        limit,
        reverse,
        sendbird.BaseChannel.MessageTypeFilter.ALL,
        (messages, error) => {
          if (error) {
            reject(error);
          } else {
            resolve(messages);
          }
        },
      );
    });
  } else {
    listQuery.limit = limit * (offset + 1);
    listQuery.reverse = reverse;
    return new Promise((resolve, reject) => {
      listQuery.load((messages, error) => {
        if (error) {
          reject(error);
        } else {
          resolve(messages);
        }
      });
    });
  }
}

export function banUserFromSendBirdChannel(
  connection,
  user_id,
  seconds = -1,
  description = 'Banned by the influencer.',
) {
  return new Promise((resolve, reject) =>
    axios
      .post(
        `${constants.SENDBIRD_API_REQUEST_URL}/${constants.SENDBIRD_API_VERSION}/applications/settings_by_channel_custom_type/${connection.customType}/ban`,
        {
          banned_list: [
            {
              user_id,
              seconds,
              description,
            },
          ],
          on_demand_upsert: false,
        },
        {
          headers: {
            'Api-Token': constants.SENDBIRD_ACCESS_TOKEN,
            'Content-Type': 'application/json',
          },
        },
      )
      .then(async ({data}) => {
        resolve(true);
      })
      .catch((error) => {
        reject(error);
      }),
  );
}

export function getDefaultEmojisFromSendBird() {
  return new Promise((resolve, reject) =>
    axios
      .get(
        `${constants.SENDBIRD_API_REQUEST_URL}/${constants.SENDBIRD_API_VERSION}/emoji_categories`,
        {
          headers: {
            'Api-Token': constants.SENDBIRD_ACCESS_TOKEN,
            'Content-Type': 'application/json',
          },
        },
      )
      .then(async ({data}) => {
        resolve(data.emoji_categories);
      })
      .catch((error) => {
        reject(error);
      }),
  );
}

// export function addReactionToMessage() {
//   axios.post(
//     `${constants.SENDBIRD_API_REQUEST_URL}/${constants.SENDBIRD_API_VERSION}/emoji_categories`,
//     {
//       user_id: Store.user.uid,
//       nickname: Store.user.username,
//       profile_url: Store.user.photo,
//       issue_access_token: true,
//     },
//     {
//       headers: {
//         'Api-Token': constants.SENDBIRD_ACCESS_TOKEN,
//         'Content-Type': 'application/json',
//       },
//     },
//   );
// }

import getUserSubscribers from './getUserSubscribers';
import sendNotificationToUserDevices from './sendNotificationToUserDevices';
import Store from '../store/Store';

/// @required type from notificationTemplates data.
///
/// @optional replaceContents
/// Show messages dynamically by replacing messages. It can contain more than one.
/// The content and messages both will be replaced.
/// [{
///     key: '{username}'
///     value: 'johndoe',
/// }]
///
/// @optional url
/// @default backstage://
export default async function sendNotificationToUserSubscribers(
  type,
  user = Store.user,
  replaceContents = undefined,
  url = undefined,
) {
  const subscribers = await getUserSubscribers(user.uid);

  if (subscribers.length > 0) {
    const activeSubscriberUserUIDs = subscribers.map((subscriber) => subscriber.user.uid);

    await sendNotificationToUserDevices(
      type,
      activeSubscriberUserUIDs,
      replaceContents,
      url,
    );
  }

  return true;
}

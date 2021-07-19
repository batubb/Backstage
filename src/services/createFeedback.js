import database from '@react-native-firebase/database';
import Store from '../store/Store';

/// @required uid - string - unique uid of the feedback.
/// - Do not create again because media associated with that.
/// @required type - string
/// message - string - only media can be send
/// media - the uid of the all media in the list
export default async function createFeedback(uid, type, message = '', media) {
  const feedbackRef = await database().ref('feedbacks').child(uid);

  var mediaData = {};

  for (const item of media) {
    mediaData[item.uid] = item;
  }

  await feedbackRef.set({
    media: mediaData,
    uid,
    type,
    message,
    timestamp: new Date().getTime(),
    status: 0, // 0 = sent, 1 = read receipt, 2 = approved & archieved
    user: Store.user,
  });
}

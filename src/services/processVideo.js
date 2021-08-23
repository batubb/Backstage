import storage from '@react-native-firebase/storage';
import Store from '../store/Store';
import {createThumbnail} from 'react-native-create-thumbnail';
import createVideoData from './createVideoData';
import getUserPosts from './getUserPosts';
import * as Sentry from '@sentry/react-native';
import {Severity} from '@sentry/react-native';

/**
 * Start process to upload a video.
 * @param {string} uid Unique uid
 * @param {string} title Title of the video
 * @param {string} url Local video uri
 * @param {{url: string, width: number, height: number}} thumbnailData Thumbnail Data of the video
 */
export default function processVideo(uid, title, url, thumbnailData) {
  Store.setProcessingPosts('ADDED', {
    uid,
    title,
    loading: 10,
    timestamp: new Date().getTime(),
    user: Store.user,
  });
  Promise.all([
    // Upload Thumbnail -- BEGIN
    new Promise(async (resolve, reject) => {
      let thumbnailPath = '';
      let thumbnail = {};
      if (thumbnailData.url !== '') {
        thumbnailPath = thumbnailData.url;
        thumbnail = thumbnailData;
      } else {
        const createdThumbnail = await createThumbnail({
          url: url,
          timeStamp: 10000,
        });
        thumbnailPath = createdThumbnail.path;
        thumbnail.width = createdThumbnail.width;
        thumbnail.height = createdThumbnail.height;
      }
      const thumbnailRef = storage()
        .refFromURL(Store.currentRegionBucket)
        .child(`thumbnails/${uid}.jpg`);
      try {
        await thumbnailRef.putFile(thumbnailPath);
        thumbnail.url = await thumbnailRef.getDownloadURL();

        Store.setProcessingPosts('UPDATED', {
          uid,
          thumbnail,
          loading:
            Store.processingPosts.find((post) => post?.uid === uid).loading +
            20,
        });
        resolve(thumbnail);
      } catch (e) {
        reject(e);
      }
    }),
    // Upload Thumbnail -- END
    // Upload Video - BEGIN
    new Promise(async (resolve, reject) => {
      const videoRef = storage()
        .refFromURL(Store.currentRegionBucket)
        .child(`videos/${uid}.mp4`);
      try {
        await videoRef.putFile(url);
        const videoUri = await videoRef.getDownloadURL();

        Store.setProcessingPosts('UPDATED', {
          uid,
          uri: videoUri,
          loading:
            Store.processingPosts.find((post) => post?.uid === uid).loading +
            65,
        });
        resolve(videoUri);
      } catch (e) {
        reject(e);
      }
    }),
    // Upload Video - END
  ])
    .then(async (values) => {
      const video = {
        uid,
        title,
        url: values[1],
        thumbnail: {
          url: values[0]['url'],
          width: values[0]['width'],
          height: values[0]['height'],
        },
      };

      const isCreated = await createVideoData(Store.user, video);
      if (isCreated) {
        Store.setProcessingPosts('COMPLETED', {uid});
        await getUserPosts(Store.user.uid, true);
      } else {
        Store.setProcessingPosts('ERROR', {uid});
      }
    })
    .catch((error) => {
      Store.setProcessingPosts('ERROR', {uid});
      Sentry.captureEvent({
        user: {
          id: Store.user.uid,
          username: Store.user.username,
          data: Store.user,
        },
        message: 'Video Processing Error',
        tags: ['video', 'post', 'influencer', 'processing'],
        level: __DEV__ ? Severity.Debug : Severity.Critical,
        exception: error,
        contexts: {
          post_uid: uid,
          post_title: title,
          post_url: url,
          post_thumbnail: thumbnailData,
        },
        timestamp: new Date().getTime(),
        environment: __DEV__,
      });
    });
}

/* eslint-disable prettier/prettier */
import {observable, action, computed} from 'mobx';
import {default as editPosts} from '../lib/setPosts';
import {constants} from '../resources';
import {sendNotificationToUserDevices} from '../services';

class Store {
  @observable user = null;
  @observable uid = null;
  @observable phone = null;
  @observable followList = [];
  @observable posts = [];
  @observable devices = [];
  @observable currentRegionBucket = constants.STORAGE_BUCKETS.US;
  @observable processingPosts = [];
  @observable statusBar = {
    active: false,
    color: constants.BLUE,
    text: '',
  };

  @action setUID = (uid) => {
    this.uid = uid;
  };

  @action setUser = (data) => {
    this.user = data;
  };

  @action setPhone = (data) => {
    this.phone = data;
  };

  @action setFollowList = (data) => {
    this.followList = data;
  };

  @action setPosts = (data) => {
    const {postsArray, daily} = editPosts(data);
    this.posts = {posts: data, postsArray, daily};
  };

  @action setDevices = (data) => {
    this.devices = data;
  };

  @action clearUserData = () => {
    this.uid = null;
    this.phone = null;
    this.user = null;
    this.followList = null;
    this.posts = null;
  };

  @action setCurrentRegionBucket = (country) => {
    if (country !== 'US') {
      this.currentRegionBucket = constants.STORAGE_BUCKETS.US;
    } else {
      this.currentRegionBucket = constants.STORAGE_BUCKETS.EUROPE_WEST;
    }
  };

  @computed getProcessingPost = (uid) => {
    return this.processingPosts.find((post) => post?.uid === uid);
  };

  /**
   * @param {"ADDED", "COMPLETED", "UPDATED", "ERROR"} status
   * @param {Object} data Post Data
   */
  @action setProcessingPosts = (status, data) => {
    switch (status) {
      case 'ADDED':
        this.processingPosts.push(data);
        this.setStatusBar(constants.BLUE, 'Video processing');
        break;

      case 'COMPLETED':
        this.processingPosts = this.processingPosts.filter(
          (post) => post.uid !== data.uid,
        );
        const video_url = `${constants.APP_WEBSITE}/${this.user.username}/posts/${data.uid}`;
        sendNotificationToUserDevices(
          'video-uploaded',
          [this.uid],
          undefined,
          video_url,
        );
        this.setStatusBar(constants.GREEN, 'Video successfully posted.');

        setTimeout(() => {
          // do not hide status bar if another video process starts within 5 seconds.
          if (this.statusBar.text === 'Video successfully posted.') {
            this.hideStatusBar();
          }
        }, 3000);
        break;

      case 'UPDATED':
        this.processingPosts.forEach((post, i) => {
          if (post.uid === data.uid) {
            this.processingPosts[i] = {...post, ...data};
          }
        });
        break;

      case 'ERROR':
        this.processingPosts.forEach((post, i) => {
          if (post.uid === data.uid) {
            this.processingPosts[i].status = 'ERROR';
          }
        });
        this.setStatusBar(constants.RED, 'Video could not posted.');

        setTimeout(() => {
          // do not hide status bar if another video process starts within 5 seconds.
          if (this.statusBar.text === 'Video could not posted.') {
            this.hideStatusBar();
          }
        }, 5000);
        break;

      default:
        break;
    }
  };

  @action setStatusBar = (color = null, text = null) => {
    this.statusBar = {
      active: true,
      color: color || this.statusBar.color,
      text: text || '',
    };
  };

  @action hideStatusBar = () => {
    this.statusBar = {active: false, color: null, text: ''};
  };
}

export default new Store();

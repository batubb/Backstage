import React from 'react';
import {observable, action, makeObservable} from 'mobx';
import {default as editPosts} from '../lib/setPosts';
import {constants} from '../resources';
import sendNotificationToUserDevices from '../services/sendNotificationToUserDevices';

class Store {
  @observable user = null;
  @observable uid = null;
  @observable phone = null;
  @observable devices = [];
  @observable currentRegionBucket = constants.STORAGE_BUCKETS.US;
  followList = [];
  posts = [];
  processingPosts = [];
  statusBar = {
    active: false,
    color: constants.BLUE,
    text: '',
  };

  constructor() {
    makeObservable(this, {
      clearUserData: action,
      followList: observable,
      setFollowList: action.bound,
      posts: observable,
      setPosts: action.bound,
      processingPosts: observable,
      setProcessingPosts: action.bound,
      statusBar: observable,
      setStatusBar: action.bound,
      hideStatusBar: action.bound,
    });
  }

  @action setUID = (uid) => {
    this.uid = uid;
  };

  @action setUser = (data) => {
    this.user = data;
  };

  @action setPhone = (data) => {
    this.phone = data;
  };

  setFollowList = (data) => {
    this.followList = data;
  };

  setPosts = (data) => {
    const {postsArray, daily} = editPosts(data);
    this.posts = {posts: data, postsArray, daily};
  };

  @action setDevices = (data) => {
    this.devices = data;
  };

  clearUserData = () => {
    this.uid = null;
    this.phone = null;
    this.user = null;
    this.followList = null;
    this.posts = null;
    this.processingPosts = [];
  };

  @action setCurrentRegionBucket = (country) => {
    if (country !== 'US') {
      this.currentRegionBucket = constants.STORAGE_BUCKETS.US;
    } else {
      this.currentRegionBucket = constants.STORAGE_BUCKETS.EUROPE_WEST;
    }
  };

  /**
   * @param {"ADDED", "COMPLETED", "UPDATED", "ERROR", "REMOVE"} status
   * @param {Object} data Post Data
   */
  setProcessingPosts = (status, data) => {
    switch (status) {
      case 'ADDED':
        this.processingPosts.push(data);
        this.processingPosts.sort(function (a, b) {
          return b.timestamp - a.timestamp;
        });
        this.setStatusBar(constants.BLUE, 'Video processing');
        break;

      case 'COMPLETED':
        this.processingPosts.forEach((post, i) => {
          if (post.uid === data.uid) {
            this.processingPosts[i] = {...post, status, loading: false};
          }
        });
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
        this.setStatusBar(constants.BLUE, 'Video uploading');
        break;

      case 'REMOVE':
        this.processingPosts = this.processingPosts
          .filter((post) => post.uid !== data.uid)
          .sort(function (a, b) {
            return b.timestamp - a.timestamp;
          });
        // hide status bar if another video process didn't start
        if (this.statusBar.text === 'Video could not posted.') {
          this.hideStatusBar();
        }
        break;

      case 'ERROR':
        this.processingPosts.forEach((post, i) => {
          if (post.uid === data.uid) {
            this.processingPosts[i].status = 'ERROR';
          }
        });
        this.setStatusBar(constants.RED, 'Video could not posted.');
        break;

      default:
        break;
    }
  };

  setStatusBar = (color = null, text = null) => {
    this.statusBar = {
      active: true,
      color: color || this.statusBar.color,
      text: text || '',
    };
  };

  hideStatusBar = () => {
    this.statusBar = {active: false, color: null, text: ''};
  };
}

export default new Store();

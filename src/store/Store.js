/* eslint-disable prettier/prettier */
import {observable, action, computed} from 'mobx';
import {default as editPosts} from '../lib/setPosts';
import {constants} from '../resources';

class Store {
  @observable user = null;
  @observable uid = null;
  @observable phone = null;
  @observable followList = [];
  @observable posts = [];
  @observable devices = [];
  @observable currentRegionBucket = constants.STORAGE_BUCKETS.US;
  @observable processingPosts = [];

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
      this.currentRegionBucket = constants.STORAGE_BUCKETS.EUROPE_WEST1;
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
        break;
      case 'COMPLETED':
        this.processingPosts = this.processingPosts.filter(
          (post) => post.uid !== data.uid,
        );
        break;
      case 'UPDATED':
        this.processingPosts.forEach((post, i) => {
          if (post.uid === data.uid) {
            this.processingPosts[i] = {...post, ...data};
          }
        });
        break;
      default:
        this.processingPosts.forEach((post, i) => {
          if (post.uid === data.uid) {
            this.processingPosts[i].status = status;
          }
        });
        break;
    }
  };
}

export default new Store();

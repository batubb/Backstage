/* eslint-disable prettier/prettier */
import {observable, action} from 'mobx';
import {default as editPosts} from '../lib/setPosts';
import {firebase} from '@react-native-firebase/storage';
import {constants} from '../resources';

class Store {
  @observable user = null;
  @observable uid = null;
  @observable phone = null;
  @observable followList = [];
  @observable posts = [];
  @observable devices = [];
  @observable currentRegionBucket = constants.STORAGE_BUCKETS.US;

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
    if (country === 'US') {
      this.currentRegionBucket = constants.STORAGE_BUCKETS.US;
    } else {
      this.currentRegionBucket = constants.STORAGE_BUCKETS.EUROPE_WEST1;
    }
  };
}

export default new Store();

/* eslint-disable prettier/prettier */
import { observable, action } from 'mobx';
import { setPosts as editPosts } from '../lib';

class Store {
    @observable user = null;
    @observable uid = null;
    @observable phone = null;
    @observable followList = [];
    @observable posts = [];
    @observable devices = [];

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
        const { postsArray, daily } = editPosts(data);
        this.posts = { posts: data, postsArray, daily };
    };

    @action setDevices = (data) => {
        this.devices = data;
    };

    @action clearUserData = () => {
        this.uid = null;
        this.phone = null;
        this.user = null;
        this.followList = null;
        this.posts = null
    }
}

export default new Store();

/* eslint-disable react/no-did-mount-set-state */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React, {Component} from 'react';
import {
  View,
  Dimensions,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import {observer} from 'mobx-react';
import {StackActions} from '@react-navigation/native';
import {
  Loading,
  Header,
  Text,
  MyImage,
  Button,
  Options,
} from '../../components';
import {constants} from '../../resources';
import {
  getUserPosts,
  getFollowingUserPosts,
  setHighlights,
  checkUserInfo,
} from '../../services';
import {Icon} from 'react-native-elements';
import {followerCount, setPosts, makeid, timeDifference} from '../../lib';
import LinearGradient from 'react-native-linear-gradient';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import database from '@react-native-firebase/database';
import storage from '@react-native-firebase/storage';
import moment from 'moment';

import Store from '../../store/Store';
import {SIZES} from '../../resources/theme';
import ProfileTop from '../../components/ScreenComponents/ProfileComponents/ProfileTop/ProfileTop';
import PostsCard from '../../components/ScreenComponents/ProfileComponents/PostsCard/PostsCard';

const {width} = Dimensions.get('window');

class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      photo:
        typeof Store.user.photo === 'undefined'
          ? 'https://www.atlassian.com/dam/jcr:ba03a215-2f45-40f5-8540-b2015223c918/Max-R_Headshot%20(1).jpg'
          : Store.user.photo,
      name:
        typeof Store.user.name === 'undefined' ? 'No Name' : Store.user.name,
      biography:
        typeof Store.user.biography === 'undefined'
          ? 'No Biography'
          : Store.user.biography,
      cumulativeViewsUser:
        typeof Store.user.cumulativeViewsUser === 'undefined'
          ? 0
          : Store.user.cumulativeViewsUser,
      followingArray: [],
      posts: [],
      postsArray: [],
      refreshing: false,
      daily: [],
      optionsVisible: false,
      optionsData: null,
    };

    this.list = [
      {title: 'Edit', onPress: this.editHighlight},
      {title: 'Delete', color: constants.RED, onPress: this.deleteHighlight},
    ];
  }

  componentDidMount = async () => {
    if (Store.user.type === 'user') {
      const followingArray = await getFollowingUserPosts(
        Store.uid,
        Store.followList,
      );
      this.setState({loading: false, followingArray});

      this.unsubscribe = this.props.navigation.addListener('focus', (e) => {
        this.setState({
          name:
            typeof Store.user.name === 'undefined'
              ? 'No Name'
              : Store.user.name,
          biography:
            typeof Store.user.biography === 'undefined'
              ? 'No Biography'
              : Store.user.biography,
          photo:
            typeof Store.user.photo === 'undefined'
              ? 'https://www.atlassian.com/dam/jcr:ba03a215-2f45-40f5-8540-b2015223c918/Max-R_Headshot%20(1).jpg'
              : Store.user.photo,
          cumulativeViewsUser:
            typeof Store.user.cumulativeViewsUser === 'undefined'
              ? 0
              : Store.user.cumulativeViewsUser,
        });
      });
    } else if (Store.user.type === 'influencer') {
      const posts = await getUserPosts(Store.user.uid, true);
      const {postsArray, daily} = setPosts(posts);
      this.setState({
        posts: posts,
        postsArray: postsArray,
        daily: daily,
        loading: false,
      });

      this.unsubscribe = this.props.navigation.addListener('focus', (e) => {
        this.setState({
          posts: Store.posts.posts,
          postsArray: Store.posts.postsArray,
          daily: Store.posts.daily,
          name:
            typeof Store.user.name === 'undefined'
              ? 'No Name'
              : Store.user.name,
          biography:
            typeof Store.user.biography === 'undefined'
              ? 'No Biography'
              : Store.user.biography,
          photo:
            typeof Store.user.photo === 'undefined'
              ? 'https://www.atlassian.com/dam/jcr:ba03a215-2f45-40f5-8540-b2015223c918/Max-R_Headshot%20(1).jpg'
              : Store.user.photo,
          cumulativeViewsUser:
            typeof Store.user.cumulativeViewsUser === 'undefined'
              ? 0
              : Store.user.cumulativeViewsUser,
        });
      });
    }
  };

  componentWillUnmount = () => {
    this.unsubscribe();
  };

  onRefresh = async () => {
    this.setState({refreshing: true});

    if (Store.user.type === 'user') {
      const followingArray = await getFollowingUserPosts(
        Store.uid,
        Store.followList,
      );
      this.setState({refreshing: false, followingArray});
    } else if (Store.user.type === 'influencer') {
      const posts = await getUserPosts(Store.user.uid, true);
      const {postsArray, daily} = setPosts(posts);
      this.setState({
        posts: posts,
        postsArray: postsArray,
        daily: daily,
        refreshing: false,
      });
    }
  };

  goTo = (route, info = null) => {
    if (route === 'UserProfile') {
      const replaceActions = StackActions.push(route, {user: info});
      return this.props.navigation.dispatch(replaceActions);
    } else if (route === 'WatchVideo') {
      const replaceActions = StackActions.push(route, {video: info});
      return this.props.navigation.dispatch(replaceActions);
    } else if (route === 'Settings') {
      const replaceActions = StackActions.push(route);
      return this.props.navigation.dispatch(replaceActions);
    } else if (route === 'Highlights') {
      const replaceActions = StackActions.push(route, {
        group: info ? info : undefined,
      });
      return this.props.navigation.dispatch(replaceActions);
    } else if (route === 'MyInfo') {
      const replaceActions = StackActions.push(route, {type: info});
      return this.props.navigation.dispatch(replaceActions);
    } else if (route === 'EditProfile') {
      const replaceActions = StackActions.push(route, {type: info});
      return this.props.navigation.dispatch(replaceActions);
    }
  };

  editHighlight = () => {
    this.setState({optionsVisible: false}, () => {
      this.goTo('Highlights', this.state.optionsData);
    });
  };

  deleteHighlight = async () => {
    this.setState({optionsVisible: false, loading: true});

    const result = await setHighlights(
      Store.user,
      this.state.posts,
      this.state.optionsData,
      true,
    );

    if (result) {
      const posts = await getUserPosts(Store.user.uid, true);
      const {postsArray, daily} = setPosts(posts);
      this.setState({
        posts: posts,
        postsArray: postsArray,
        daily: daily,
        loading: false,
      });
    }
  };

  renderPosts = (posts) => {
    return (
      <FlatList
        data={posts}
        keyExtractor={(item) => item.uid}
        extraData={Store.posts}
        numColumns={constants.NUM_POSTS_PER_ROW_PROFILE}
        renderItem={({item, index}) => (
          <View
            style={{
              flex: 1 / constants.NUM_POSTS_PER_ROW_PROFILE,
              aspectRatio: 2 / 3,
              marginRight:
                index % constants.NUM_POSTS_PER_ROW_PROFILE !==
                constants.NUM_POSTS_PER_ROW_PROFILE - 1
                  ? SIZES.spacing * 5
                  : null,
              marginBottom: SIZES.spacing * 5,
            }}>
            <TouchableOpacity
              onPress={() => this.goTo('WatchVideo', item)}
              style={{width: '100%'}}>
              <View
                style={{
                  borderRadius: 16,
                  backgroundColor: '#4d4d4d',
                }}>
                <MyImage
                  style={{
                    borderRadius: 16,
                    height: '100%',
                    width: '100%',
                  }}
                  photo={item.photo}
                />
                <LinearGradient
                  colors={[
                    'transparent',
                    'transparent',
                    constants.BACKGROUND_COLOR,
                  ]}
                  style={{
                    borderRadius: 16,
                    position: 'absolute',
                    height: '100%',
                    width: '100%',
                  }}
                />
                <View
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    paddingVertical: 5,
                    paddingHorizontal: 10,
                  }}>
                  <Text
                    text={
                      item.title.length >= 17
                        ? `${item.title.substring(0, 17)}...`
                        : item.title
                    }
                    style={{fontSize: 12}}
                  />
                  <Text
                    text={`${followerCount(item.view)} views`}
                    style={{fontSize: 12, fontWeight: 'normal'}}
                  />
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}
      />
    );
  };

  renderPosts2 = (posts) => {
    return (
      <PostsCard
        posts={posts}
        navigation={this.props.navigation}
        numCols={constants.NUM_POSTS_PER_ROW_PROFILE}
        extraData={Store.posts}
        onPress={(item) => this.goTo('WatchVideo', item)}
      />
    );
  };

  renderUserSection = (data) => {
    return (
      <>
        <View style={{width: width, paddingHorizontal: 20}}>
          <Text text="Latest Influencer Activities" style={{fontSize: 20}} />
        </View>
        <FlatList
          data={data}
          keyExtractor={(item) => item.uid}
          renderItem={({item}) => (
            <View style={{width: width, alignItems: 'center', marginTop: 10}}>
              <TouchableOpacity onPress={() => this.goTo('UserProfile', item)}>
                <View
                  style={{
                    width: width - 20,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                  <MyImage
                    style={{width: 60, height: 60, borderRadius: 30}}
                    photo={item.photo}
                  />
                  <View
                    style={{
                      flexDirection: 'row',
                      width: width - 90,
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                    <View style={{width: width - 170}}>
                      <Text text={item.name} style={{fontSize: 16}} />
                      <Text
                        text={`@${item.username}`}
                        style={{
                          fontSize: 14,
                          fontWeight: 'normal',
                          color: 'gray',
                        }}
                      />
                    </View>
                    <View
                      style={{
                        width: 60,
                        justifyContent: 'flex-end',
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}>
                      <Text
                        text={timeDifference(item.lastActivity)}
                        style={{
                          fontSize: 12,
                          fontWeight: 'normal',
                          color: 'lightgray',
                          marginRight: 5,
                        }}
                      />
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          )}
        />
      </>
    );
  };

  render() {
    const {
      loading,
      photo,
      name,
      biography,
      followingArray,
      postsArray,
      daily,
      refreshing,
      optionsVisible,
      cumulativeViewsUser,
    } = this.state;
    return (
      <View style={{flex: 1, backgroundColor: constants.BACKGROUND_COLOR}}>
        <Header
          title={`${Store.user.username}`}
          rightButtonPress={() => this.goTo('Settings')}
          rightButtonIcon="cog-outline"
        />
        {loading ? (
          <Loading
            loadingStyle={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            textStyle={{marginTop: 10, fontWeight: 'normal'}}
            text="Loading"
          />
        ) : (
          <ScrollView
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => this.onRefresh()}
                tintColor="white"
              />
            }
            contentContainerStyle={{
              width: constants.DEFAULT_PAGE_WIDTH,
              alignSelf: 'center',
              marginTop: SIZES.spacing * 5,
            }}>
            <View
              style={{
                display: 'flex',
              }}>
              <ProfileTop
                name={name}
                photo={photo}
                biography={biography}
                editProfileVisible
                navigation={this.props.navigation}
                views={cumulativeViewsUser}
              />
            </View>
            {Store.user.type === 'user'
              ? this.renderUserSection(followingArray)
              : null}
            {Store.user.type === 'influencer' ? (
              <View>
                {daily.length !== 0 ? this.renderPosts2(daily) : null}
              </View>
            ) : null}
          </ScrollView>
        )}
        <Options
          list={this.list}
          visible={optionsVisible}
          cancelPress={() =>
            this.setState({optionsVisible: false, optionsData: null})
          }
        />
      </View>
    );
  }
}

export default observer(Profile);

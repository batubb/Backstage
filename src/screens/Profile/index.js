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

import Store from '../../store/Store';
import {SIZES} from '../../resources/theme';

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

  choosePhotoType = () => {
    Alert.alert('Choose', 'Where would you like to select the photo?', [
      {text: 'Gallery', onPress: () => this.pickImage()},
      {text: 'Camera', onPress: () => this.takeImage()},
      {text: 'Cancel', style: 'cancel'},
    ]);
  };

  pickImage = async () => {
    launchImageLibrary(
      {
        quality: 0.4,
        base64: true,
      },
      (result) => {
        if (!result.didCancel) {
          this.handleImagePicked(result.uri);
        }
      },
    );
  };

  uploadImage = async (uri, onname) => {
    var ref = storage().ref().child(`users/${onname}.jpg`);
    await ref.putFile(uri);

    return await ref.getDownloadURL();
  };

  handleImagePicked = async (url) => {
    this.setState({loading: true});

    const onname = `${makeid(8)}-${makeid(4)}-${makeid(4)}-${makeid(
      4,
    )}-${makeid(12)}`;

    let data = await this.uploadImage(url, onname);

    const photoThumbURL = `${constants.USER_PHOTO_THUMB_URL}${onname}_300x300.jpg?alt=media`;

    var updates = {};
    updates[`users/${Store.user.uid}/photo`] = photoThumbURL;
    updates[`users/${Store.user.uid}/originalPhoto`] = data;

    try {
      await database().ref().update(updates);
      await checkUserInfo(Store.uid, true);
      this.setState({photo: data});
    } catch (error) {
      return Alert.alert('Oops', 'Something unexpected happens.', [
        {text: 'Okay'},
      ]);
    }

    this.setState({loading: false});
  };

  takeImage = async () => {
    const result = await launchCamera({
      quality: 0.4,
      base64: true,
    });

    if (!result.didCancel) {
      this.handleImagePicked(result.uri);
    }
  };

  renderProfileTop = (name, biography, photo) => {
    const constWidth = width / 3;
    return (
      <View
        style={{
          width: width,
          flexDirection: 'row',
          padding: 15,
          alignItems: 'center',
        }}>
        <TouchableOpacity onPress={() => this.choosePhotoType()}>
          <MyImage
            style={{
              width: constWidth,
              height: constWidth,
              borderRadius: constWidth / 2,
            }}
            photo={photo}
          />
          <View
            style={{
              position: 'absolute',
              right: 5,
              top: 5,
              width: 30,
              height: 30,
              backgroundColor: '#000',
              borderRadius: 15,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0.6,
            }}>
            <Icon
              name="square-edit-outline"
              color="#FFF"
              type="material-community"
              size={16}
            />
          </View>
        </TouchableOpacity>
        <View
          style={{
            marginLeft: SIZES.spacing * 4,
            width: width - constWidth - 50,
          }}>
          <TouchableOpacity
            onPress={() => this.goTo('MyInfo', 'name')}
            style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text text={name} style={{fontSize: 20, marginRight: 5}} />
            <Icon
              name="square-edit-outline"
              color="gray"
              type="material-community"
              size={20}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => this.goTo('MyInfo', 'biography')}
            style={{flexDirection: 'row', alignItems: 'center', marginTop: 5}}>
            <Text
              text={biography}
              style={{fontSize: 12, color: 'white', marginRight: 5}}
            />
            <Icon
              name="square-edit-outline"
              color="gray"
              type="material-community"
              size={12}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  renderPosts = (posts) => {
    return (
      <>
        <FlatList
          data={posts}
          keyExtractor={(item) => item.uid}
          extraData={Store.posts}
          numColumns={2}
          renderItem={({item}) => (
            <View
              style={{width: width / 2, alignItems: 'center', marginTop: 10}}>
              <TouchableOpacity onPress={() => this.goTo('WatchVideo', item)}>
                <View
                  style={{
                    borderRadius: 16,
                    width: width / 2 - 10,
                    height: 1.5 * (width / 2 - 10),
                    backgroundColor: '#4d4d4d',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <MyImage
                    style={{
                      width: width / 2 - 10,
                      height: 1.5 * (width / 2 - 10),
                      borderRadius: 16,
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
                      width: width / 2 - 10,
                      height: 1.5 * (width / 2 - 10),
                      borderRadius: 16,
                      position: 'absolute',
                    }}
                  />
                  <View
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      paddingVertical: 5,
                      paddingHorizontal: 10,
                      width: width / 2 - 10,
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
      </>
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
            }>
            <View style={{width: width, alignItems: 'center'}}>
              {this.renderProfileTop(name, biography, photo)}
              <Button
                onPress={() => this.goTo('EditProfile')}
                text="Edit Profile"
                buttonStyle={{
                  backgroundColor: 'transparent',
                  borderColor: constants.BAR_COLOR,
                  borderWidth: 1,
                }}
                textStyle={{
                  fontSize: 12,
                  fontWeight: 'bold',
                }}
              />
            </View>
            {Store.user.type === 'user'
              ? this.renderUserSection(followingArray)
              : null}
            {Store.user.type === 'influencer' ? (
              <View>{daily.length !== 0 ? this.renderPosts(daily) : null}</View>
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

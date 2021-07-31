/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React, {Component} from 'react';
import {
  View,
  Dimensions,
  FlatList,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
  Image,
  Linking,
} from 'react-native';
import {observer} from 'mobx-react';
import LinearGradient from 'react-native-linear-gradient';
import {Icon, Header} from 'react-native-elements';
import {StackActions} from '@react-navigation/native';
import {Loading, Text, MyImage, Divider, VerifiedIcon} from '../../components';
import {constants} from '../../resources';
import {
  getFollowingLiveData,
  getFollowingUserPosts,
  getFollowingUserStories,
  getFollowList,
} from '../../services';
import Store from '../../store/Store';
import {COLORS, SIZES} from '../../resources/theme';
import Story from '../../components/ScreenComponents/HomeComponents/Story/Story';
import PostingCard from '../../components/ScreenComponents/HomeComponents/PostingCard/PostingCard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import database from '@react-native-firebase/database';
import axios from 'axios';

//const {width} = Dimensions.get('window');
const width = Dimensions.get('window')['width'] - constants.PAGE_LEFT_PADDING;

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      refreshing: false,
      liveArray: [],
      userPostsArray: [],
      userStoriesArray: [],
      myStoriesArray: [],
      adminStoriesArray: [],
    };

    this.mux_instance = axios.create({
      baseURL: constants.MUX_BASE_URL,
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        mp4_support: 'standard',
      },
      auth: {
        username: constants.MUX_USERNAME,
        password: constants.MUX_PASSWORD,
      },
    });
  }

  componentDidMount = async () => {
    await this.getData({
      loading: false,
    });
    this.setPushId();

    this.unsubscibe = this.props.navigation.addListener('focus', () => {
      this.getData();
    });
  };

  componentWillUnmount = () => {
    if (typeof this.unsubscibe !== 'undefined') {
      this.unsubscibe();
    }
  };

  getData = async (extra = {}) => {
    await getFollowList(Store.uid);

    return Promise.all([
      getFollowingLiveData(Store.uid, Store.followList),
      getFollowingUserPosts(Store.uid, Store.followList),
      getFollowingUserStories(Store.uid, Store.followList),
    ]).then((values) => {
      this.setState({
        ...extra,
        liveArray: values[0] ?? [],
        userPostsArray: values[1] ?? [],
        userStoriesArray: values[2].userStoriesArray ?? [],
        myStoriesArray: values[2].myStoriesArray ?? [],
      });
    });
  };

  onRefresh = async () => {
    this.setState({refreshing: true});

    await this.getData({
      refreshing: false,
    });
  };

  setPushId = async () => {
    try {
      const push = await AsyncStorage.getItem('pushInfo');

      if (push) {
        database().ref('users').child(Store.uid).child('token').set(push);
      }
    } catch (e) {
      // saving error
    }
  };

  goTo = async (route, info = null) => {
    if (route === 'UserProfile') {
      const replaceActions = StackActions.push(route, {user: info});
      return this.props.navigation.dispatch(replaceActions);
    } else if (route === 'WatchVideo') {
      if (info.type === 'live') {
        const livestreamResponse = await this.mux_instance.get(
          '/video/v1/live-streams/' + info.liveId,
        );
        const status = livestreamResponse.data.data.status;

        if (status === 'active') {
          const replaceActions = StackActions.push(route, {video: info});
          return this.props.navigation.dispatch(replaceActions);
        } else {
          this.onRefresh();
          return Alert.alert('Oops', 'This livestream is over.', [
            {text: 'Okay'},
          ]);
        }
      } else {
        const replaceActions = StackActions.push(route, {video: info});
        return this.props.navigation.dispatch(replaceActions);
      }
    } else if (route === 'WatchStory') {
      const userStories = [];

      for (let i = 0; i < this.state.userStoriesArray.length; i++) {
        const element = this.state.userStoriesArray[i];
        userStories.push(element.stories);
      }

      const replaceActions = StackActions.push(route, {
        stories: info,
        allStories:
          this.state.myStoriesArray.length === 0
            ? userStories
            : [this.state.myStoriesArray, ...userStories],
      });
      return this.props.navigation.dispatch(replaceActions);
    } else if (route === 'AddContent') {
      const replaceActions = StackActions.push(route, {startButtonIdx: 2});
      return this.props.navigation.dispatch(replaceActions);
    }
  };

  expireAlert = () => {
    Alert.alert('Oops', 'You must become a member to view the content.', [
      {
        text: 'Okay',
      },
    ]);
  };

  captionBar = (text = 'Now', live = false, user = null) => {
    return (
      <View
        style={{
          width: width,
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: SIZES.spacing * 3,
          marginTop: SIZES.spacing * 3,
        }}>
        {live ? (
          <View
            style={{
              paddingVertical: 5,
              paddingHorizontal: SIZES.spacing,
              borderRadius: 4,
              marginRight: SIZES.padding,
              backgroundColor: constants.RED,
            }}>
            <Text text="LIVE" style={{fontSize: 15}} />
          </View>
        ) : (
          <MyImage
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              marginRight: SIZES.spacing * 2,
            }}
            photo={user.photo}
          />
        )}
        <View style={{flexDirection: 'row'}}>
          <Text text={text} style={{fontSize: live ? 14 : 14}} />
          {user?.verified === true ? <VerifiedIcon size={15} /> : null}
        </View>
      </View>
    );
  };

  userPostsArrayCard = (influencer, index) => {
    return (
      <View
        style={{
          //borderBottomWidth: SIZES.separatorWidth,
          //borderBottomColor: constants.BAR_COLOR,
          paddingBottom: SIZES.spacing * 6,
        }}>
        <TouchableOpacity onPress={() => this.goTo('UserProfile', influencer)}>
          {this.captionBar(influencer.username, false, influencer, index)}
        </TouchableOpacity>
        <FlatList
          data={influencer.posts.slice(0, constants.NUM_POSTS_TO_VIEW_IN_HOME)}
          keyExtractor={(item) => item.uid}
          horizontal
          ListFooterComponentStyle={{
            alignItems: 'center',
            justifyContent: 'center',
          }}
          ListFooterComponent={() => {
            if (
              influencer.posts.length <= constants.NUM_POSTS_TO_VIEW_IN_HOME
            ) {
              return null;
            }
            return (
              <View>
                <TouchableOpacity
                  style={{alignItems: 'center'}} //marginHorizontal: 20}}
                  onPress={() => this.goTo('UserProfile', influencer)}>
                  <View
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 25,
                      backgroundColor: COLORS.primary,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <Icon
                      name="chevron-right"
                      color="#FFF"
                      type="material-community"
                    />
                  </View>
                  <Text
                    text="More"
                    style={{fontSize: 12, marginTop: SIZES.spacing * 2}}
                  />
                </TouchableOpacity>
              </View>
            );
          }}
          showsHorizontalScrollIndicator={false}
          renderItem={({item}) => (
            <PostingCard
              onPress={() => this.goTo('WatchVideo', item)}
              width={width}
              item={item}
            />
          )}
        />
      </View>
    );
  };

  expiredCard = (influencer) => {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={{position: 'absolute'}}
        onPress={() => this.expireAlert(influencer)}>
        <View
          style={{
            width: width / 2.5 - 10,
            height: 1.5 * (width / 2.5 - 10),
            borderRadius: 16,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <View
            style={{
              position: 'absolute',
              width: width / 2.5 - 10,
              height: 1.5 * (width / 2.5 - 10),
              borderRadius: 16,
              backgroundColor: 'black',
              opacity: 0.8,
            }}
          />
          <View
            style={{
              width: 80,
              height: 80,
              borderColor: '#FFF',
              borderWidth: 2,
              borderRadius: 40,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Icon
              name="lock-outline"
              color="#FFF"
              type="material-community"
              size={48}
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  renderStories = () => {
    return (
      <View
        style={{
          width: width,
          marginBottom: SIZES.spacing * 3,
        }}>
        <ScrollView
          horizontal
          style={{
            paddingHorizontal: SIZES.spacing,
          }}>
          {this.state.loading ? (
            Array.from({length: 3}).map((x) => <Story loading />)
          ) : this.state.myStoriesArray.length !== 0 ? (
            <Story
              onPress={() => this.goTo('WatchStory', this.state.myStoriesArray)}
              photo={Store.user.photo}
              text={'Your Story'}
            />
          ) : (
            <Story
              onPress={() => this.goTo('AddContent')}
              addStory
              text={'Add Story'}
            />
          )}
          <FlatList
            data={this.state.liveArray}
            keyExtractor={(item) => item.uid}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({item}) => (
              <Story
                onPress={() => this.goTo('WatchVideo', item)}
                photo={item.user.photo}
                text={item.user.username}
                showVerificationIcon={item.user.verified === true}
                isLive
              />
            )}
          />

          <FlatList
            data={this.state.userStoriesArray}
            keyExtractor={(item) => item.uid}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({item}) => (
              <Story
                onPress={() => this.goTo('WatchStory', item.stories)}
                photo={item.photo}
                text={item.username}
                showVerificationIcon={item.verified === true}
              />
            )}
          />
        </ScrollView>
      </View>
    );
  };

  // renderTestButton = () => {
  //   return (
  //     <Button
  //       text={'This is a test'}
  //       onPress={() => {
  //         this.props.navigation.dispatch(StackActions.push('TestPage'));
  //       }}
  //     />
  //   );
  // };

  render() {
    const {loading, liveArray, refreshing, userPostsArray} = this.state;

    return (
      <View
        style={{
          flex: 1,
          backgroundColor: constants.BACKGROUND_COLOR,
          justifyContent: 'space-around',
          paddingLeft: constants.PAGE_LEFT_PADDING,
        }}>
        <Header
          statusBarProps={{
            barStyle: 'light-content',
            backgroundColor: constants.BACKGROUND_COLOR,
          }}
          containerStyle={{
            borderBottomWidth: 0,
            backgroundColor: constants.BACKGROUND_COLOR,
            borderColor: constants.BACKGROUND_COLOR,
          }}
        />
        {this.renderStories()}
        <Divider />
        {/* {this.renderTestButton()} */}
        {loading ? (
          <Loading
            loadingStyle={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}
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
            showsVerticalScrollIndicator={false}>
            {userPostsArray.length !== 0 ? (
              <FlatList
                data={userPostsArray}
                keyExtractor={(item) => item.uid}
                renderItem={({item, index}) =>
                  this.userPostsArrayCard(item, index)
                }
              />
            ) : null}
          </ScrollView>
        )}
      </View>
    );
  }
}

export default observer(Home);

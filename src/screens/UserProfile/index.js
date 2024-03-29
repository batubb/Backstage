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
import {followerCount, setPosts} from '../../lib';
import {
  getUserPosts,
  checkSubscribtion,
  shareItem,
  report,
  getFollowerCount,
  unsubscribe,
} from '../../services';
import Store from '../../store/Store';
import {Icon} from 'react-native-elements';
import LinearGradient from 'react-native-linear-gradient';
import database from '@react-native-firebase/database';
import moment from 'moment';
import ProfileTop from '../../components/ScreenComponents/ProfileComponents/ProfileTop/ProfileTop';
import {SIZES} from '../../resources/theme';
import PostsCard from '../../components/ScreenComponents/ProfileComponents/PostsCard/PostsCard';

const {width} = Dimensions.get('window');

class UserProfile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      refreshing: false,
      subscribtion: false,
      user: this.props.route.params.user,
      posts: [],
      postsArray: [],
      daily: [],
      optionsVisible: false,
      followerNumber: 0,
    };

    this.list = [
      {title: 'Report', onPress: this.reportVideo},
      {title: 'Share', onPress: this.shareVideo},
    ];
  }

  componentDidMount = async () => {
    this.unsubscribe = this.props.navigation.addListener('focus', (e) => {
      this.checkInfluencerInfos();
    });
  };

  checkInfluencerInfos = async () => {
    const followerNumber = await getFollowerCount(this.state.user.uid);
    const subscribtion = await checkSubscribtion(
      Store.uid,
      this.state.user.uid,
    );
    const posts = await getUserPosts(this.state.user.uid);
    const {postsArray, daily} = setPosts(posts);

    this.setState({
      posts: posts,
      postsArray: postsArray,
      daily: daily,
      subscribtion,
      loading: false,
      followerNumber,
    });
  };

  componentWillUnmount = () => {
    this.unsubscribe();
  };

  goTo = (route, info = null) => {
    if (route === 'WatchVideo') {
      const replaceActions = StackActions.push(route, {video: info});
      return this.props.navigation.dispatch(replaceActions);
    } else if (route === 'Subscribe') {
      const replaceActions = StackActions.push(route, {
        influencer: info,
        posts: this.state.posts,
      });
      return this.props.navigation.dispatch(replaceActions);
    } else if (route === 'Chat') {
      const replaceActions = StackActions.push(route, {user: info});
      return this.props.navigation.dispatch(replaceActions);
    }
  };

  reportVideo = async () => {
    const result = await report(this.state.user, 'account');

    if (result) {
      Alert.alert(
        'Thank You',
        'You have reported this user. We will investigate this user.',
        [{text: 'Okay'}],
      );
    } else {
      Alert.alert('Oops', constants.ERROR_ALERT_MSG, [{text: 'Okay'}]);
    }

    this.setState({optionsVisible: false});
  };

  shareVideo = async () => {
    await shareItem(
      `Hey did you see this user on BackStage. ${this.state.user.name} is live!`,
    );
    this.setState({optionsVisible: false});
  };

  unsubscribeInf = () => {
    Alert.alert(
      'Are you sure?',
      `Do you want to unsubscribe ${this.state.user.name}.`,
      [
        {text: 'Yes', onPress: () => this.cancelSubscribtion()},
        {text: 'No', style: 'cancel'},
      ],
    );
  };

  cancelSubscribtion = async () => {
    this.setState({loading: true});
    const result = await unsubscribe(this.state.subscribtion.stripeId);

    if (result) {
      var updates = {};

      updates[
        `followList/${Store.user.uid}/${this.state.user.uid}/cancel`
      ] = true;
      await database().ref().update(updates);
      await this.checkInfluencerInfos();
      this.setState({loading: false});

      Alert.alert(
        'Success',
        `You have cancelled your subscribtion. Your subscription will continue until ${moment(
          this.state.subscribtion.endTimestamp,
        ).format('LL')}.`,
        [{text: 'Okay'}],
      );
    } else {
      Alert.alert('Oops', constants.ERROR_ALERT_MSG, [{text: 'Okay'}]);
    }
  };

  renderPosts = (posts) => {
    return (
      <PostsCard
        posts={posts}
        navigation={this.props.navigation}
        expired={!this.state.subscribtion.subscribtion}
        numCols={constants.NUM_POSTS_PER_ROW_PROFILE}
        extraData={Store.posts}
        onPress={(item) => this.goTo('WatchVideo', item)}
      />
    );
  };

  expiredCard = () => {
    return (
      <View
        style={{
          width: width / 2 - 10,
          height: 1.5 * (width / 2 - 10),
          borderRadius: 16,
          alignItems: 'center',
          justifyContent: 'center',
          position: 'absolute',
        }}>
        <View
          style={{
            position: 'absolute',
            width: width / 2 - 10,
            height: 1.5 * (width / 2 - 10),
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
    );
  };

  renderDataBar = (user) => {
    return (
      <View
        style={{
          flexDirection: 'row',
          width: width,
          paddingVertical: 10,
          marginBottom: 10,
        }}>
        <View style={{alignItems: 'center', width: width / 2}}>
          <Text
            text={followerCount(this.state.followerNumber)}
            style={{fontSize: 18}}
          />
          <Text text="Members" style={{fontSize: 16}} />
        </View>
        <TouchableOpacity onPress={() => this.goTo('Chat', this.state.user)}>
          <View style={{alignItems: 'center', width: width / 2}}>
            <Icon
              name="account-group-outline"
              color="#FFF"
              type="material-community"
            />
            <Text text="Rooms" style={{fontSize: 16}} />
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  renderEmptyPost = () => {
    return (
      <View
        style={{marginTop: 30, alignItems: 'center', justifyContent: 'center'}}>
        <View
          style={{
            width: 100,
            height: 100,
            borderColor: '#FFF',
            borderWidth: 2,
            borderRadius: 50,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Icon
            name="lock-open-outline"
            color="#FFF"
            type="material-community"
            size={64}
          />
        </View>
        <Button
          buttonStyle={{
            width: width - width / 4 - 50,
            borderColor: '#FFF',
            borderWidth: 2,
            backgroundColor: constants.BACKGROUND_COLOR,
            padding: 10,
            marginTop: 10,
            borderRadius: 8,
          }}
          textStyle={{fontSize: 16}}
          text="Unlock content now!"
          onPress={() => this.goTo('Subscribe', this.state.user)}
        />
      </View>
    );
  };

  render() {
    const {
      loading,
      refreshing,
      user,
      posts,
      postsArray,
      subscribtion,
      daily,
      optionsVisible,
    } = this.state;

    return (
      <View style={{flex: 1, backgroundColor: constants.BACKGROUND_COLOR}}>
        <Header
          leftButtonPress={() =>
            this.props.navigation.dispatch(StackActions.pop())
          }
          leftButtonIcon="chevron-left"
          title={user.username}
          rightButtonPress={() => this.setState({optionsVisible: true})}
          rightButtonIcon="dots-horizontal"
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
              <RefreshControl refreshing={refreshing} tintColor="white" />
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              width: constants.DEFAULT_PAGE_WIDTH,
              alignSelf: 'center',
              marginTop: SIZES.spacing * 5,
            }}>
            <ProfileTop
              name={user.name}
              photo={user.photo}
              biography={user.biography}
              subscribeButtonVisible={user.uid !== Store.user.uid}
              subscribtion={subscribtion}
              user={user}
              onSubscribePress={() =>
                subscribtion.subscribtion
                  ? this.unsubscribeInf()
                  : this.goTo('Subscribe', this.state.user)
              }
              views={
                !this.state.user.cumulativeViewsUser
                  ? 0
                  : this.state.user.cumulativeViewsUser
              }
              followerNumber={this.state.followerNumber}
              onChatPress={() => this.goTo('Chat', this.state.user)}
              editProfileVisible={user.uid === Store.user.uid}
              navigation={this.props.navigation}
            />
            <View>{daily.length !== 0 ? this.renderPosts(daily) : null}</View>
          </ScrollView>
        )}
        <Options
          list={this.list}
          visible={optionsVisible}
          cancelPress={() => this.setState({optionsVisible: false})}
        />
      </View>
    );
  }
}

export default observer(UserProfile);

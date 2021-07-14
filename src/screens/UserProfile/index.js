/* eslint-disable react/no-did-mount-set-state */
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
  VerifiedIcon,
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
  getSubscriberCount,
} from '../../services';
import Store from '../../store/Store';
import {Icon} from 'react-native-elements';
import LinearGradient from 'react-native-linear-gradient';
import database from '@react-native-firebase/database';
import moment from 'moment';
import ProfileTop from '../../components/ScreenComponents/ProfileComponents/ProfileTop/ProfileTop';
import SubscribeButton from '../../components/ScreenComponents/ProfileComponents/ProfileTop/SubscribeButton';
import {COLORS, SIZES} from '../../resources/theme';
import PostsCard from '../../components/ScreenComponents/ProfileComponents/PostsCard/PostsCard';
import sleep from '../../lib/sleep';
import RNIap from 'react-native-iap';
import SlidingUpPanel from 'rn-sliding-up-panel';

const {width, height} = Dimensions.get('window');
const SCREEN_DIMENSIONS = Dimensions.get('window');
var BOTTOM_PADDING = height >= 812 ? 44 : 20;
BOTTOM_PADDING = Platform.OS === 'android' ? 0 : BOTTOM_PADDING;

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
      subscriberNumber: 0,
      products: [],
    };

    this.list = [
      {title: 'Report', onPress: this.reportVideo},
      {title: 'Block', onPress: this.blockUser},
    ];
  }

  componentDidMount = async () => {
    this.setState({loading: true});
    this.unsubscribe = this.props.navigation.addListener('focus', (e) => {
      this.checkInfluencerInfos();
    });
    let productId = [];
    productId.push(this.state.user.appStoreProductId);
    const productsRes = await RNIap.getSubscriptions(productId);

    console.log('got products ', productsRes);
    if (!productsRes) {
      this.setState({products: []});
    } else {
      this.setState({products: productsRes});
    }
    const subscription = await checkSubscribtion(
      Store.uid,
      this.state.user.uid,
    );
    console.log('subscription is ', subscription);
    console.log('subscription is2 ', subscription.subscribtion);
    if (!subscription.subscribtion) {
      this.bottomSheetRef?.show();
    }
    this.setState({loading: false});
  };

  checkInfluencerInfos = async () => {
    const followerNumber = await getFollowerCount(this.state.user.uid);
    const subscriberNumber = await getSubscriberCount(this.state.user.uid);
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
      subscriberNumber,
    });
  };

  componentWillUnmount = () => {
    this.unsubscribe();
    this.bottomSheetRef?.hide();
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
        'You have reported this user. We will investigate your request.',
        [{text: 'Okay'}],
      );
    } else {
      Alert.alert('Oops', 'We are sorry for this. Please try again later.', [
        {text: 'Okay'},
      ]);
    }

    this.setState({optionsVisible: false});
  };

  blockUser = async () => {
    Alert.alert(
      'Success',
      'You have blocked this user. Now this user can not see your profile.',
      [{text: 'Okay'}],
    );

    this.setState({optionsVisible: false});
  };

  requestRNISubscription = async () => {
    try {
      await RNIap.requestSubscription(this.state.products[0].productId);
      this.bottomSheetRef?.hide();
      this.setState({loading: true});
      await sleep(5000);
      console.log('after sub');
      console.log('got subscription');
      const subscribtion = await checkSubscribtion(
        Store.uid,
        this.state.user.uid,
      );
      console.log('got subscription', subscribtion);

      this.setState({subscribtion});
      console.log('after sub2');
    } catch (error) {
      console.log('Error requesting subscription ', error);
    }
    this.setState({loading: false});
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

  renderSubscriptionPanel = () => {
    if (this.state.products.length === 0) {
      return null;
    }
    return (
      <SlidingUpPanel
        ref={(ref) => (this.bottomSheetRef = ref)}
        height={SCREEN_DIMENSIONS.height * 0.8}
        snappingPoints={[SCREEN_DIMENSIONS.height * 0.8, 0]}
        avoidKeyboard={true}
        allowDragging={true}
        containerStyle={{
          flex: 1,
          top: SCREEN_DIMENSIONS.height * 1.2,
          width,
          position: 'absolute',
          left: 0,
        }}
        friction={0.7}
        backdropOpacity={0.95}
        showBackdrop={true}
        onBottomReached={() => this.bottomSheetRef.hide()}>
        <View
          style={{
            flex: 1,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            backgroundColor: COLORS.systemFill,
            flexDirection: 'column',
            paddingHorizontal: 20,
            paddingVertical: 10,
            marginTop: BOTTOM_PADDING,
            justifyContent: 'center',
            alignItems: 'center',
            paddingBotom: SIZES.spacing * 8,
          }}>
          <MyImage
            style={{
              marginTop: SIZES.padding * 4,
              width: constants.PROFILE_PIC_SIZE,
              height: constants.PROFILE_PIC_SIZE,
              borderRadius: constants.PROFILE_PIC_SIZE / 2,
            }}
            photo={this.state.user.photo}
          />
          <TouchableOpacity
            style={{
              position: 'absolute',
              top: SIZES.padding * 2,
              right: SIZES.padding * 2,
            }}
            onPress={() => this.bottomSheetRef.hide()}>
            <Icon name="close" color="#FFF" type="material-community" />
          </TouchableOpacity>
          <View
            style={{
              flex: 1,
              marginTop: SIZES.padding * 2,
              justifyContent: 'flex-start',
              alignItems: 'center',
            }}>
            <View style={{flexDirection: 'row'}}>
              <Text
                text={this.state.user.username}
                numberOfLines={1}
                style={{fontSize: 20}}
              />
              {this.state.user.verified === true && (
                <VerifiedIcon size={18} style={{top: 4}} />
              )}
            </View>
            <View style={{marginTop: SIZES.padding * 4}}>
              <Text
                text={`$${this.state.products[0].price}`}
                style={{
                  fontWeight: 'bold',
                  fontSize: 16,
                  textAlign: 'center',
                  color: COLORS.white,
                }}
              />
              <Text
                text={`$${parseFloat(this.state.user.price).toFixed(2)}`}
                style={{
                  fontWeight: 'bold',
                  fontSize: 32,
                  textAlign: 'center',
                  color: COLORS.white,
                }}
              />
              <Text
                text={'per month'}
                style={{fontSize: 12, color: 'gray', textAlign: 'center'}}
              />
              <Button
                text={'Subscribe'}
                buttonStyle={{
                  backgroundColor: COLORS.primary,
                  borderRadius: SIZES.radius,
                  paddingVertical: SIZES.padding * 1.5,
                  paddingHorizontal: SIZES.padding * 4,
                  marginTop: SIZES.padding * 2,
                  width: 250,
                  alignSelf: 'center',
                }}
                textStyle={{color: COLORS.secondary, fontSize: 16}}
                onPress={() => this.requestRNISubscription()}
              />
              <Text
                text={`Subscribing to this channel will give you access to this creator's exclusive content and fanroom on Backstage for the subscription period. Content can be in the form of livestreams, videos, or stories. Subscriptions will auto renew, and can be cancelled anytime on via Apple App Store.`}
                style={{
                  marginTop: SIZES.padding * 2,
                  marginBottom: SIZES.padding * 4,
                  fontWeight: 'bold',
                  fontSize: 12,
                  textAlign: 'center',
                  color: COLORS.darkgray,
                }}
              />
            </View>
          </View>
        </View>
      </SlidingUpPanel>
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
          showVerificationIcon={user.verified === true}
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
                subscribtion.subscribtion ? null : this.bottomSheetRef?.show()
              }
              views={
                !this.state.user.cumulativeViewsUser
                  ? 0
                  : this.state.user.cumulativeViewsUser
              }
              followerNumber={this.state.followerNumber}
              subscriberNumber={this.state.subscriberNumber}
              showSubscriberNumber={Store.user.uid === this.state.user.uid}
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
        {this.renderSubscriptionPanel()}
      </View>
    );
  }
}

export default observer(UserProfile);

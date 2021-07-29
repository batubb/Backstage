/* eslint-disable react/no-did-mount-set-state */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React, {Component, createRef} from 'react';
import {
  View,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
  Platform,
} from 'react-native';
import {observer} from 'mobx-react';
import {StackActions} from '@react-navigation/native';
import {
  Loading,
  Header,
  Text,
  Button,
  Options,
  MyModal,
} from '../../components';
import {constants} from '../../resources';
import {setPosts} from '../../lib';
import {
  getUserPosts,
  checkSubscribtion,
  report,
  getFollowerCount,
  getSubscriberCount,
  sendDataAnalytics,
  shareItem,
} from '../../services';
import Store from '../../store/Store';
import {Icon} from 'react-native-elements';
import ProfileTop from '../../components/ScreenComponents/ProfileComponents/ProfileTop/ProfileTop';
import {COLORS, SIZES} from '../../resources/theme';
import PostsCard from '../../components/ScreenComponents/ProfileComponents/PostsCard/PostsCard';
import sleep from '../../lib/sleep';
import RNIap from 'react-native-iap';
import SlidingUpPanel from 'rn-sliding-up-panel';
import {isAdmin} from '../../lib';

const {width, height} = Dimensions.get('window');
const SCREEN_DIMENSIONS = Dimensions.get('window');
var BOTTOM_PADDING = height >= 812 ? 44 : 20;
BOTTOM_PADDING = Platform.OS === 'android' ? 0 : BOTTOM_PADDING;

const subscribeBottomSheetRef = createRef();

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
      purchaseProcessing: false,
    };

    this.list = [
      {title: 'Share this Profile', onPress: this.shareUser},
      {title: 'Report', onPress: this.reportVideo},
      {title: 'Block', onPress: this.blockUser, danger: true},
    ];
  }

  componentDidMount = async () => {
    this.setState({loading: true, purchaseProcessing: false});
    this.unsubscribe = this.props.navigation.addListener('focus', (e) => {
      this.checkInfluencerInfos();
    });
    this.unsubscribeBottomSheet = this.props.navigation.addListener(
      'blur',
      (e) => {
        subscribeBottomSheetRef.current?.hide();
      },
    );
    if (isAdmin(Store.user) || isAdmin(this.state.user)) {
      this.setState({loading: false, subscribtion: {subscribtion: true}});
      return;
    }
    let productId = [];
    productId.push(this.state.user.appStoreProductId);
    const productsRes = await RNIap.getSubscriptions(productId);

    console.log('got products ', productsRes);
    if (!productsRes) {
      this.setState({products: []});
    } else {
      this.setState({products: productsRes});
    }
    const subscribtion = await checkSubscribtion(
      Store.uid,
      this.state.user.uid,
    );
    if (!subscribtion.subscribtion) {
      subscribeBottomSheetRef.current?.show();
    }
    this.setState({loading: false, subscribtion});
  };

  checkInfluencerInfos = async () => {
    const followerNumber = await getFollowerCount(this.state.user.uid);
    const subscriberNumber =
      this.state.user.uid === Store.uid || isAdmin(Store.user)
        ? await getSubscriberCount(this.state.user.uid)
        : 0;
    const subscribtion =
      isAdmin(this.state.user) || isAdmin(Store.user)
        ? {subscribtion: true}
        : await checkSubscribtion(Store.uid, this.state.user.uid);
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
    if (typeof this.unsubscribe !== 'undefined') {
      this.unsubscribe();
    }
    if (typeof this.unsubscribeBottomSheet !== 'undefined') {
      this.unsubscribeBottomSheet();
    }
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
      if (typeof this.props.route.params?.onGoToChatPressed !== 'undefined') {
        this.props.route.params?.onGoToChatPressed();
        return;
      }
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

  shareUser = async () => {
    this.setState({optionsVisible: false});
    await shareItem(
      constants.APP_WEBSITE + '/' + this.state.user.username,
      'share-profile-link',
    );
  };

  requestRNISubscription = async () => {
    this.setState({purchaseProcessing: true});
    try {
      await RNIap.requestSubscription(this.state.products[0].productId);
      subscribeBottomSheetRef.current?.hide();
      this.setState({loading: true, purchaseProcessing: false});
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
    this.setState({loading: false, purchaseProcessing: false});
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
    const {products, subscribtion, user} = this.state;
    if (
      products.length === 0 ||
      subscribtion.subscribtion === true
    ) {
      return null;
    }
    return (
      <SlidingUpPanel
        ref={subscribeBottomSheetRef}
        height={SCREEN_DIMENSIONS.height}
        snappingPoints={[0]}
        avoidKeyboard={true}
        allowDragging={true}
        friction={0.7}
        backdropOpacity={0.85}
        showBackdrop={true}
        onBottomReached={() => subscribeBottomSheetRef.current?.hide()}>
        <View
          style={{
            width,
            flex: 1,
            position: 'absolute',
            left: 0,
            bottom: 0,
          }}>
          <View
            style={{
              flex: 1,
              paddingHorizontal: SIZES.padding,
              borderTopLeftRadius: SIZES.radius,
              borderTopRightRadius: SIZES.radius,
              backgroundColor: COLORS.systemFill,
              flexDirection: 'column',
              justifyContent: 'flex-start',
              alignItems: 'center',
              paddingVertical: SIZES.padding * 5,
            }}>
            <Text
              text={`${products[0].currency} ${products[0].price}`}
              style={{
                marginTop: SCREEN_DIMENSIONS.height * 0.02,
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
                marginTop: SIZES.padding * 2,
                width:
                  SCREEN_DIMENSIONS.height * 0.25 < 160
                    ? 120
                    : SCREEN_DIMENSIONS.height * 0.25,
                alignSelf: 'center',
              }}
              textStyle={{color: COLORS.secondary, fontSize: 16}}
              onPress={() => this.requestRNISubscription()}
            />
            <Text
              text={`Subscribing to ${user.username} will give you access to this creator's exclusive content and fanroom on Backstage for the subscription period. Content can be in the form of livestreams, videos, or stories. Subscriptions will auto renew, and can be cancelled anytime via Apple App Store.`}
              style={{
                marginTop: SIZES.padding + SCREEN_DIMENSIONS.height * 0.03,
                fontWeight: 'bold',
                fontSize: 12,
                textAlign: 'center',
                color: COLORS.darkgray,
              }}
            />
          </View>
          <TouchableOpacity
            style={{
              position: 'absolute',
              top: SIZES.padding * 2,
              right: SIZES.padding * 2,
            }}
            onPress={() => subscribeBottomSheetRef.current?.hide()}>
            <Icon name="close" color="#FFF" type="material-community" />
          </TouchableOpacity>
        </View>
      </SlidingUpPanel>
    );
  };

  render() {
    const {
      loading,
      refreshing,
      user,
      subscribtion,
      daily,
      optionsVisible,
      purchaseProcessing,
    } = this.state;

    let headerExtraProps = {};
    if (Store.uid !== user.uid) {
      headerExtraProps = {
        rightButtonPress: () => this.setState({optionsVisible: true}),
        rightButtonIcon: 'dots-horizontal',
      };
    }

    return (
      <View style={{flex: 1, backgroundColor: constants.BACKGROUND_COLOR}}>
        <Header
          leftButtonPress={() =>
            this.props.navigation.dispatch(StackActions.pop())
          }
          leftButtonIcon="chevron-left"
          title={user.username}
          showVerificationIcon={user.verified === true}
          {...headerExtraProps}
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
              paddingBottom: SIZES.spacing * 5,
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
                  ? null
                  : subscribeBottomSheetRef.current?.show()
              }
              views={
                !this.state.user.cumulativeViewsUser
                  ? 0
                  : this.state.user.cumulativeViewsUser
              }
              followerNumber={this.state.followerNumber}
              subscriberNumber={this.state.subscriberNumber}
              showSubscriberNumber={
                (Store.uid === user.uid && !isAdmin(user)) ||
                (isAdmin(Store.user) && Store.uid !== user.uid)
              }
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
        {purchaseProcessing ? <MyModal loading /> : null}
      </View>
    );
  }
}

export default observer(UserProfile);

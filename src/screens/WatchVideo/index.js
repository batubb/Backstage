/* eslint-disable radix */
/* eslint-disable react/no-did-mount-set-state */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React, {Component} from 'react';
import {
  View,
  Dimensions,
  TouchableOpacity,
  Alert,
  TextInput,
  Platform,
  Keyboard,
  FlatList,
  TouchableWithoutFeedback,
  Image,
} from 'react-native';
import {observer} from 'mobx-react';
import {Slider, Icon} from 'react-native-elements';
import Video from 'react-native-video';
import {StackActions} from '@react-navigation/native';
import {VerifiedIcon, Header, Options, Text} from '../../components';
import {constants} from '../../resources';
import {
  checkSubscribtion,
  checkUserInfo,
  setVideoView,
  getVideoInfo,
  shareItem,
  report,
  sendComment,
  likeVideo,
} from '../../services';
import Store from '../../store/Store';
import {followerCount, isAdmin} from '../../lib';
import {SafeAreaView} from 'react-native';
import {KeyboardAvoidingView} from 'react-native';
import database from '@react-native-firebase/database';
import WatchVideoIcon from '../../components/ScreenComponents/WatchVideoComponents/WatchVideoIcon/WatchVideoIcon';
import {COLORS, SIZES} from '../../resources/theme';
import {getBottomSpace} from '../../lib/iPhoneXHelper';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-community/masked-view';
import Orientation from 'react-native-orientation-locker';

const RNHapticFeedbackOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

const BOTTOM_PADDING = Dimensions.get('window') >= 812 ? 40 : 20;

// TODO Canlı yayın izleme eklenecek.

class WatchVideo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      refreshing: false,
      video: this.props.route.params.video,
      paused: true,
      videoLoading: true,
      isCommentModalVisible: false,
      dk: '00',
      sn: '00',
      videoInfo: {},
      comments: [],
      influencer: this.props.route.params.video.user,
      optionsVisible: false,
      comment: '',
      keyboard: false,
      finished: false,
      showMore: false,
      controlsVisible: true,
      months: constants.MONTHS,
      fullScreen: false,
      isLiked: false,
      isBlurComments: true,
      subscribtion: {subscribtion: false},
      subscribeAlert: false,
      currentOrientation: 0, // 0 = PORTRAIT, 1 = LANDSPACE-LEFT, 2 = LANDSPACE-RIGHT
      WINDOW_DIMENSIONS: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
      },
      SCREEN_DIMENSIONS: {
        width: Dimensions.get('screen').width,
        height: Dimensions.get('window').height,
      },
    };

    Dimensions.addEventListener('change', (e) => {
      this.setState({
        WINDOW_DIMENSIONS: {
          width: e.window.width,
          height: e.window.height,
        },
        SCREEN_DIMENSIONS: {
          width: e.screen.width,
          height: e.screen.height,
        },
      });
    });

    this.list = [
      {title: 'Share', onPress: this.shareVideo},
      {title: 'Report', onPress: this.reportVideo},
    ];

    if (Store.user.uid === this.props.route.params.video.user.uid) {
      this.list = [
        ...this.list,
        {title: 'Delete', danger: true, onPress: this.deleteVideo},
      ];
    }
  }

  componentDidMount = async () => {
    Keyboard.addListener('keyboardDidShow', () => {
      this.setState({keyboard: true});
    });

    Keyboard.addListener('keyboardDidHide', () => {
      this.setState({keyboard: false});
    });

    const subscribtion =
      isAdmin(this.state.video.user) || isAdmin(Store.user)
        ? {subscribtion: true}
        : await checkSubscribtion(Store.uid, this.state.video.user.uid);

    Orientation.unlockAllOrientations();
    this._onOrientationDidChange(); // get initial device orientation
    Orientation.addDeviceOrientationListener(this._onOrientationDidChange);

    this._unsubscribe = this.props.navigation.addListener('focus', () => {
      Orientation.unlockAllOrientations();
    });

    const influencer = await checkUserInfo(this.state.video.user.uid);

    if (this.state.video.type === 'video') {
      const video = await getVideoInfo(this.state.video.uid, influencer);

      if (
        !isAdmin(Store.user) &&
        (subscribtion.subscribtion === false ||
          (subscribtion.subscribtion === true && subscribtion.test !== true))
      ) {
        setVideoView(Store.user.uid, this.state.video);
      }

      const isLiked = subscribtion.subscribtion
        ? Object.values(Object.assign({}, video.likes)).some(
            (like) => like.uid === Store.user.uid,
          )
        : false;

      this.setState({
        video,
        isLiked,
      });
    } else if (this.state.video.type === 'live') {
      if (subscribtion.subscribtion) {
        const video = await getVideoInfo(
          this.state.video.uid,
          influencer,
          'live',
        );
        this.setState({video});

        database()
          .ref('comments')
          .child(this.state.video.uid)
          .orderByChild('timestamp')
          .on('value', (snap) => {
            var comments = [];

            snap.forEach((element) => {
              comments.push(element.val());
            });

            comments.reverse();
            comments = comments.slice(0, 25);
            this.setState({comments});
          });
      } else {
        Alert.alert(
          'Oops',
          'You must become a member to watch the livestream.',
          [
            {
              text: 'Okay',
              onPress: () => this.props.navigation.dispatch(StackActions.pop()),
            },
          ],
        );
      }
    }
    this.setState({
      loading: false,
      paused: false,
      influencer,
      subscribtion,
    });
  };

  componentWillUnmount = () => {
    if (typeof this._unsubscribe === 'function') {
      this._unsubscribe();
    }
    Orientation.removeDeviceOrientationListener(this._onOrientationDidChange);
    Orientation.lockToPortrait();

    Keyboard.removeListener('keyboardDidShow', () => {
      this.setState({keyboard: true});
    });

    Keyboard.removeListener('keyboardDidHide', () => {
      this.setState({keyboard: false});
    });

    database().ref('comments').child(this.state.video.uid).off();
  };

  _onOrientationDidChange = () => {
    Orientation.getDeviceOrientation((currentOrientation) => {
      console.log(currentOrientation);
      switch (currentOrientation) {
        case 'LANDSCAPE-LEFT':
          this.setState({currentOrientation: 1, optionsVisible: false});
          break;
        case 'LANDSCAPE-RIGHT':
          this.setState({currentOrientation: 2, optionsVisible: false});
          break;
        default:
          this.setState({currentOrientation: 0, optionsVisible: false});
          break;
      }
      this.forceUpdate();
    });
  };

  reportVideo = async () => {
    const result = await report(this.state.video);

    if (result) {
      Alert.alert(
        'Thank You',
        'You have reported this video. We will investigate your request.',
        [{text: 'Okay'}],
      );
    } else {
      Alert.alert('Oops', constants.ERROR_ALERT_MSG, [{text: 'Okay'}]);
    }

    this.setState({optionsVisible: false});
  };

  deleteVideo = async () => {
    // TODO Video editleme
    await database()
      .ref('posts')
      .child(Store.user.uid)
      .child(this.state.video.uid)
      .set(null);
    this.setState({optionsVisible: false});
    this.props.navigation.dispatch(StackActions.pop());
  };

  shareVideo = async () => {
    this.setState({optionsVisible: false});
    await shareItem(
      constants.APP_WEBSITE +
        '/' +
        this.state.influencer.username +
        '/posts/' +
        this.state.video.uid,
      'share-video-link',
    );
  };

  goTo = (route, info = null) => {
    this.setState({paused: true});

    if (route === 'Comments') {
      if (!this.state.subscribtion.subscribtion) {
        Alert.alert('Oops', 'You must become a member to view the content.', [
          {
            text: 'Okay',
            style: 'cancel',
          },
        ]);
        return;
      }
      Orientation.lockToPortrait();

      const replaceActions = StackActions.push(route, {
        video: info,
        comments: this.state.comments,
      });
      return this.props.navigation.dispatch(replaceActions);
    }
  };

  setTime = (data) => {
    if (!this.checkSubscribeAlert(data.currentTime)) {
      return;
    }
    const minute = parseInt(data.currentTime / 60);
    const second = parseInt(data.currentTime % 60);

    const dk = minute < 10 ? `0${minute}` : minute.toString();
    const sn = second < 10 ? `0${second}` : second.toString();

    this.setState({videoInfo: data, dk, sn});
  };

  checkSubscribeAlert = (seconds) => {
    if (
      !this.state.subscribtion.subscribtion &&
      !this.state.subscribeAlert &&
      seconds >= 5
    ) {
      this.setState({paused: true, subscribeAlert: true});
      Alert.alert(
        'Members-only',
        'To watch the rest of the video, you must become a member.',
        [
          {
            text: 'Okay',
            onPress: () => this.props.navigation.dispatch(StackActions.pop()),
          },
        ],
      );
      return false;
    }
    return !this.state.subscribeAlert;
  };

  seek = (time) => {
    if (this.checkSubscribeAlert(time)) {
      this.player.seek(time, 1000);
    }
  };

  sendComment = async () => {
    await sendComment(
      Store.user,
      this.state.video,
      this.state.comment,
      this.state.reply,
    );
    this.setState({comment: ''});
  };

  likeVideoPressed = () => {
    ReactNativeHapticFeedback.trigger('impactLight', RNHapticFeedbackOptions);

    if (!this.state.subscribtion.subscribtion) {
      Alert.alert('Oops', 'You must become a member to like the content.', [
        {
          text: 'Okay',
          style: 'cancel',
        },
      ]);
      return;
    }
    this.setState({isLiked: !this.state.isLiked});

    return likeVideo(
      Store.user,
      this.state.video,
      this.state.isLiked,
    ).catch(() => this.setState({isLiked: !this.state.isLiked}));
  };

  renderVideoPlayer = (video, paused, videoInfo, dk, sn) => {
    const {
      months,
      controlsVisible,
      fullScreen,
      subscribeAlert,
      currentOrientation,
      WINDOW_DIMENSIONS,
      SCREEN_DIMENSIONS,
    } = this.state;
    const date = new Date(video.timestamp);
    const month = months[date.getMonth()].slice(0, 3);
    const day = date.getDate();
    const year = date.getFullYear();

    return (
      <TouchableWithoutFeedback
        onPress={() => this.setState({controlsVisible: !controlsVisible})}>
        <View
          style={{flex: 1, position: 'absolute'}}
          onPress={() => {
            console.log('view pressed');
          }}>
          <Video
            source={{uri: video.url}}
            ref={(ref) => {
              this.player = ref;
            }}
            onLoadStart={() => this.setState({videoLoading: true})}
            onLoad={() => this.setState({videoLoading: false, paused: false})}
            onProgress={(data) => this.setTime(data)}
            onEnd={() => this.setState({paused: true, controlsVisible: true})}
            fullScreen={fullScreen}
            resizeMode={fullScreen ? 'cover' : 'contain'}
            style={[
              fullScreen
                ? {
                    flex: 1,
                    width: SCREEN_DIMENSIONS.width,
                    height: SCREEN_DIMENSIONS.height,
                  }
                : {
                    flex: 1,
                    width: WINDOW_DIMENSIONS.width,
                    height: WINDOW_DIMENSIONS.height,
                  },
            ]}
            paused={paused || subscribeAlert}
            repeat
          />
          {this.state.video.isLive === 0 ? (
            <SafeAreaView
              style={{
                position: 'absolute',
                top: -SIZES.spacing - getBottomSpace() * 0.15,
                right: SIZES.spacing,
                display: 'flex',
                justifyContent: 'flex-start',
                alignItems: 'flex-end',
                alignSelf: 'center',
              }}>
              <Image
                source={require('../../images/live_animation_gray.gif')}
                style={{resizeMode: 'contain', width: 70, height: 100}}
              />
            </SafeAreaView>
          ) : null}
          {controlsVisible ? (
            <View
              style={{
                position: 'absolute',
                width: '90%',
                height:
                  WINDOW_DIMENSIONS.height -
                  constants.KEYBOARD_VERTICAL_OFFSET *
                    (currentOrientation !== 0
                      ? Platform.OS === 'ios'
                        ? 0.5
                        : 2.5
                      : 1),
                display: 'flex',
                justifyContent: 'flex-end',
                alignSelf: 'center',
                marginTop: Platform.OS === 'ios' ? 0 : '8%',
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: SIZES.spacing * 10,
                }}>
                <View style={{width: '70%', marginTop: 'auto'}}>
                  <Text
                    text={video.title}
                    numberOfLines={this.state.showMore ? 3 : 1}
                    onPress={() =>
                      this.setState({showMore: !this.state.showMore})
                    }
                    style={{
                      fontSize: this.state.showMore ? SIZES.h4 : SIZES.h3,
                    }}
                  />
                  <Text
                    text={`${month} ${day}${
                      new Date().getFullYear() === year ? '' : ',' + year
                    }`}
                    numberOfLines={1}
                    style={{
                      fontSize: SIZES.body5,
                      color: COLORS.white,
                      opacity: 0.5,
                      paddingTop: 3,
                    }}
                  />
                </View>
                <View
                  style={{
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                  <View
                    style={{
                      alignItems: 'center',
                      paddingBottom: SIZES.padding * 2,
                    }}>
                    <WatchVideoIcon name="play-outline" type="ionicon" />
                    <Text
                      text={`${followerCount(video.cumulativeViews)}`}
                      style={{fontSize: 12}}
                    />
                  </View>
                  <TouchableOpacity
                    onPress={() => this.likeVideoPressed()}
                    style={{
                      alignItems: 'center',
                      paddingBottom: SIZES.padding * 2,
                    }}>
                    <WatchVideoIcon
                      name={
                        this.state.isLiked ? 'ios-heart' : 'ios-heart-outline'
                      }
                      type="ionicon"
                      color={this.state.isLiked ? COLORS.primary : COLORS.white}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => this.goTo('Comments', video)}>
                    <View
                      style={{
                        alignItems: 'center',
                        paddingBottom: SIZES.padding * 2,
                      }}>
                      <WatchVideoIcon
                        name="chatbubble-outline"
                        type="ionicon"
                        size={28}
                      />
                      {/* <Text
                        text={`${followerCount(video.comments)}`}
                        style={{fontSize: 12}}
                      /> */}
                    </View>
                  </TouchableOpacity>
                  <WatchVideoIcon
                    name="dots-horizontal"
                    type="material-community"
                    onPress={() => this.setState({optionsVisible: true})}
                    style={{
                      paddingHorizontal: SIZES.spacing,
                      paddingVertical: SIZES.spacing,
                    }}
                    size={20}
                  />
                </View>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: getBottomSpace() / 2,
                }}>
                <TouchableOpacity
                  onPress={() => this.setState({paused: !paused})}
                  style={{
                    paddingRight: SIZES.padding,
                  }}>
                  <Icon
                    name={paused ? 'play' : 'pause'}
                    color="#FFF"
                    type="material-community"
                    size={28}
                  />
                </TouchableOpacity>
                <Slider
                  style={{
                    width:
                      WINDOW_DIMENSIONS.width * 0.75 -
                      (currentOrientation !== 0
                        ? 0
                        : SIZES.padding * (Platform.OS === 'android' ? 5 : 6)),
                  }}
                  value={videoInfo.currentTime}
                  thumbTintColor="#fff"
                  minimumTrackTintColor="#fff"
                  onSlidingStart={() => this.setState({paused: true})}
                  onSlidingComplete={() => this.setState({paused: false})}
                  maximumTrackTintColor="lightgray"
                  step={2}
                  thumbStyle={{height: 10, width: 10, backgroundColor: 'white'}}
                  animationType="timing"
                  animateTransitions={true}
                  onValueChange={(value) => this.seek(value)}
                  maximumValue={videoInfo.seekableDuration}
                />
                <View>
                  <Text
                    style={{fontSize: 12, paddingLeft: SIZES.padding}}
                    text={`${dk}:${sn}`}
                  />
                </View>
                {Platform.OS === 'ios' ? (
                  <TouchableOpacity
                    onPress={() => this.setState({fullScreen: !fullScreen})}
                    style={{bottom: 1, paddingLeft: SIZES.spacing}}>
                    <Icon
                      name={!fullScreen ? 'fullscreen' : 'fullscreen-exit'}
                      color="#FFF"
                      type="material-community"
                      size={28}
                    />
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          ) : Platform.OS === 'ios' ? (
            <TouchableOpacity
              onPress={() =>
                this.setState({fullScreen: !this.state.fullScreen})
              }
              style={{
                position: 'absolute',
                right:
                  SIZES.padding * 2 +
                  (currentOrientation !== 0 ? getBottomSpace() : 0),
                marginTop:
                  WINDOW_DIMENSIONS.height -
                  constants.KEYBOARD_VERTICAL_OFFSET *
                    (currentOrientation !== 0 ? 2 : 2.5),
              }}>
              <Icon
                name={!fullScreen ? 'fullscreen' : 'fullscreen-exit'}
                color="#FFF"
                type="material-community"
                size={28}
              />
            </TouchableOpacity>
          ) : null}
        </View>
      </TouchableWithoutFeedback>
    );
  };

  renderVideoPlayer2 = (video, paused, videoInfo, dk, sn) => {
    return (
      <View style={{flex: 1, position: 'absolute'}}>
        <Video
          source={{uri: video.url}}
          ref={(ref) => {
            this.player = ref;
          }}
          onLoadStart={() => this.setState({videoLoading: true})}
          onLoad={() => this.setState({videoLoading: false})}
          onProgress={(data) => this.setTime(data)}
          onEnd={() => this.setState({paused: true})}
          style={{
            flex: 1,
            width: this.state.WINDOW_DIMENSIONS.width,
            height: this.state.WINDOW_DIMENSIONS.height,
          }}
          paused={paused}
          repeat
          poster={video.photo}
          controls
        />
      </View>
    );
  };

  renderLivePlayer = (video) => {
    return (
      <View style={{flex: 1, position: 'absolute'}}>
        {this.state.finished ? (
          <SafeAreaView
            style={{
              flex: 1,
              width: this.state.WINDOW_DIMENSIONS.width,
              height: this.state.WINDOW_DIMENSIONS.height,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text
              style={{fontSize: 12}}
              text="Live broadcast is over. See you soon."
            />
          </SafeAreaView>
        ) : (
          <Video
            source={{uri: video.url}}
            ref={(ref) => {
              this.player = ref;
            }}
            onLoadStart={() => this.setState({videoLoading: true})}
            onLoad={() => this.setState({videoLoading: false})}
            onProgress={(data) => this.setTime(data)}
            onEnd={() => this.setState({paused: true, finished: true})}
            style={{
              flex: 1,
              width: this.state.WINDOW_DIMENSIONS.width,
              height: this.state.WINDOW_DIMENSIONS.height,
            }}
            paused={false}
          />
        )}
        <SafeAreaView
          style={{
            position: 'absolute',
            bottom: BOTTOM_PADDING,
            width: this.state.WINDOW_DIMENSIONS.width,
            alignItems: 'center',
            height: this.state.WINDOW_DIMENSIONS.height,
            justifyContent: 'flex-end',
          }}>
          {this.state.keyboard ? (
            <TouchableOpacity
              style={{position: 'absolute', bottom: 0}}
              onPress={() => this.textinput.blur()}>
              <View
                style={{
                  backgroundColor: constants.BACKGROUND_COLOR,
                  width: this.state.WINDOW_DIMENSIONS.width,
                  alignItems: 'center',
                  height: this.state.WINDOW_DIMENSIONS.height,
                  opacity: 0.4,
                }}
              />
            </TouchableOpacity>
          ) : null}
          {this.commentBar()}
        </SafeAreaView>
      </View>
    );
  };

  commentBar = () => {
    const {
      comment,
      comments,
      isBlurComments,
      WINDOW_DIMENSIONS,
      keyboard,
    } = this.state;

    return (
      <KeyboardAvoidingView
        behavior="padding"
        style={{alignItems: 'center', width: WINDOW_DIMENSIONS.width}}>
        <MaskedView
          style={{
            width: '100%',
            height: 300,
          }}
          maskElement={
            <View style={{flex: 1, backgroundColor: 'transparent'}}>
              <LinearGradient
                colors={[
                  'rgba(0, 0, 0, 1)',
                  isBlurComments === true
                    ? 'rgba(0, 0, 0, 0.0)'
                    : 'rgba(0, 0, 0, 1)',
                ]}
                start={{x: 0, y: 0.7}}
                end={{x: 0, y: 0.35}}
                style={{
                  flex: 1,
                  width: '100%',
                }}
              />
            </View>
          }>
          <FlatList
            data={comments}
            keyExtractor={(item) => item.uid}
            inverted={true}
            showsVerticalScrollIndicator={false}
            onScroll={(e) => {
              if (
                e.nativeEvent.contentOffset.y > 20 &&
                isBlurComments !== false
              ) {
                this.setState({isBlurComments: false});
              } else if (
                e.nativeEvent.contentOffset.y <= 20 &&
                isBlurComments !== true
              ) {
                this.setState({isBlurComments: true});
              }
            }}
            renderItem={({item, index}) => (
              <View
                style={{
                  width: WINDOW_DIMENSIONS.width - 20,
                  alignItems: 'flex-start',
                  marginVertical: SIZES.spacing,
                  marginHorizontal: SIZES.padding,
                }}>
                <View
                  style={{
                    backgroundColor: constants.BAR_COLOR,
                    opacity: keyboard ? 1 : 0.75,
                    borderRadius: 24,
                    padding: 10,
                  }}>
                  <View style={{flexDirection: 'row'}}>
                    <Text
                      text={`${item.user.username}`}
                      style={{fontSize: 12}}
                    />
                    {item.user.verified === true ? (
                      <VerifiedIcon
                        size={12}
                        style={{paddingLeft: SIZES.spacing * 2}}
                      />
                    ) : null}
                  </View>
                  <Text
                    text={item.comment}
                    style={{fontSize: 12, fontWeight: 'normal'}}
                  />
                </View>
              </View>
            )}
          />
        </MaskedView>
        <View
          style={{
            width: WINDOW_DIMENSIONS.width - 20,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: WINDOW_DIMENSIONS.width - (this.state.keyboard ? 20 : 70),
              borderRadius: 24,
              backgroundColor: constants.BAR_COLOR,
              marginTop: 2.5,
              opacity: keyboard ? 1 : 0.6,
            }}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <TextInput
                ref={(input) => (this.textinput = input)}
                placeholder="Write your comment..."
                style={{
                  fontFamily:
                    Platform.OS === 'ios' ? 'Avenir' : 'sans-serif-condensed',
                  color: '#FFF',
                  width: WINDOW_DIMENSIONS.width - 70,
                  fontSize: 12,
                  padding: 15,
                }}
                underlineColorAndroid="transparent"
                onChangeText={(commentInput) =>
                  this.setState({comment: commentInput})
                }
                value={comment}
                placeholderTextColor="#FFF"
              />
            </View>
            {comment !== '' ? (
              <TouchableOpacity onPress={() => this.sendComment()}>
                <View style={{padding: 10}}>
                  <Icon
                    name="send"
                    color="#FFF"
                    type="material-community"
                    size={16}
                  />
                </View>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  };

  render() {
    const {
      loading,
      video,
      paused,
      videoLoading,
      videoInfo,
      dk,
      sn,
      optionsVisible,
    } = this.state;

    return (
      <View style={{flex: 1, backgroundColor: constants.BACKGROUND_COLOR}}>
        {video.type === 'video'
          ? this.renderVideoPlayer(video, paused, videoInfo, dk, sn)
          : null}
        {video.type === 'live' ? this.renderLivePlayer(video) : null}
        {/* {loading || videoLoading ? (
          <Loading
            loadingStyle={{
              position: 'absolute',
              width: width,
              height: height,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#000',
              opacity: 0.6,
            }}
            textStyle={{marginTop: 10}}
            text="Loading"
          />
        ) : null} */}
        <Header
          leftButtonPress={() =>
            this.props.navigation.dispatch(StackActions.pop())
          }
          leftButtonIcon="chevron-left"
          backgroundColor="transparent"
        />
        <Options
          list={this.list}
          visible={optionsVisible}
          cancelPress={() => this.setState({optionsVisible: false})}
        />
      </View>
    );
  }
}

export default observer(WatchVideo);

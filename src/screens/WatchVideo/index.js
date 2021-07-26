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

const {width, height} = Dimensions.get('window');
const BOTTOM_PADDING = height >= 812 ? 40 : 20;

const RNHapticFeedbackOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

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
      fullScreen: true,
      isLiked: false,
      isBlurComments: true,
    };

    this.list = [{title: 'Report', onPress: this.reportVideo}];

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

    if (subscribtion.subscribtion) {
      const influencer = await checkUserInfo(this.state.video.user.uid);

      if (this.state.video.type === 'video') {
        const video = await getVideoInfo(this.state.video.uid, influencer);

        if (
          typeof video.title !== 'undefined' &&
          !isAdmin(Store.user) &&
          subscribtion.test !== true
        ) {
          setVideoView(Store.user.uid, this.state.video);
        }

        const isLiked = Object.values(video.likes).some(
          (like) => like.uid === Store.user.uid,
        );

        this.setState({video, isLiked});
      } else if (this.state.video.type === 'live') {
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
      }

      this.setState({loading: false, paused: false, influencer});
    } else {
      Alert.alert('Oops', 'You must become a member to view the content.', [
        {
          text: 'Okay',
          onPress: () => this.props.navigation.dispatch(StackActions.pop()),
        },
      ]);
    }
  };

  componentWillUnmount = () => {
    Keyboard.removeListener('keyboardDidShow', () => {
      this.setState({keyboard: true});
    });

    Keyboard.removeListener('keyboardDidHide', () => {
      this.setState({keyboard: false});
    });

    database().ref('comments').child(this.state.video.uid).off();
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

  shareVideo = async (
    text = `Hey did you watch this video on BackStage. ${this.state.video.title} is live!`,
  ) => {
    const result = await shareItem(text);
    this.setState({optionsVisible: false});
  };

  goTo = (route, info = null) => {
    this.setState({paused: true});

    if (route === 'Comments') {
      const replaceActions = StackActions.push(route, {
        video: info,
        comments: this.state.comments,
      });
      return this.props.navigation.dispatch(replaceActions);
    }
  };

  setTime = (data) => {
    var dk = parseInt(data.currentTime / 60);
    var sn = parseInt(data.currentTime % 60);

    dk = dk < 10 ? `0${dk}` : dk.toString();
    sn = sn < 10 ? `0${sn}` : sn.toString();

    this.setState({videoInfo: data, dk: dk, sn: sn});
  };

  seek = (time) => {
    this.player.seek(time, 1000);
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
    this.setState({isLiked: !this.state.isLiked});

    return likeVideo(
      Store.user,
      this.state.video,
      this.state.isLiked,
    ).catch(() => this.setState({isLiked: !this.state.isLiked}));
  };

  renderVideoPlayer = (video, paused, videoInfo, dk, sn) => {
    const date = new Date(video.timestamp);
    const month = this.state.months[date.getMonth()].slice(0, 3);
    const day = date.getDate();
    const year = date.getFullYear();

    return (
      <TouchableWithoutFeedback
        onPress={() =>
          this.setState({controlsVisible: !this.state.controlsVisible})
        }>
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
            fullScreen={this.state.fullScreen}
            resizeMode={this.state.fullScreen ? 'cover' : 'contain'}
            style={[
              this.state.fullScreen
                ? {
                    flex: 1,
                    width: Dimensions.get('screen').width,
                    height: Dimensions.get('screen').height,
                  }
                : {flex: 1, width: width, height: height},
            ]}
            paused={paused}
            repeat
          />
          {this.state.controlsVisible ? (
            <View
              style={{
                position: 'absolute',
                width: '90%',
                height: '98%',
                display: 'flex',
                justifyContent: 'flex-end',
                alignSelf: 'center',
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
                  onPress={() => this.setState({paused: !paused})}>
                  <Icon
                    name={paused ? 'play' : 'pause'}
                    color="#FFF"
                    type="material-community"
                    size={28}
                  />
                </TouchableOpacity>
                <Slider
                  style={{width: width - 170}}
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
                <TouchableOpacity
                  onPress={() =>
                    this.setState({fullScreen: !this.state.fullScreen})
                  }
                  style={{bottom: 1}}>
                  <Icon
                    name={
                      !this.state.fullScreen ? 'fullscreen' : 'fullscreen-exit'
                    }
                    color="#FFF"
                    type="material-community"
                    size={28}
                  />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() =>
                this.setState({fullScreen: !this.state.fullScreen})
              }
              style={{
                position: 'absolute',
                width: '90%',
                height: 40,
                display: 'flex',
                justifyContent: 'flex-end',
                alignSelf: 'center',
                alignContent: 'flex-end',
                alignItems: 'flex-end',
                bottom: getBottomSpace() * 0.475 + SIZES.padding * 2,
              }}>
              <Icon
                name={!this.state.fullScreen ? 'fullscreen' : 'fullscreen-exit'}
                color="#FFF"
                type="material-community"
                size={28}
                style={{
                  justifyContent: 'center',
                  flex: 1,
                }}
              />
            </TouchableOpacity>
          )}
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
          style={{flex: 1, width: width, height: height}}
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
              width: width,
              height: height,
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
            style={{flex: 1, width: width, height: height}}
            paused={false}
          />
        )}
        <SafeAreaView
          style={{
            position: 'absolute',
            bottom: BOTTOM_PADDING,
            width,
            alignItems: 'center',
            height,
            justifyContent: 'flex-end',
          }}>
          {this.state.keyboard ? (
            <TouchableOpacity
              style={{position: 'absolute', bottom: 0}}
              onPress={() => this.textinput.blur()}>
              <View
                style={{
                  backgroundColor: constants.BACKGROUND_COLOR,
                  width,
                  alignItems: 'center',
                  height,
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
    const {comment, comments, isBlurComments} = this.state;

    return (
      <KeyboardAvoidingView
        behavior="padding"
        style={{alignItems: 'center', width: width}}>
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
                  width: width - 20,
                  alignItems: 'flex-start',
                  marginVertical: SIZES.spacing,
                  marginHorizontal: SIZES.padding,
                }}>
                <View
                  style={{
                    backgroundColor: constants.BAR_COLOR,
                    opacity: this.state.keyboard ? 1 : 0.75,
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
            width: width - 20,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: this.state.keyboard ? width - 20 : width - 70,
              borderRadius: 24,
              backgroundColor: constants.BAR_COLOR,
              marginTop: 2.5,
              opacity: this.state.keyboard ? 1 : 0.6,
            }}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <TextInput
                ref={(input) => (this.textinput = input)}
                placeholder="Write your comment..."
                style={{
                  fontFamily:
                    Platform.OS === 'ios' ? 'Avenir' : 'sans-serif-condensed',
                  color: '#FFF',
                  width: width - 70,
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

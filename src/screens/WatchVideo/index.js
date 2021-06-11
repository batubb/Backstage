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
} from 'react-native';
import {observer} from 'mobx-react';
import {Slider, Icon} from 'react-native-elements';
import Video from 'react-native-video';
import {StackActions} from '@react-navigation/native';
import {Loading, Header, Options, Text} from '../../components';
import {constants} from '../../resources';
import {
  checkSubscribtion,
  checkUserInfo,
  setVideoView,
  getVideoInfo,
  shareItem,
  report,
  sendComment,
} from '../../services';
import Store from '../../store/Store';
import {followerCount, timeDifference} from '../../lib';
import {SafeAreaView} from 'react-native';
import {KeyboardAvoidingView} from 'react-native';
import database from '@react-native-firebase/database';
import WatchVideoIcon from '../../components/ScreenComponents/WatchVideoComponents/WatchVideoIcon/WatchVideoIcon';
import {SIZES} from '../../resources/theme';

const {width, height} = Dimensions.get('window');
const BOTTOM_PADDING = height >= 812 ? 40 : 20;

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
    };

    this.list = [
      {title: 'Report', onPress: this.reportVideo},
      {title: 'Share', onPress: this.shareVideo},
    ];

    if (Store.user.uid === this.props.route.params.video.user.uid) {
      this.list = [
        ...this.list,
        {title: 'Delete', color: constants.RED, onPress: this.deleteVideo},
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

    const subscribtion = await checkSubscribtion(
      Store.uid,
      this.state.video.user.uid,
    );

    if (subscribtion.subscribtion) {
      const influencer = await checkUserInfo(this.state.video.user.uid);

      if (this.state.video.type === 'video') {
        const video = await getVideoInfo(this.state.video.uid, influencer);

        if (typeof video.title !== 'undefined') {
          setVideoView(Store.user.uid, this.state.video);
        }

        this.setState({video});
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
            comments = comments.slice(0, 3);
            comments.reverse();
            this.setState({comments});
          });
      }

      this.setState({loading: false, paused: false, influencer});
    } else {
      Alert.alert('Oops', 'You must be a member to view the content.', [
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
        'You have reported this video. We will investigate this video.',
        [{text: 'Okay'}],
      );
    } else {
      Alert.alert('Oops', 'We are sorry for this. Please try again later.', [
        {text: 'Okay'},
      ]);
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

  renderVideoPlayer = (video, paused, videoInfo, dk, sn) => {
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
        />
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
              height: '23%',
              marginBottom: SIZES.spacing * 5,
            }}>
            <View style={{width: '70%', marginTop: 'auto', marginBottom: 10}}>
              <Text
                text={video.title}
                numberOfLines={this.state.showMore ? 3 : 1}
                onPress={() => this.setState({showMore: !this.state.showMore})}
                style={{fontWeight: 'normal', fontSize: 16}}
              />
            </View>
            <View
              style={{
                alignItems: 'center',
                display: 'flex',
                justifyContent: 'space-between',
              }}>
              <View style={{alignItems: 'center'}}>
                <WatchVideoIcon name="eye-outline" type="ionicon" />
                <Text text={'1.25K'} style={{fontSize: 12}} />
              </View>
              <TouchableOpacity onPress={() => this.goTo('Comments', video)}>
                <View style={{alignItems: 'center'}}>
                  <WatchVideoIcon
                    name="chatbubble-outline"
                    type="ionicon"
                    size={28}
                  />
                  <Text
                    text={`${followerCount(video.comments)}`}
                    style={{fontSize: 12}}
                  />
                </View>
              </TouchableOpacity>
              <WatchVideoIcon
                name="dots-horizontal"
                type="material-community"
                onPress={() => this.setState({optionsVisible: true})}
              />
            </View>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <TouchableOpacity onPress={() => this.setState({paused: !paused})}>
              <Icon
                name={paused ? 'play' : 'pause'}
                color="#FFF"
                type="material-community"
              />
            </TouchableOpacity>
            <Slider
              style={{width: width - 140}}
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
              <Text style={{fontSize: 12}} text={`${dk}:${sn}`} />
            </View>
          </View>
        </View>
      </View>
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
            poster={video.photo}
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
    const {comment, comments} = this.state;

    return (
      <KeyboardAvoidingView
        behavior="padding"
        style={{alignItems: 'center', width: width}}>
        <FlatList
          data={comments}
          keyExtractor={(item) => item.uid}
          renderItem={({item, index}) => (
            <View
              style={{
                width: width - 20,
                alignItems: 'flex-start',
                marginVertical: 2.5,
              }}>
              <View
                style={{
                  backgroundColor: constants.BAR_COLOR,
                  opacity: this.state.keyboard ? 1 : 0.6,
                  borderRadius: 24,
                  padding: 10,
                }}>
                <Text text={item.user.name} style={{fontSize: 12}} />
                <Text
                  text={item.comment}
                  style={{fontSize: 12, fontWeight: 'normal'}}
                />
              </View>
            </View>
          )}
        />
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
          {!this.state.keyboard ? (
            <TouchableOpacity
              onPress={() =>
                this.shareVideo(
                  `Hey are you watching this live video? Let's watch ${this.state.influencer.username} together.`,
                )
              }>
              <View
                style={{
                  width: 45,
                  height: 45,
                  backgroundColor: '#FFF',
                  borderRadius: 22.5,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Icon
                  name="export-variant"
                  color="#000"
                  type="material-community"
                />
              </View>
            </TouchableOpacity>
          ) : null}
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
        {loading || videoLoading ? (
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
        ) : null}
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

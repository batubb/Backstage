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
  Platform,
  Image,
} from 'react-native';
import {observer} from 'mobx-react';
import {Icon} from 'react-native-elements';
import Video from 'react-native-video';
import {StackActions} from '@react-navigation/native';
import Animated, {Easing} from 'react-native-reanimated';
import {Loading, Text, MyImage, VerifiedIcon} from '../../components';
import {constants} from '../../resources';
import {checkSubscribtion, checkUserInfo, report} from '../../services';
import Store from '../../store/Store';
import runTiming from '../../lib/runTiming';
import {SIZES} from '../../resources/theme';
import SlidingUpPanel from 'rn-sliding-up-panel';
import database from '@react-native-firebase/database';

const {width, height} = Dimensions.get('window');
const SCREEN_DIMENSIONS = Dimensions.get('screen');
var BOTTOM_PADDING = height >= 812 ? 44 : 20;
BOTTOM_PADDING = Platform.OS === 'android' ? 0 : BOTTOM_PADDING;

// TODO Canlı yayın izleme eklenecek.

class WatchStory extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      refreshing: false,
      stories: this.props.route.params.stories,
      paused: true,
      videoLoading: true,
      isVideoSeeked: false,
      isCommentModalVisible: false,
      videoInfo: {},
      content: {...this.props.route.params.stories[0], id: 0},
      allStories: this.props.route.params.allStories,
      subscribtion: {
        subscribtion: false,
      },
      optionsVisible: false,
    };

    this.list = [{title: 'Report', onPress: this.reportVideo}];

    if (Store.user.uid === this.props.route.params.stories[0].user.uid) {
      this.list = [
        ...this.list,
        {title: 'Delete', color: constants.RED, onPress: this.deleteVideo},
      ];
    }

    this.storyLoadingClock = new Animated.Clock();
    this.storyLoadingValue = new Animated.Value(0);
  }

  componentDidMount = async () => {
    this.bottomSheetRef?.show();
    const subscribtion = await checkSubscribtion(
      Store.uid,
      this.state.content.user.uid,
    );
    this.setState({subscribtion});

    if (subscribtion.subscribtion) {
      const influencer = await checkUserInfo(this.state.content.user.uid);
      this.setState({loading: false, paused: false, influencer});
      this.startProgressBar();
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
    if (this.storyLoadingNextAction) {
      clearTimeout(this.storyLoadingNextAction);
      this.storyLoadingNextAction = null;
    }
  };
  deleteVideo = async () => {
    await database()
      .ref('stories')
      .child(Store.user.uid)
      .child(this.state.content.uid)
      .set(null);
    this.setState({optionsVisible: false});
    this.props.navigation.dispatch(StackActions.pop());
  };

  reportVideo = async () => {
    const result = await report(this.state.content);

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

  nextStory = (stories, content) => {
    const lastStories = this.state.allStories[this.state.allStories.length - 1];

    if (
      stories[0].user.uid === lastStories[0].user.uid &&
      stories.length - 1 === content.id
    ) {
      return this.props.navigation.dispatch(StackActions.pop());
    }

    var x = 0;

    for (let i = 0; i < this.state.allStories.length; i++) {
      const element = this.state.allStories[i];
      if (element[0].user.uid === stories[0].user.uid) {
        x = i;
      }
    }

    if (stories.length - 1 === content.id) {
      return this.setState({
        stories: this.state.allStories[x + 1],
        content: {...this.state.allStories[x + 1][0], id: 0},
      });
    }

    this.setState({content: {...stories[content.id + 1], id: content.id + 1}});
  };

  previousStory = (stories, content) => {
    const firstStory = this.state.allStories[0];

    if (stories[0].user.uid === firstStory[0].user.uid && content.id === 0) {
      return true;
    }

    var x = 0;

    for (let i = 0; i < this.state.allStories.length; i++) {
      const element = this.state.allStories[i];

      if (element[0].user.uid === stories[0].user.uid) {
        x = i;
      }
    }

    if (content.id === 0) {
      return this.setState({
        stories: this.state.allStories[x - 1],
        content: {...this.state.allStories[x - 1][0], id: 0},
      });
    }

    this.setState({content: {...stories[content.id - 1], id: content.id - 1}});
  };

  renderVideoPlayer = (video) => {
    return (
      <View
        style={{
          width,
          height,
          position: 'absolute',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Video
          source={{uri: video.url}}
          ref={(ref) => {
            this.player = ref;
          }}
          onEnd={() => this.nextStory(this.state.stories, this.state.content)}
          style={{flex: 1, width: width, height: height, position: 'absolute'}}
          paused={false}
          onLoadStart={() => this.setState({loading: true})}
          onLoad={(videoData) => {
            this.videoDuration = videoData.duration;
          }}
          onVideoEnd={() => {
            this.storyLoadingValue = new Animated.Value(0);
            this.nextStory(this.state.stories, this.state.content);
          }}
          onProgress={() => {
            if (this.state.loading) {
              this.setState({loading: false});
              this.startProgressBar(this.videoDuration, 0, false);
            }
          }}
          onBuffer={() => {
            this.storyLoadingValue = new Animated.Value(0);
            this.startProgressBar(this.videoDuration, 0, false);
          }}
          onPlaybackResume={() => {
            this.setState({isVideoSeeked: false});
            this.startProgressBar(
              this.videoDuration - this.currentLoadingValue,
              this.currentLoadingValue,
              false,
            );
          }}
          onPlaybackStalled={() => {
            this.storyLoadingValue = new Animated.Value(
              this.currentLoadingValue,
            );
            clearTimeout(this.storyLoadingNextAction);
            this.storyLoadingNextAction = null;
            this.setState({isVideoSeeked: true});
          }}
        />
      </View>
    );
  };

  renderImage = (content) => {
    return (
      <View
        style={{
          width,
          height,
          position: 'absolute',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Image
          style={{
            flex: 1,
            width,
            height,
            position: 'absolute',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          }}
          source={{uri: content.url}}
          onLoadStart={() => this.setState({loading: true})}
          onLoadEnd={() => {
            this.setState({loading: false});
            this.startProgressBar();
          }}
        />
      </View>
    );
  };

  startProgressBar = (
    videoDuration = null,
    startFrom = 0,
    setNextAction = true,
  ) => {
    const contentType = this.state.content.type;

    if (
      contentType === 'photo' ||
      (contentType === 'video' && videoDuration !== null)
    ) {
      if (this.storyLoadingNextAction) {
        clearTimeout(this.storyLoadingNextAction);
        this.storyLoadingNextAction = null;
      }
      const duration =
        contentType === 'photo'
          ? 10000
          : parseFloat(parseFloat(videoDuration * 1000).toFixed(2));
      this.storyLoadingValue = runTiming(
        this.storyLoadingClock,
        duration,
        new Animated.Value(startFrom),
        new Animated.Value(1),
      );

      if (setNextAction) {
        this.storyLoadingNextAction = setTimeout(() => {
          this.storyLoadingValue = new Animated.Value(0);
          this.nextStory(this.state.stories, this.state.content);
          this.storyLoadingNextAction = null;
        }, duration);
      }
    }
  };

  render() {
    const {loading, stories, content, subscribtion} = this.state;

    return (
      <View style={{flex: 1, backgroundColor: constants.BACKGROUND_COLOR}}>
        <SlidingUpPanel
          ref={(ref) => (this.bottomSheetRef = ref)}
          height={SCREEN_DIMENSIONS.height}
          snappingPoints={[SCREEN_DIMENSIONS.height, 0]}
          containerStyle={{flex: 1}}
          friction={0.7}
          onBottomReached={() =>
            this.props.navigation.dispatch(StackActions.pop())
          }>
          {content.type === 'photo' && subscribtion.subscribtion
            ? this.renderImage(content)
            : null}
          {content.type === 'video' && subscribtion.subscribtion
            ? this.renderVideoPlayer(content)
            : null}
          <Animated.Code>
            {() =>
              Animated.call(
                [this.storyLoadingValue],
                ([val]) => (this.currentLoadingValue = val),
              )
            }
          </Animated.Code>
          {loading || this.state.isVideoSeeked ? (
            <View
              style={{
                width,
                height,
                backgroundColor: loading
                  ? constants.BACKGROUND_COLOR
                  : constants.TRANSPARENT_BLACK_COLOR,
                alignItems: 'center',
                justifyContent: 'center',
                position: 'absolute',
              }}>
              <Loading />
            </View>
          ) : null}
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => this.nextStory(stories, content)}
            style={{width: width / 2, height, position: 'absolute', right: 0}}
          />
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => this.previousStory(stories, content)}
            style={{width: width / 2, height, position: 'absolute', left: 0}}
          />
          <View
            style={{
              width,
              flexDirection: 'row',
              paddingHorizontal: 20,
              paddingVertical: 10,
              marginTop: BOTTOM_PADDING,
              justifyContent: 'space-between',
            }}>
            {stories.map((item, index) => (
              <View
                key={item.uid}
                style={{
                  width: (width - 40) / stories.length - 2.5,
                  height: 2,
                  backgroundColor: index < content.id ? '#FFF' : 'gray',
                  flexDirection: 'row',
                }}>
                {index === content.id && !loading ? (
                  <Animated.View
                    style={{
                      height: 2,
                      backgroundColor: '#FFF',
                      flex: this.storyLoadingValue,
                    }}
                  />
                ) : null}
              </View>
            ))}
          </View>
          <View
            style={{
              width,
              flexDirection: 'row',
              paddingHorizontal: 20,
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <View style={{alignItems: 'center', flexDirection: 'row'}}>
              <MyImage
                photo={content.user.photo}
                style={{
                  width: 45,
                  height: 45,
                  borderRadius: 25,
                  marginTop: SIZES.spacing,
                }}
              />
              <View>
                <View style={{flexDirection: 'row'}}>
                  <Text
                    text={content.user.username}
                    style={{marginLeft: SIZES.spacing * 2}}
                  />
                  <VerifiedIcon size={18} style={{top: 0}} />
                </View>
                {content.title !== '' ? (
                  <Text
                    text={content.title}
                    style={{marginLeft: 5, fontSize: 12, fontWeight: 'normal'}}
                  />
                ) : null}
              </View>
            </View>
            <TouchableOpacity
              style={{padding: 5}}
              onPress={() =>
                this.props.navigation.dispatch(StackActions.pop())
              }>
              <Icon name="close" color="#FFF" type="material-community" />
            </TouchableOpacity>
          </View>
        </SlidingUpPanel>
      </View>
    );
  }
}

export default observer(WatchStory);

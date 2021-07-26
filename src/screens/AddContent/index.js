/* eslint-disable dot-notation */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Alert,
  TouchableOpacity,
  Dimensions,
  PermissionsAndroid,
  Platform,
  TextInput,
  FlatList,
} from 'react-native';
import {NodeCameraView} from 'react-native-nodemediaclient';
import axios from 'axios';
import Carousel from 'react-native-snap-carousel';
import Video from 'react-native-video';
import * as ImagePicker from 'react-native-image-picker';
import {makeid, sleep, isInfluencer, isAdmin} from '../../lib';
import storage from '@react-native-firebase/storage';
import {StackActions} from '@react-navigation/native';
import Store from '../../store/Store';
import {VerifiedIcon, Loading, Text, Button, Header} from '../../components';
import {constants} from '../../resources';
import {
  createVideoData,
  getUserPosts,
  checkUserInfo,
  createStoryData,
} from '../../services';
import {Icon} from 'react-native-elements';
import {createThumbnail} from 'react-native-create-thumbnail';
import {SafeAreaView} from 'react-native';
import {KeyboardAvoidingView} from 'react-native';
import {RNCamera} from 'react-native-camera';
import database from '@react-native-firebase/database';
import MyImage from '../../components/MyImage';
import {SIZES, COLORS} from '../../resources/theme';
import PostButton from '../../components/ScreenComponents/AddContentComponents/PostButton/PostButton';
import EditTitleModal from '../../components/ScreenComponents/AddContentComponents/EditTitleModal/EditTitleModal';
import EditTitlePrompt from '../../components/ScreenComponents/AddContentComponents/EditTitlePrompt/EditTitlePrompt';
import {TIERS} from '../../resources/constants';
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-community/masked-view';

const {width, height} = Dimensions.get('window');
const TOP_PADDING = height >= 812 ? 60 : 40;

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isPublishing: false,
      hasPermission: false,
      paused: true,
      streamId: '',
      streamKey: '',
      publicKey: '',
      ratio: '16:9',
      isRecording: false,
      indexButton:
        this.props.route &&
        this.props.route.params &&
        this.props.route.params.startButtonIdx
          ? this.props.route.params.startButtonIdx
          : 1,
      thumbnailUrl: '',
      thumbnailWidth: '',
      thumnailHeight: '',
      liveStreamId: '',
      loading: false,
      url: '',
      title: '',
      assetId: '',
      uid: '',
      camera: 1,
      influencerPriceIdx: 0,
      editTextModal: false,
      seconds: 0,
      timer: false,
      type: '',
      storyVideo: false,
      onPage: true,
      isStoryVideoRecording: false,
      comments: [],
      isBlurComments: true,
    };

    this.settings = {
      audio: {bitrate: 128000, profile: 1, samplerate: 44100},
      video: {
        preset: 4,
        bitrate: 2000000,
        profile: 2,
        fps: 30,
        videoFrontMirror: true,
      },
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

  componentDidMount() {
    this.createStream();
  }

  componentWillUnmount = async () => {
    if (this.state.isPublishing && this.state.seconds >= 10) {
      await this.stopLiveAndPublishPost();
      this.setState({onPage: false});
    }
  };

  getAssetInfo = async (id) => {
    try {
      const uid = makeid(40, 'uuid');
      this.setState({uid});

      var livestream = {
        uid: uid,
        url: `https://stream.mux.com/${this.state.publicKey}.m3u8`,
        thumbnail: {
          url: `https://image.mux.com/${this.state.publicKey}/thumbnail.png?width=${width}&height=${height}&fit_mode=pad`,
          width: width,
          height: height,
        },
        publicKey: this.state.publicKey,
        liveId: id,
        title: this.state.title === '' ? '' : this.state.title,
        photo: `https://image.mux.com/${this.state.publicKey}/thumbnail.png?width=${width}&height=${height}&fit_mode=pad`,
      };

      if (!this.state.onPage) {
        return true;
      }

      await sleep(5000);

      const livestreamResponse = await this.mux_instance.get(
        '/video/v1/live-streams/' + id,
      );
      const assetResponse = await this.mux_instance.get(
        '/video/v1/assets/' + livestreamResponse.data.data.active_asset_id,
      );

      const assetPlaybackId = assetResponse.data.data.playback_ids[0].id;
      var video = {
        uid: uid,
        url: `https://stream.mux.com/${assetPlaybackId}.m3u8`,
        thumbnail: {
          url: `https://image.mux.com/${assetPlaybackId}/thumbnail.png?width=${width}&height=${height}&fit_mode=pad`,
          width: width,
          height: height,
        },
        assetPlaybackId: assetPlaybackId,
        title: this.state.title === '' ? '' : this.state.title,
        photo: `https://image.mux.com/${assetPlaybackId}/thumbnail.png?width=${width}&height=${height}&fit_mode=pad`,
        active: false,
      };

      await createVideoData(Store.user, livestream, 'live', 1);
      await createVideoData(Store.user, video, 'video', 0);

      this.setState({
        assetId: livestreamResponse.data.data.active_asset_id,
        assetPlaybackId,
      });
    } catch (err) {
      console.log('err: ', err);
      return Alert.alert('Oops', 'Something unexpected happens.', [
        {text: 'Okay'},
      ]);
    }
  };

  createStream = async () => {
    try {
      const mux_response = await this.mux_instance.post(
        '/video/v1/live-streams',
        {
          playback_policy: ['public'],
          new_asset_settings: {
            playback_policy: ['public'],
          },
        },
      );

      const mux_stream_key = mux_response.data.data.stream_key;
      const mux_playback_id = mux_response.data.data.playback_ids[0].id;

      this.setState({
        streamKey: mux_stream_key,
        publicKey: mux_playback_id,
        liveStreamId: mux_response.data.data.id,
      });
    } catch (err) {
      console.log('error creating new livestream: ', err);
    }
  };

  uploadVideo = async (uri, onname, type = 'photo') => {
    var ref = storage().ref().child(`videos/${onname}.mp4`);
    await ref.putFile(uri);

    return await ref.getDownloadURL();
  };

  uploadThumbnail = async (uri, onname) => {
    var ref = storage().ref().child(`thumbnails/${onname}.jpg`);
    await ref.putFile(uri);

    return await ref.getDownloadURL();
  };

  uploadStories = async (uri, onname, type = 'photo') => {
    if (type === 'photo') {
      var ref = storage().ref().child(`stories/${onname}.jpg`);
      await ref.putFile(uri);

      return await ref.getDownloadURL();
    } else {
      var ref = storage().ref().child(`stories/${onname}.mp4`);
      await ref.putFile(uri);

      return await ref.getDownloadURL();
    }
  };

  handlevideoPicked = async (url) => {
    this.setState({loading: true, paused: true});

    const onname = makeid(40, 'uuid');

    const data = await this.uploadVideo(url, onname);
    const thumbnail =
      this.state.thumbnailUrl !== ''
        ? this.state.thumbnailUrl
        : await createThumbnail({url: url, timeStamp: 10000});
    const thumbnailUrl =
      this.state.thumbnailUrl !== ''
        ? this.state.thumbnailUrl
        : await this.uploadThumbnail(thumbnail.path, onname);

    const videoThumbURL =
      this.state.thumbnailUrl !== ''
        ? this.state.thumbnailUrl
        : `${constants.VIDEO_THUMB_URL}${onname}_500x500.jpg?alt=media`;

    var video = {
      uid: onname,
      url: data,
      thumbnail: {
        url: thumbnailUrl,
        width:
          this.state.thumbnailWidth !== ''
            ? this.state.thumbnailWidth
            : thumbnail.width,
        height:
          this.state.thumbnailWidth !== ''
            ? this.state.thumnailHeight
            : thumbnail.height,
      },
      title: this.state.title,
      photo: videoThumbURL,
    };

    try {
      await createVideoData(Store.user, video);
      await getUserPosts(Store.user.uid, true);
      this.props.navigation.dispatch(StackActions.pop());
    } catch (error) {
      return Alert.alert('Oops', constants.ERROR_ALERT_MSG, [{text: 'Okay'}]);
    }

    this.setState({loading: false});
  };

  onBuffer = (buffer) => {
    console.log('onBuffer: ', buffer);
  };

  onError = (error) => {
    console.log('onError: ', error);
  };

  handleStoryPicked = async (url, type) => {
    this.setState({loading: true, storyVideo: true});

    const onname = makeid(40, 'uuid');

    const data = await this.uploadStories(url, onname, type);

    var content = {
      uid: onname,
      url: data,
    };

    try {
      await createStoryData(Store.user, content, type, this.state.title);
      this.props.navigation.dispatch(StackActions.pop());
    } catch (error) {
      return Alert.alert('Oops', constants.ERROR_ALERT_MSG, [{text: 'Okay'}]);
    }

    this.setState({loading: false});
  };

  checkPermissions = async () => {
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      ]);

      let hasAllPermissions = true;
      Object.keys(granted).forEach((key) => {
        if (granted[key] !== 'granted') {
          hasAllPermissions = false;
        }
      });

      this.setState({hasPermission: hasAllPermissions});
    } catch (err) {
      console.warn(err);
    }
  };

  startRecord = async () => {
    const {isRecording, hasPermission} = this.state;

    if (Platform.OS === 'android') {
      if (!hasPermission) {
        this.checkPermissions();
        return;
      }
    }

    const options = {
      mute: false,
      codec: RNCamera.Constants.VideoCodec['H264'],
    };

    try {
      if (isRecording) {
        await this.camera.stopRecording();
        this.setState({isRecording: false});
      } else {
        const data = this.camera.recordAsync(options);
        this.setState({isRecording: true});
        const result = await data;
        this.setState({url: result.uri, type: 'video'});
      }
    } catch (error) {
      console.log(error);
    }
  };

  onPressPublishBtn = async () => {
    const {isPublishing: publishingState, hasPermission} = this.state;

    if (Platform.OS === 'android') {
      if (!hasPermission) {
        this.checkPermissions();
        return;
      }
    }

    if (publishingState) {
      this.vb.stop();
      this.stopLiveAndPublishPost();
      this.props.navigation.dispatch(StackActions.pop());
      this.setState({timer: false, seconds: 0});
    } else {
      const activeLive = await this.checkActiveLive();

      if (activeLive) {
        return Alert.alert(
          'Oops',
          'The previous livestream is still in progress. Please try again in a minute.',
          [{text: 'Okay'}],
        );
      } else {
        this.vb.start();
        this.getAssetInfo(this.state.liveStreamId);

        database()
          .ref('comments')
          .child(this.state.uid)
          .orderByChild('timestamp')
          .on('value', (snap) => {
            var comments = [];

            snap.forEach((element) => {
              comments.push(element.val());
            });

            comments.reverse();
            comments = comments.slice(0, 100);
            this.setState({comments});
          });

        this.setState({timer: true}, () => {
          this.startTimer();
        });
      }
    }
    this.setState({isPublishing: !publishingState});
  };

  checkActiveLive = async () => {
    try {
      const result = await database().ref('live').once('value');
      const data = result.val();
      const keys = Object.keys(data);

      for (let i = 0; i < keys.length; i++) {
        const k = keys[i];
        const element = data[k];

        if (element.user.uid === Store.user.uid) {
          return true;
        }
      }

      return false;
    } catch (error) {
      return false;
    }
  };

  startTimer = async () => {
    while (this.state.timer) {
      await sleep(1000);
      this.setState({seconds: this.state.seconds + 1});
      if (this.state.indexButton === 2 && this.state.seconds >= 10) {
        this.stopStoryVideo();
        break;
      }
    }
  };

  stopStoryVideo = async () => {
    this.camera.stopRecording();
    this.setState({
      isRecording: false,
      seconds: 0,
      timer: false,
      isStoryVideoRecording: false,
    });
  };

  startStoryVideo = async () => {
    const options = {
      mute: false,
      codec: RNCamera.Constants.VideoCodec['H264'],
    };

    const data = this.camera.recordAsync(options);

    this.setState({timer: true}, () => {
      this.startTimer();
    });

    this.setState({isRecording: true, isStoryVideoRecording: true});
    const result = await data;
    this.setState({url: result.uri, type: 'storyVideo', timer: true});
  };

  stopLiveAndPublishPost = async () => {
    // const result = await database().ref('posts').child(Store.user.uid).child(this.state.uid).once('value');

    // var updates = {};

    // updates[`live/${this.state.uid}`] = null;

    // if (result.val()) {
    //     updates[`posts/${Store.user.uid}/${this.state.uid}/active`] = true;
    // }

    // database().ref().update(updates);
    return Alert.alert(
      '🥳🥳',
      'Your livestream is over. It will be saved in your videos section.',
      [{text: 'Okay'}],
    );
  };

  selectVideoFromRoll = async () => {
    ImagePicker.launchImageLibrary({mediaType: 'video'}, (result) => {
      if (!result.didCancel) {
        this.setState({url: result.uri, type: 'video'});
      }
    });
  };

  selectThumbnailFromRoll = async () => {
    this.setState({loading: true, paused: true});
    ImagePicker.launchImageLibrary({mediaType: 'photo'}, async (result) => {
      if (!result.didCancel) {
        const onname = makeid(40, 'uuid');
        const thumbnailUrl = await this.uploadThumbnail(result.uri, onname);
        const videoThumbURL = `${constants.VIDEO_THUMB_URL}${onname}_500x500.jpg?alt=media`;

        this.setState({
          loading: false,
          thumbnailUrl: videoThumbURL,
          thumbnailWidth: result.width,
          thumnailHeight: result.height,
        });
      } else {
        this.setState({loading: false});
      }
    });
  };

  // type can be one of story or video
  selectMediaFromRoll = (type) => {
    let mediaType = 'video';
    if (type === 'story') {
      mediaType = 'mixed';
    }
    ImagePicker.launchImageLibrary({mediaType: mediaType}, (result) => {
      if (!result.didCancel) {
        if (type === 'video') {
          this.setState({url: result.uri, type: 'video'});
        }
        // if this is a story
        else {
          // if this is a story video
          if (result.duration) {
            // if longer than 10 seconds, send a message
            if (result.duration > 10) {
              return Alert.alert(
                'You can not upload a story longer than 10 seconds',
                [{text: 'Okay'}],
              );
            } else {
              this.setState({url: result.uri, type: 'storyVideo'});
            }
          } else {
            this.setState({url: result.uri, type: 'storyPhoto'});
          }
        }
      }
    });
  };

  becomeInfluencer = async () => {
    var updates = {};

    updates[`users/${Store.user.uid}/type`] = 'influencer';
    updates[`users/${Store.user.uid}/price`] = parseFloat(
      constants.TIERS[this.state.influencerPriceIdx].price.toFixed(2),
    );

    this.setState({loading: true});
    await database().ref().update(updates);
    await checkUserInfo(Store.uid, true);
    Alert.alert(
      'Thanks',
      "We're thrilled to receive your application! You will be notified within 24 hours.",
      [{text: 'Okay'}],
    );
    this.setState({loading: false});
  };

  setPriceIdx = (offset) => {
    this.setState({
      influencerPriceIdx:
        (this.state.influencerPriceIdx + offset + TIERS.length) % TIERS.length,
    });
  };

  setSnapToItem = (index) => {
    const {isPublishing, isRecording} = this.state;

    if (index === 0) {
      this.carousel.snapToItem(1, true, true);
      return this.selectVideoFromRoll();
    }

    if (!isPublishing && !isRecording) {
      return this.setState({indexButton: index});
    }
  };

  takeStoryPhoto = async () => {
    const data = await this.camera.takePictureAsync({quality: 0.2});
    this.setState({type: 'storyPhoto', url: data.uri});
  };

  renderItem = ({item, index}) => {
    const {isPublishing, isRecording} = this.state;

    return (
      <TouchableOpacity
        onPress={() => {
          if (!isPublishing && !isRecording) {
            this.carousel.snapToItem(index);
            this.setState({indexButton: index});
          }
        }}>
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            alignSelf: 'center',
            backgroundColor: 'transparent',
            elevation: 4,
            padding: 20,
          }}>
          <Text text={item.name} style={styles.btnText} />
        </View>
      </TouchableOpacity>
    );
  };

  renderVideo = (title = '') => {
    return (
      <SafeAreaView
        style={{
          position: 'absolute',
          flex: 1,
          width: width,
          height: height,
          backgroundColor: constants.BACKGROUND_COLOR,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Video
          source={{uri: this.state.url}}
          ref={(ref) => {
            this.player = ref;
          }}
          style={{flex: 1, width: width, height: height}}
          paused={this.state.paused}
          repeat
        />
        {this.state.paused ? (
          <View
            style={{
              position: 'absolute',
              width: width,
              height: height,
              justifyContent: 'center',
              backgroundColor: '#000',
              opacity: 0.6,
            }}
          />
        ) : null}
        <View
          style={{
            position: 'absolute',
            justifyContent: 'flex-start',
            width: constants.DEFAULT_PAGE_WIDTH,
            alignSelf: 'center',
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <View style={{flex: 1}}>
            <EditTitlePrompt
              title={title}
              openModal={() => this.setState({editTextModal: true})}
            />
            <TouchableOpacity
              style={{
                paddingLeft: SIZES.spacing,
                flexDirection: 'row',
                alignItems: 'center',
                paddingTop: SIZES.padding,
              }}
              onPress={() => this.selectThumbnailFromRoll()}>
              <Icon
                name={'add-photo-alternate'}
                color="#FFF"
                type="material-icons"
                style={{left: 2}}
              />
              <Text
                text={
                  this.state.thumbnailUrl !== ''
                    ? 'Change\nCover'
                    : 'Cover'
                }
                style={{
                  paddingLeft: SIZES.spacing * 5,
                }}
              />
            </TouchableOpacity>
            {this.state.thumbnailUrl !== '' ? (
              <TouchableOpacity
                style={{
                  paddingLeft: SIZES.spacing,
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingTop: SIZES.padding * 2,
                }}
                onPress={() => this.setState({thumbnailUrl: ''})}>
                <Icon
                  name="trash"
                  color="#FFF"
                  type="ionicon"
                  style={{left: 2}}
                />
                <Text
                  text={'Remove\nCover'}
                  style={{
                    paddingLeft: SIZES.spacing * 5,
                  }}
                />
              </TouchableOpacity>
            ) : null}
          </View>

          <TouchableOpacity
            onPress={() => this.setState({paused: !this.state.paused})}>
            <Icon
              name={this.state.paused ? 'play' : 'pause'}
              color="#FFF"
              type="font-awesome-5"
              size={48}
            />
          </TouchableOpacity>
          <View style={{flex: 1}} />
        </View>
        <PostButton onPress={() => this.handlevideoPicked(this.state.url)} />
      </SafeAreaView>
    );
  };

  renderCamera = () => {
    const {hasPermission, camera} = this.state;

    if (Platform.OS === 'android' && !hasPermission) {
      return <View />;
    }

    return (
      <RNCamera
        ref={(ref) => {
          this.camera = ref;
        }}
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          width,
          height,
        }}
        type={
          camera === 1
            ? RNCamera.Constants.Type.front
            : RNCamera.Constants.Type.back
        }
        androidCameraPermissionOptions={{
          title: 'Permission to use camera',
          message: 'We need your permission to use your camera',
          buttonPositive: 'Ok',
          buttonNegative: 'Cancel',
        }}
        autoFocus={
          camera === 1
            ? RNCamera.Constants.AutoFocus.off
            : RNCamera.Constants.AutoFocus.on
        }
        androidRecordAudioPermissionOptions={{
          title: 'Permission to use audio recording',
          message: 'We need your permission to use your audio',
          buttonPositive: 'Ok',
          buttonNegative: 'Cancel',
        }}
      />
    );
  };

  renderLiveCamera = () => {
    const {hasPermission, streamKey, uid} = this.state;

    if (Platform.OS === 'android' && !hasPermission) {
      return <View />;
    }

    return (
      <>
        <NodeCameraView
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            width,
            height,
          }}
          ref={(vb) => {
            this.vb = vb;
          }}
          outputUrl={`rtmp://live.mux.com/app/${streamKey}`}
          camera={{
            cameraId: this.state.camera,
            cameraFrontMirror: true,
          }}
          audio={this.settings.audio}
          video={this.settings.video}
          autopreview={true}
        />
        {uid !== '' ? (
          <SafeAreaView
            style={{
              width,
              height,
              alignItems: 'center',
              justifyContent: 'flex-end',
              position: 'absolute',
              bottom: 175 + SIZES.padding,
            }}>
            {this.commentBar()}
          </SafeAreaView>
        ) : null}
      </>
    );
  };

  commentBar = () => {
    const {comments, isBlurComments} = this.state;

    return (
      <MaskedView
        style={{
          width: '100%',
          height: height * 0.5 > 200 ? height * 0.5 : 200,
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
              start={{x: 0, y: 0.75}}
              end={{x: 0, y: 0.1}}
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
                maxWidth: width - 100,
                alignItems: 'flex-start',
                marginVertical: SIZES.spacing,
                marginHorizontal: SIZES.padding,
              }}>
              <View
                style={{
                  backgroundColor: constants.BAR_COLOR,
                  opacity: 0.6,
                  borderRadius: 24,
                  padding: 10,
                }}>
                <View style={{flexDirection: 'row'}}>
                  <Text text={`${item.user.username}`} style={{fontSize: 12}} />
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
    );
  };

  renderEdit = () => {
    return (
      <EditTitleModal
        closeModal={() => {
          this.setState({editTextModal: false});
        }}
        photo={Store.user.photo}
        title={this.state.title}
        onChangeText={(input) => {
          this.setState({title: input, editTextModal: false});
        }}
      />
    );
  };

  renderEdit2 = () => {
    return (
      <SafeAreaView
        style={{
          position: 'absolute',
          flex: 1,
          width: width,
          height: height,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <KeyboardAvoidingView
          behavior="padding"
          style={{
            position: 'absolute',
            width: width,
            height: height,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <TouchableOpacity
            activeOpacity={0.9}
            style={{position: 'absolute'}}
            onPress={() => this.setState({editTextModal: false, title: ''})}>
            <View
              style={{
                width: width,
                height: height,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#000',
                opacity: 0.6,
              }}
            />
          </TouchableOpacity>
          <TextInput
            placeholder="Add a title..."
            style={{
              fontFamily:
                Platform.OS === 'ios' ? 'Avenir' : 'sans-serif-condensed',
              margin: 10,
              padding: 15,
              color: 'white',
              fontSize: 14,
              fontWeight: 'bold',
            }}
            underlineColorAndroid="transparent"
            onChangeText={(textInput) => this.setState({title: textInput})}
            value={this.state.title}
            maxLength={30}
            placeholderTextColor="gray"
          />
          <Button
            text="Confirm"
            buttonStyle={{
              width: '50%',
            }}
            onPress={() => this.setState({editTextModal: false})}
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  };

  renderStoryVideo = () => {
    return (
      <SafeAreaView
        style={{
          position: 'absolute',
          flex: 1,
          width: width,
          height: height,
          backgroundColor: constants.BACKGROUND_COLOR,
          alignItems: 'center',
          justifyContent: 'flex-end',
        }}>
        <Video
          source={{uri: this.state.url}}
          ref={(ref) => {
            this.player = ref;
          }}
          style={{width, height, position: 'absolute'}}
          paused={this.state.storyVideo}
          repeat
          muted={false}
        />

        <PostButton
          onPress={() => this.handleStoryPicked(this.state.url, 'video')}
        />
      </SafeAreaView>
    );
  };

  renderStoryPhoto = () => {
    return (
      <SafeAreaView
        style={{
          position: 'absolute',
          flex: 1,
          width: width,
          height: height,
          backgroundColor: constants.BACKGROUND_COLOR,
          alignItems: 'center',
          justifyContent: 'flex-end',
        }}>
        <MyImage
          photo={this.state.url}
          style={{width, height, position: 'absolute'}}
        />
        <PostButton
          onPress={() => this.handleStoryPicked(this.state.url, 'photo')}
        />
      </SafeAreaView>
    );
  };

  render() {
    const {
      loading,
      isPublishing,
      indexButton,
      url,
      isRecording,
      influencerPriceIdx,
      editTextModal,
      type,
      title,
    } = this.state;

    if (Store.user.type === 'user') {
      return (
        <View style={{flex: 1, backgroundColor: constants.BACKGROUND_COLOR}}>
          <Header
            title="Creator Application"
            rightButtonPress={() =>
              this.props.navigation.dispatch(StackActions.pop())
            }
            rightButtonIcon="close"
            rightButtonIconSize={28}
          />
          {loading ? (
            <Loading
              loadingStyle={{
                width,
                height,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              textStyle={{marginTop: 10, fontWeight: 'normal'}}
              text="Loading"
            />
          ) : (
            <View
              style={{
                flex: 1,
                backgroundColor: constants.BACKGROUND_COLOR,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: SIZES.padding * 2,
              }}>
              <Text
                text="Set your subscription price"
                style={{fontSize: 20, marginBottom: SIZES.padding}}
              />
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <TouchableOpacity
                  onPress={() => this.setPriceIdx(-1)}
                  style={{
                    padding: 5,
                    backgroundColor: COLORS.white,
                    borderRadius: 100,
                  }}>
                  <Icon
                    name="chevron-left"
                    color={constants.BACKGROUND_COLOR}
                    type="material-community"
                  />
                </TouchableOpacity>
                <View style={{paddingHorizontal: 20}}>
                  <Text
                    text={`$${constants.TIERS[influencerPriceIdx].price.toFixed(
                      2,
                    )}`}
                    style={{fontSize: 24, marginTop: 10}}
                  />
                  <Text
                    text={'per month'}
                    style={{fontSize: 12, color: 'gray', textAlign: 'center'}}
                  />
                </View>
                <TouchableOpacity
                  onPress={() => this.setPriceIdx(1)}
                  style={{
                    padding: 5,
                    backgroundColor: COLORS.white,
                    borderRadius: 100,
                  }}>
                  <Icon
                    name="chevron-right"
                    color={constants.BACKGROUND_COLOR}
                    type="material-community"
                  />
                </TouchableOpacity>
              </View>
              <Button
                text="Submit"
                buttonStyle={{
                  backgroundColor: COLORS.primary,
                  borderRadius: SIZES.radius,
                  paddingVertical: SIZES.padding * 1.5,
                  paddingHorizontal: SIZES.padding * 4,
                  marginTop: SIZES.padding * 4,
                }}
                textStyle={{color: COLORS.white, fontSize: 16}}
                onPress={() => this.becomeInfluencer()}
              />
            </View>
          )}
        </View>
      );
    }

    var icon = 'camera';
    var iconColor = constants.BACKGROUND_COLOR;
    var buttonColor = 'white';

    if (indexButton === 0) {
      if (isPublishing || isRecording) {
        icon = 'camera-off';
        iconColor = COLORS.primary;
        buttonColor = COLORS.primary;
      } else {
        icon = 'camera';
        iconColor = constants.BACKGROUND_COLOR;
        buttonColor = 'white';
      }
    } else if (indexButton === 1) {
      if (isPublishing || isRecording) {
        iconColor = COLORS.primary;
        buttonColor = COLORS.primary;
      } else {
        iconColor = constants.BACKGROUND_COLOR;
        buttonColor = 'white';
      }

      icon = 'access-point';
    } else {
      if (isPublishing || isRecording) {
        iconColor = COLORS.primary;
        buttonColor = COLORS.primary;
      } else {
        iconColor = constants.BACKGROUND_COLOR;
        buttonColor = 'white';
      }

      icon = 'camera';
    }

    return (
      <View style={{flex: 1, backgroundColor: constants.BACKGROUND_COLOR}}>
        {indexButton === 1 && url === '' ? this.renderLiveCamera() : null}
        {indexButton === 2 && url === '' ? this.renderCamera() : null}
        {indexButton === 0 && url === '' ? this.renderCamera() : null}
        {url === '' ? (
          <View
            style={{
              position: 'absolute',
              bottom: 30,
              justifyContent: 'center',
              alignItems: 'center',
              width: width,
            }}>
            <TouchableOpacity
              style={{margin: 10}}
              onPressOut={() =>
                indexButton === 2 ? this.stopStoryVideo() : null
              }
              onLongPress={() =>
                indexButton === 2 ? this.startStoryVideo() : null
              }
              onPress={() => {
                if (indexButton === 1) {
                  this.onPressPublishBtn();
                } else if (indexButton === 0) {
                  this.startRecord();
                } else {
                  this.takeStoryPhoto();
                }
              }}>
              <View
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  alignSelf: 'center',
                  backgroundColor: 'white',
                  elevation: 4,
                  width: 70,
                  height: 70,
                  borderRadius: 35,
                  borderWidth: buttonColor === COLORS.primary ? 6 : 1,
                  borderColor: buttonColor,
                }}>
                {icon === 'camera' || icon === 'camera-off' ? null : (
                  <Icon
                    name={icon}
                    color={iconColor}
                    type="material-community"
                  />
                )}
              </View>
            </TouchableOpacity>
            <Carousel
              ref={(c) => {
                this.carousel = c;
              }}
              data={[{name: 'Video'}, {name: 'Live'}, {name: 'Story'}]}
              renderItem={this.renderItem}
              sliderWidth={width * 0.8}
              itemWidth={width / 3}
              activeAnimationType={'spring'}
              activeAnimationOptions={{
                friction: 4,
                tension: 40,
              }}
              removeClippedSubviews={false}
              inactiveSlideScale={0.6}
              inactiveSlideOpacity={0.6}
              scrollEnabled={!isPublishing && !isRecording}
              enableMomentum
              firstItem={indexButton}
              activeSlideAlignment={'center'}
              onSnapToItem={(index) =>
                !isPublishing && !isRecording
                  ? this.setState({indexButton: index})
                  : null
              }
            />
          </View>
        ) : null}

        {indexButton === 1 && !isPublishing ? (
          <View
            style={{
              position: 'absolute',
              bottom: height / 2,
              display: 'flex',
              justifyContent: 'center',
              width: constants.DEFAULT_PAGE_WIDTH,
              alignSelf: 'center',
            }}>
            <EditTitlePrompt
              title={title}
              openModal={() => this.setState({editTextModal: true})}
            />
          </View>
        ) : null}
        {!this.state.isStoryVideoRecording && !this.state.isRecording ? (
          <TouchableOpacity
            style={{position: 'absolute', right: 0, bottom: 40}}
            onPress={() => {
              this.setState({camera: this.state.camera === 1 ? 0 : 1});

              if (indexButton === 1) {
                this.vb.switchCamera();
              }
            }}>
            <View style={{padding: 10}}>
              <Icon
                name="camera-reverse"
                color="#FFF"
                type="ionicon"
                size={32}
              />
            </View>
          </TouchableOpacity>
        ) : null}
        {(indexButton === 0 || indexButton === 2) && !this.state.isRecording ? (
          <TouchableOpacity
            style={{position: 'absolute', left: 0, bottom: 40}}
            onPress={() => {
              this.selectMediaFromRoll(indexButton === 0 ? 'video' : 'story');
            }}>
            <View style={{padding: 10}}>
              <Icon name="images-sharp" color="#FFF" type="ionicon" size={26} />
            </View>
          </TouchableOpacity>
        ) : null}
        {url !== '' && type === 'video' ? this.renderVideo(title) : null}
        {url !== '' && type === 'storyPhoto' ? this.renderStoryPhoto() : null}
        {url !== '' && type === 'storyVideo' ? this.renderStoryVideo() : null}
        {editTextModal ? this.renderEdit() : null}
        {loading ? (
          <Loading
            loadingStyle={{
              width,
              height,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: constants.BACKGROUND_COLOR,
            }}
            textStyle={{marginTop: 10, fontWeight: 'normal'}}
            text="Loading"
          />
        ) : null}
        {!isPublishing && !isRecording ? (
          <View
            style={{
              width: width - 10,
              flexDirection: 'row-reverse',
              position: 'absolute',
              left: 0,
              top: TOP_PADDING,
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <TouchableOpacity
              style={{paddingHorizontal: 10}}
              onPress={() => {
                if (this.state.url) {
                  this.setState({
                    isPublishing: false,
                    hasPermission: false,
                    paused: true,
                    streamId: '',
                    isRecording: false,
                    url: '',
                    title: '',
                    assetId: '',
                    uid: '',
                    seconds: 0,
                    timer: false,
                    type: '',
                    storyVideo: false,
                    isStoryVideoRecording: false,
                  });
                  /*if we have a url reset all state var's except for the ones initialized in component did mount*/
                } else {
                  this.props.navigation.dispatch(StackActions.pop());
                }
              }}>
              <Icon
                name="close"
                color="#FFF"
                type="material-community"
                size={36}
              />
            </TouchableOpacity>
            {!isInfluencer(Store.user) && !isAdmin(Store.user) ? (
              <View
                style={{
                  maxWidth: width - 100,
                  backgroundColor: COLORS.white,
                  paddingLeft: 10,
                  padding: 7,
                  borderTopRightRadius: 10,
                  borderBottomRightRadius: 10,
                }}>
                <Text
                  text="You can start creating, but you won't be discoverable until we notify you."
                  onPress={() => {}}
                  style={{
                    color: COLORS.black,
                    fontSize: 12,
                  }}
                />
              </View>
            ): null}
          </View>
        ) : null}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  adminBtn: {
    backgroundColor: '#006D9E',
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    elevation: 4,
    borderWidth: 0,
    marginVertical: 10,
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  btnText: {color: '#FFF', fontSize: 20, fontWeight: 'bold'},
  uploadText: {color: '#FFF', fontSize: 18},

  flipButton: {
    flex: 0.3,
    height: 40,
    marginHorizontal: 2,
    marginBottom: 10,
    marginTop: 10,
    borderRadius: 8,
    borderColor: 'white',
    borderWidth: 1,
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

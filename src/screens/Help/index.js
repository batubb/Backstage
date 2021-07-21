import React, {Component} from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  TextInput,
  KeyboardAvoidingView,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import {observer} from 'mobx-react';
import {Loading, Header, Button, MyImage} from '../../components';
import {constants} from '../../resources';
import {COLORS, SIZES} from '../../resources/theme';
import {StackActions} from '@react-navigation/native';
import * as ImagePicker from 'react-native-image-picker';
import {createThumbnail} from 'react-native-create-thumbnail';
import {makeid} from '../../lib';
import {Icon} from 'react-native-elements';
import Video from 'react-native-video';
import {createFeedback} from '../../services';
import storage from '@react-native-firebase/storage';

const {width, height} = Dimensions.get('window');

class Help extends Component {
  constructor(props) {
    super(props);
    this.state = {
      uid: makeid(40, 'uuid'),
      loading: true,
      refreshing: false,
      type: props.route.params.type,
      message: '',
      media: [],
      previewMedia: null,
    };
  }

  componentDidMount = async () => {
    this.setState({loading: false});
    this.subscribe = this.props.navigation.addListener('beforeRemove', (e) => {
      if (this.state.message !== '' || this.state.media.length > 0) {
        e.preventDefault();

        Alert.alert(
          'You have an unsent message, would you like to send it before leaving?',
          undefined,
          [
            {
              text: 'Send',
              onPress: async () => {
                await this.sendMessage();
                this.props.navigation.dispatch(e.data.action);
              },
            },
            {
              text: 'Discard',
              style: 'destructive',
              onPress: () => this.props.navigation.dispatch(e.data.action),
            },
            {
              text: 'Cancel',
              style: 'cancel',
            },
          ],
        );
      }
    });
  };

  sendMessage = async () => {
    if (this.state.loading) {
      return;
    }
    this.setState({loading: true});
    const {uid, media, message, type} = this.state;

    if (media.length > 0) {
      for (let i = 0; i < media.length; i++) {
        const mediaData = media[i];

        media[i].url = await this.uploadMedia(mediaData);

        if (mediaData.type === 'video') {
          media[i].thumbnailUrl = await this.uploadMedia({
            uid: mediaData.uid,
            uri: mediaData.thumbnail,
            type: 'image',
          });
        }
      }
    }

    try {
      await createFeedback(
        uid,
        type,
        message,
        media.map((item) => ({
          uid: item.uid,
          url: item.url,
          thumbnailUrl: item.thumbnailUrl,
        })),
      );

      Alert.alert('Thank you for your feedback!', undefined, [
        {title: 'Okay', style: 'cancel'},
      ]);
      this.setState({message: '', media: []});
      this.props.navigation.dispatch(StackActions.pop());
    } catch (error) {
      return Alert.alert('Oops', constants.ERROR_ALERT_MSG, [{text: 'Okay'}]);
    }

    this.setState({loading: false});
  };

  uploadMedia = async (item) => {
    const mediaRef = await storage()
      .ref()
      .child(
        `feedbacks/${this.state.uid}/${item.uid}.${
          item.type === 'video' ? 'mp4' : 'jpg'
        }`,
      );
    await mediaRef.putFile(item.uri);
    return await mediaRef.getDownloadURL();
  };

  selectMediaFromRoll = () => {
    ImagePicker.launchImageLibrary({mediaType: 'mixed'}, async (result) => {
      if (!result.didCancel) {
        if (result.duration > 60) {
          return Alert.alert(
            'You can not upload a video longer than 1 minute.',
            [{text: 'Okay'}],
          );
        }
        const uid = makeid(40, 'uuid');
        const thumbnail =
          typeof result.duration !== 'undefined'
            ? await createThumbnail({url: result.uri, timeStamp: 10000})
            : {path: result.uri};
        this.setState({
          media: this.state.media.concat([
            {
              uid,
              thumbnail: thumbnail.path,
              uri: result.uri,
              type: result.type ?? 'video',
            },
          ]),
        });
      }
    });
  };

  removeSelectedMedia = (uid) => {
    this.setState({
      media: this.state.media.filter((item) => item.uid !== uid),
      previewMedia: null,
    });
  };

  renderSelectedMedia = (item) => {
    return (
      <TouchableOpacity onPress={() => this.setState({previewMedia: item})}>
        <MyImage photo={item.thumbnail} style={{width: 100, height: 150}} />
        {item.type === 'video' ? (
          <View
            style={{
              position: 'absolute',
              justifyContent: 'center',
              alignSelf: 'center',
              width: 100,
              height: 150,
            }}>
            <Icon name={'play'} color="#FFF" type="font-awesome-5" size={22} />
          </View>
        ) : null}
      </TouchableOpacity>
    );
  };

  render() {
    const {
      loading,
      refreshing,
      type,
      message,
      media,
      previewMedia,
    } = this.state;

    if (previewMedia !== null) {
      return (
        <View style={{flex: 1, backgroundColor: constants.BACKGROUND_COLOR}}>
          <Header
            title="Attached Media"
            leftButtonPress={() => this.setState({previewMedia: null})}
            leftButtonIcon="chevron-left"
            rightButtonIcon={null}
            rightButtonText="Delete"
            rightButtonPress={() => this.removeSelectedMedia(previewMedia.uid)}
          />
          {previewMedia.type === 'video' ? (
            <Video
              source={{uri: previewMedia.uri}}
              style={{flex: 1, width}}
              repeat
            />
          ) : (
            <MyImage
              photo={previewMedia.uri}
              style={{
                position: 'relative',
                flex: 1,
                width,
                resizeMode: 'contain',
              }}
            />
          )}
        </View>
      );
    }

    return (
      <View style={{flex: 1, backgroundColor: constants.BACKGROUND_COLOR}}>
        <Header
          title={type}
          leftButtonPress={() =>
            this.props.navigation.dispatch(StackActions.pop())
          }
          leftButtonIcon="chevron-left"
          rightButtonIcon={null}
          rightButtonText="Send"
          rightButtonPress={
            !loading && (message !== '' || media.length > 0)
              ? () => this.sendMessage()
              : null
          }
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
          <KeyboardAvoidingView
            behavior="padding"
            keyboardVerticalOffset={10}
            style={{flex: 1}}>
            <ScrollView
              refreshControl={
                <RefreshControl refreshing={refreshing} tintColor="white" />
              }
              style={{flex: 1}}>
              <TextInput
                placeholder={
                  type === 'Ask a Question'
                    ? 'Your question..'
                    : 'Briefly explain what could improve..'
                }
                style={{
                  fontFamily:
                    Platform.OS === 'ios' ? 'Avenir' : 'sans-serif-condensed',
                  margin: SIZES.padding,
                  padding: SIZES.padding,
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: 14,
                  backgroundColor: COLORS.backgroundColor,
                  minHeight: height * 0.25 < 150 ? 150 : height * 0.25,
                }}
                underlineColorAndroid="transparent"
                multiline={true}
                autoFocus={true}
                onChangeText={(message) => this.setState({message})}
                value={message}
                placeholderTextColor="gray"
              />
            </ScrollView>
            <View style={{justifyContent: 'flex-end'}}>
              {media.length > 0 ? (
                <FlatList
                  data={media}
                  keyExtractor={(item) => item.uid}
                  renderItem={({item}) => this.renderSelectedMedia(item)}
                  horizontal={true}
                  showsHorizontalScrollIndicator={false}
                  style={{
                    height: 150,
                    marginBottom: SIZES.padding,
                  }}
                  contentContainerStyle={{
                    paddingHorizontal: SIZES.padding * 2,
                  }}
                />
              ) : null}
              <Button
                text={'Upload\nScreenshot or Recording'}
                onPress={() => this.selectMediaFromRoll()}
                secondary
                leftIconProps={{
                  size: 26,
                  name: 'images-sharp',
                  color: '#FFF',
                  type: 'ionicon',
                }}
                textStyle={{
                  paddingTop: SIZES.spacing,
                  textAlign: 'center',
                }}
                buttonStyle={{
                  width: 200,
                  flexDirection: 'column',
                  alignSelf: 'center',
                  marginBottom: SIZES.padding,
                }}
              />
            </View>
          </KeyboardAvoidingView>
        )}
      </View>
    );
  }
}

export default observer(Help);

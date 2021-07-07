/* eslint-disable react/no-did-mount-set-state */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React, {Component} from 'react';
import {
  View,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import {observer} from 'mobx-react';
import {Icon} from 'react-native-elements';
import {
  Loading,
  Header,
  Text,
  MyImage,
  Button,
  VerifiedIcon,
} from '../../components';
import {constants} from '../../resources';
import {getUserPosts} from '../../services';
import Store from '../../store/Store';
import {timeDifference, generateStreamToken, makeid} from '../../lib';
import {StackActions} from '@react-navigation/native';
import database from '@react-native-firebase/database';
import PostsCard from '../../components/ScreenComponents/ProfileComponents/PostsCard/PostsCard';
import {
  OverlayProvider as ChatOverlayProvider,
  Channel,
  MessageList,
  Streami18n,
  Chat as StreamChatComponent,
  MessageInput,
} from 'stream-chat-react-native';
import {StreamChat} from 'stream-chat';
import jwt from 'react-native-pure-jwt';
import {getBottomSpace, getStatusBarHeight} from '../../lib/iPhoneXHelper';
import { COLORS } from '../../resources/theme';

const {width} = Dimensions.get('window');

const streami18n = new Streami18n({
  language: 'en',
});

class Chat extends Component {
  constructor(props) {
    super(props);
    this.state = {
      offset: 0,
      limit: 7,
      loading: true,
      refreshing: false,
      endReached: false,
      user: this.props.route.params.user,
      general: true,
      comments: [],
      comment: '',
      reply: null,
      posts: [],
      anonymus: this.props.route.params.anonymus,
      subscribtion: null,
      optionsVisible: false,
      optionsList: [],
      emojies: [],
      theme: {
        avatar: {
          image: {
            height: 70,
            width: 70,
          },
        },
        colors: {
          accent_blue: COLORS.primary,
          accent_green: '#20E070',
          accent_red: constants.RED,
          bg_gradient_end: COLORS.backgroundColor,
          bg_gradient_start: COLORS.backgroundColor,
          black: COLORS.white,
          blue_alice: COLORS.black,
          border: COLORS.black,
          grey: COLORS.gray,
          grey_gainsboro: COLORS.systemFill,
          grey_whisper: COLORS.quaternaryLabel,
          icon_background: '#FFFFFF',
          modal_shadow: COLORS.secondaryBackgroundColor,
          overlay: '#00000066',
          overlay_dark: '#FFFFFFCC',
          shadow_icon: '#00000080',
          targetedMessageBackground: '#302D22',
          transparent: 'transparent',
          white: COLORS.black,
          white_smoke: COLORS.secondaryBackgroundColor,
          white_snow: COLORS.backgroundColor,
        },
        imageGallery: {
          blurType: 'dark',
        },
        spinner: {
          height: 30,
          width: 30,
        },
      },
    };
  }

  componentDidMount = async () => {
    const subscribtion =
      Store.uid !== this.state.user.uid
        ? await checkSubscribtion(Store.uid, this.state.user.uid)
        : {subscribtion: true};

    if (subscribtion.subscribtion === true) {
      const posts = await getUserPosts(this.state.user.uid);
      this.setState({posts, subscribtion});

      this.streamServerClient = StreamChat.getInstance(
        constants.STREAM_API_KEY,
      );

      await database()
        .ref('users')
        .child(this.state.user.uid)
        .once('value', async (snap) => {
          snap = snap.toJSON();

          const streamUserUid = snap.streamUserUid ?? makeid(40);
          const token = await jwt.sign(
            {
              user_id: streamUserUid,
            },
            streamUserUid,
            {
              alg: 'HS256',
            },
          );
          const user = {
            id: streamUserUid,
            uid: snap.uid,
            name: snap.name,
            username: snap.username,
            role: 'user',
            image: snap.photo,
          };
          this.streamServerClient
            .connectUser(user, token)
            .then(async (streamUserData) => {
              if (snap.streamUserUid !== streamUserUid) {
                if (Store.user.uid === snap.uid) {
                  Store.setUser({...Store.user, streamUserUid});
                }
                await database()
                  .ref('users')
                  .child(snap.uid)
                  .update({streamUserUid});
              }

              if (!snap.streamChannelUid) {
                const streamChannelUid = makeid(40);
                this.channel = this.streamServerClient.channel(
                  'messaging',
                  streamChannelUid,
                  {
                    name: streamChannelUid,
                  },
                );
                await this.channel.create();

                if (snap.streamChannelUid !== streamChannelUid) {
                  if (Store.user.uid === snap.uid) {
                    Store.setUser({...Store.user, streamChannelUid});
                  }
                  await database()
                    .ref('users')
                    .child(snap.uid)
                    .update({streamChannelUid});
                }
              } else {
                this.channel = this.streamServerClient.getChannelById(
                  'messaging',
                  snap.streamChannelUid,
                );
              }

              const {members} = await this.channel.queryMembers({
                id: snap.streamUserUid,
              });
              if (
                !members.some((member) => member.user_id === snap.streamUserUid)
              ) {
                await this.channel.addMembers([snap.streamUserUid]);
              }
              this.watchChannel();
            })
            .catch((error) => {
              console.log(error);
              Alert.alert('Oops', constants.ERROR_ALERT_MSG, [{text: 'Okay'}]);
              this.setState({loading: false});
            });
        });
    }
  };

  componentWillUnmount = async () => {
    if (this.channel) {
      await this.channel.stopWatching();
    }
    await this.streamServerClient.disconnectUser();
  };

  watchChannel = async () => {
    const channelState = await this.channel.watch();
    this.setState({loading: false});
  };

  goTo = (route, info = null) => {
    if (route === 'Comments') {
      const replaceActions = StackActions.push(route, {
        video: info,
        anonymus: this.state.anonymus,
      });
      return this.props.navigation.dispatch(replaceActions);
    } else if (route === 'UserProfile') {
      const replaceActions = StackActions.push(route, {user: info});
      return this.props.navigation.dispatch(replaceActions);
    }
  };

  renderComments = () => {
    return (
      <ChatOverlayProvider
        i18nInstance={streami18n}
        value={{style: this.state.theme}}
        bottomInset={getBottomSpace()}>
        <SafeAreaView style={{flex: 1, backgroundColor: this.state.theme.colors.white}}>
          <StreamChatComponent
            client={this.streamServerClient}
            i18nInstance={streami18n}>
            <Channel
              channel={this.channel}
              keyboardVerticalOffset={getStatusBarHeight()}>
              <View style={{flex: 1}}>
                <MessageList
                  onThreadSelect={(thread) => {
                    console.log(thread);
                  }}
                />
                <MessageInput />
              </View>
            </Channel>
          </StreamChatComponent>
        </SafeAreaView>
      </ChatOverlayProvider>
    );
  };

  renderPosts = () => {
    return (
      <PostsCard
        onPress={(item) => this.goTo('Comments', item)}
        posts={this.state.posts}
        numCols={3}
      />
    );
  };

  renderProfileTop = (user = this.state.user) => {
    return (
      <View
        style={{
          width: width,
          flexDirection: 'row',
          padding: 15,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        <TouchableOpacity onPress={() => this.goTo('UserProfile', user)}>
          <MyImage
            style={{width: 50, height: 50, borderRadius: 25}}
            photo={user.photo}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => this.goTo('UserProfile', user)}>
          <View style={{marginLeft: 10, width: 100, flexDirection: 'row'}}>
            <Text text={user.username} />
            {user.verified === true ? <VerifiedIcon size={14} /> : null}
          </View>
        </TouchableOpacity>
        <Button
          buttonStyle={{
            width: (width - 200) / 2 - 5,
            backgroundColor: this.state.general
              ? '#FFF'
              : constants.BACKGROUND_COLOR,
            borderWidth: 1,
            borderColor: '#FFF',
            padding: 5,
            borderRadius: 16,
          }}
          textStyle={{
            color: this.state.general ? constants.BACKGROUND_COLOR : '#FFF',
            fontSize: 12,
          }}
          text="Main"
          onPress={() => this.setState({general: true})}
        />
        <Button
          buttonStyle={{
            width: (width - 200) / 2 - 5,
            backgroundColor: this.state.general
              ? constants.BACKGROUND_COLOR
              : '#FFF',
            borderWidth: 1,
            borderColor: '#FFF',
            padding: 5,
            borderRadius: 16,
          }}
          textStyle={{
            color: this.state.general ? '#FFF' : constants.BACKGROUND_COLOR,
            fontSize: 12,
          }}
          text="Content"
          onPress={() => this.setState({general: false})}
        />
      </View>
    );
  };

  render() {
    const {
      loading,
      general,
      optionsVisible,
      optionsList,
      isBanned,
      subscribtion,
    } = this.state;
    return (
      <View style={{flex: 1, backgroundColor: constants.BACKGROUND_COLOR}}>
        <Header
          title="Room"
          leftButtonPress={() =>
            this.props.navigation.dispatch(StackActions.pop())
          }
          leftButtonIcon="chevron-left"
        />
        {this.renderProfileTop()}
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
        ) : !subscribtion.subscribtion && !isBanned ? (
          Alert.alert('Oops', 'You must be a member to view the content.', [
            {text: 'Okay'},
          ])
        ) : general ? (
          this.renderComments()
        ) : (
          this.renderPosts()
        )}
      </View>
    );
  }
}

export default observer(Chat);

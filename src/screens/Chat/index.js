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
  KeyboardAvoidingView,
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
import {getUserPosts, checkSubscribtion} from '../../services';
import Store from '../../store/Store';
import {isAdmin, makeid} from '../../lib';
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
  Thread as StreamThreadComponent,
  MessageSimple,
  Message,
  MessageFooter,
  MessageAvatar,
} from 'stream-chat-react-native';
import {StreamChat} from 'stream-chat';
import jwt from 'react-native-pure-jwt';
import {getBottomSpace, getStatusBarHeight} from '../../lib/iPhoneXHelper';
import {COLORS, SIZES, STREAM_THEME} from '../../resources/theme';

const {width, height} = Dimensions.get('window');

class Chat extends Component {
  constructor(props) {
    super(props);
    this.state = {
      thread: null,
      loading: true,
      refreshing: false,
      user: this.props.route.params.user,
      general: true,
      posts: [],
      anonymus: this.props.route.params.anonymus,
      subscribtion: null,
    };
  }

  componentDidMount = async () => {
    const subscribtion =
      Store.uid !== this.state.user.uid && !isAdmin(Store.user) && !isAdmin(this.state.user)
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
        .child(Store.user.uid)
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
            username: snap.username,
            role: 'user',
            image: snap.photo,
            verified: snap.verified === true,
          };
          this.streamServerClient
            .connectUser(user, token)
            .then(async (streamUserData) => {
              this.streamUserData = streamUserData;

              if (snap.streamUserUid !== streamUserUid) {
                if (Store.user.uid === snap.uid) {
                  Store.setUser({...Store.user, streamUserUid});
                }
                await database()
                  .ref('users')
                  .child(snap.uid)
                  .update({streamUserUid});
              }

              if (!this.state.user.streamChannelUid) {
                await database()
                  .ref('users')
                  .child(this.state.user.uid)
                  .once('value', async (influencerSnap) => {
                    influencerSnap = influencerSnap.toJSON();

                    if (!influencerSnap.streamChannelUid) {
                      const streamChannelUid = makeid(40);
                      this.channel = this.streamServerClient.channel(
                        'messaging',
                        streamChannelUid,
                        {
                          name: streamChannelUid,
                        },
                      );
                      await this.channel.create();

                      if (
                        influencerSnap.streamChannelUid !== streamChannelUid
                      ) {
                        if (Store.user.uid === influencerSnap.uid) {
                          Store.setUser({...Store.user, streamChannelUid});
                        }
                        await database()
                          .ref('users')
                          .child(influencerSnap.uid)
                          .update({streamChannelUid});
                      }
                    } else {
                      this.channel = await this.streamServerClient.getChannelById(
                        'messaging',
                        influencerSnap.streamChannelUid,
                      );
                    }
                  });
              } else {
                this.channel = await this.streamServerClient.getChannelById(
                  'messaging',
                  this.state.user.streamChannelUid,
                );
              }

              const {members} = await this.channel.queryMembers({
                id: snap.streamUserUid,
              });
              if (
                !members.some(
                  (member) => member.user_id === streamUserData.me.id,
                )
              ) {
                await this.channel.addMembers([streamUserData.me.id]);
              }
              this.watchChannel();
            })
            .catch((error) => {
              console.log(error);
              Alert.alert('Oops', constants.ERROR_ALERT_MSG, [{text: 'Okay'}]);
              this.setState({loading: false});
            });
        });
    } else {
      this.setState({loading: false, subscribtion});
    }

    this._unsubscribe = this.props.navigation.addListener('focus', async () => {
      await this.setState({thread: null});
    });
  };

  componentWillUnmount = async () => {
    this._unsubscribe();

    if (this.state.thread === null) {
      if (this.channel) {
        await this.channel.stopWatching();
      }
      if (this.streamServerClient) {
        await this.streamServerClient.disconnectUser();
      }
    }
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
      const replaceActions = StackActions.push(route, {
        user: info,
        onGoToChatPressed: () =>
          this.props.navigation.dispatch(StackActions.pop()),
      });
      return this.props.navigation.dispatch(replaceActions);
    } else if (route === 'Subscribe') {
      const replaceActions = StackActions.push(route, {
        influencer: this.state.user,
        posts: this.state.posts,
      });
      return this.props.navigation.dispatch(replaceActions);
    } else if (route === 'ChatThread') {
      this.setState({thread: info}, () => {
        const replaceActions = StackActions.push(route, {
          thread: info,
          influencer: this.state.user,
          channel: this.channel,
          streamServerClient: this.streamServerClient,
        });
        return this.props.navigation.dispatch(replaceActions);
      });
    }
  };

  renderChat = () => {
    const {thread} = this.state;

    return (
      <SafeAreaView
        style={{flex: 1, backgroundColor: STREAM_THEME.colors.white}}>
        <KeyboardAvoidingView
          behavior="padding"
          keyboardVerticalOffset={85 + getBottomSpace()}>
          <StreamChatComponent
            client={this.streamServerClient}
            i18nInstance={constants.STREAM_I18N}>
            <Channel
              channel={this.channel}
              keyboardVerticalOffset={getStatusBarHeight()}
              thread={thread}
              hasFilePicker={false}
              MessageAvatar={(props) => {
                return (
                  <View
                    style={{
                      height: '100%',
                      paddingTop: SIZES.padding,
                      alignItems: 'center',
                    }}>
                    <MessageAvatar {...props} />
                  </View>
                );
              }}
              MessageHeader={(props) =>
                props.message.user.uid === Store.user.uid ? null : (
                  <View
                    style={{
                      flexDirection: 'row',
                      width: '100%',
                      justifyContent:
                        props.message.user.uid === Store.user.uid
                          ? 'flex-end'
                          : 'flex-start',
                      alignItems: 'center',
                      marginVertical: SIZES.spacing,
                    }}>
                    <Text
                      text={`${props.message.user.username}`}
                      style={{
                        color: STREAM_THEME.colors.black,
                        opacity: 0.4,
                        fontSize: 10,
                      }}
                    />
                    {props.message.user.verified === true ? (
                      <VerifiedIcon
                        size={10}
                        style={{paddingBottom: SIZES.spacing}}
                      />
                    ) : null}
                  </View>
                )
              }>
              <View style={{flex: 1}}>
                <MessageList
                  onThreadSelect={(thread) => this.goTo('ChatThread', thread)}
                />
                <MessageInput />
              </View>
            </Channel>
          </StreamChatComponent>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  };

  renderSubscribe = () => {
    return (
      <View
        style={{
          width: '100%',
          flex: 1,
          paddingHorizontal: width * 0.1,
          marginBottom: height * 0.15,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Text
          text={`You must be a member to join ${this.state.user.username}'s room.`}
          style={{
            fontSize: 24,
            color: COLORS.white,
            fontWeight: 'bold',
            marginTop: SIZES.padding * 2,
            textAlign: 'center',
          }}
        />
        <Button
          text={`Subscribe`}
          buttonStyle={{
            backgroundColor: COLORS.primary,
            width: '100%',
            marginTop: SIZES.padding * 3,
          }}
          textStyle={{color: COLORS.white, fontSize: 16}}
          onPress={() => this.goTo('UserProfile', this.state.user)}
        />
      </View>
    );
  };

  render() {
    const {loading, general, subscribtion, user} = this.state;

    return (
      <View style={{flex: 1, backgroundColor: constants.BACKGROUND_COLOR}}>
        <Header
          centerComponent={
            <TouchableOpacity
              style={{
                width: width - 120,
                flexDirection: 'row',
                justifyContent: 'flex-start',
                alignSelf: 'center',
              }}
              onPress={() => this.goTo('UserProfile', user)}>
              <MyImage
                photo={user.photo}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 25,
                  marginRight: SIZES.spacing * 2,
                }}
              />
              <View style={{flexDirection: 'column'}}>
                <Text
                  text={
                    user.name.length > 22
                      ? user.name.substring(0, 22) + '...'
                      : user.name
                  }
                  style={{fontSize: 18}}
                />
                <View style={{flexDirection: 'row'}}>
                  <Text
                    text={user.username}
                    style={{
                      fontSize: 15,
                      color: COLORS.gray,
                      paddingLeft: 1,
                      paddingTop: 1,
                    }}
                  />
                  {user.verified === true ? <VerifiedIcon size={15} /> : null}
                </View>
              </View>
            </TouchableOpacity>
          }
          leftButtonPress={() =>
            this.props.navigation.dispatch(StackActions.pop())
          }
          leftButtonIcon="chevron-left"
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
        ) : !subscribtion.subscribtion ? (
          this.renderSubscribe()
        ) : general ? (
          this.renderChat()
        ) : (
          this.renderPosts()
        )}
      </View>
    );
  }
}

export default observer(Chat);

/* eslint-disable react/no-did-mount-set-state */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React, {Component} from 'react';
import {
  View,
  Dimensions,
  FlatList,
  TouchableOpacity,
  TextInput,
  Platform,
  SafeAreaView,
  KeyboardAvoidingView,
  Alert,
  ActivityIndicator,
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
  Options,
} from '../../components';
import {constants} from '../../resources';
import {
  getUserPosts,
} from '../../services';
import Store from '../../store/Store';
import {followerCount, timeDifference} from '../../lib';
import {StackActions} from '@react-navigation/native';
import database from '@react-native-firebase/database';
import PostsCard from '../../components/ScreenComponents/ProfileComponents/PostsCard/PostsCard';
import {
  sendBirdCreateChannel,
  sendBirdEnterChannel,
  sendBirdLeaveChannel,
  startSendBirdChannelHandler,
  sendMessageToSendBirdChannel,
  loadSendBirdChannelMessages,
  SENDBIRD_MESSAGE_CALLBACK_TYPES,
  banUserFromSendBirdChannel,
  getDefaultEmojisFromSendBird,
  sendbird,
} from '../../services/connectSendbird';
import {COLORS, SIZES} from '../../resources/theme';
import UserMessage from '../../components/ScreenComponents/ChatComponents/UserMessage/UserMessage';
import AdminMessage from '../../components/ScreenComponents/ChatComponents/AdminMessage/AdminMessage';
import User from '../../components/ScreenComponents/ChatComponents/User/User';

const {width} = Dimensions.get('window');

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
      isBanned: false,
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
    };
    this.roomConnection = null;
    this.roomConnectionActions = null;
    this.channelHandler = null;
    this.clearChannelHandler = null;
    this.scrollToEnd = true;
  }

  componentDidMount = async () => {
    const subscribtion =
      Store.uid !== this.state.user.uid
        ? await checkSubscribtion(Store.uid, this.state.user.uid)
        : {subscribtion: true};

    if (subscribtion.subscribtion === true) {
      const posts = await getUserPosts(this.state.user.uid);
      this.setState({posts, subscribtion});

      if (this.state.user.sendbirdRoomUrl) {
        this.joinGroup();
      } else {
        await database()
          .ref('users')
          .child(this.state.user.uid)
          .once('value', (user) => {
            user = user.toJSON();
            if (user.sendbirdRoomUrl) {
              if (Store.uid === this.state.user.uid) {
                Store.setUser(user);
              }
              this.setState({user}, () => this.joinGroup());
            } else {
              sendBirdCreateChannel(user)
                .then((groupChannelUrl) => {
                  const update = {
                    sendbirdRoomUrl: groupChannelUrl,
                  };
                  if (Store.uid === this.state.user.uid) {
                    Store.setUser({...user, ...update});
                  }
                  this.setState(
                    {
                      user: {...user, ...update},
                    },
                    () => this.joinGroup(),
                  );
                })
                .catch((error) => {
                  Alert.alert('Oops', constants.ERROR_ALERT_MSG, [
                    {text: 'Okay'},
                  ]);
                  this.setState({loading: false});
                });
            }
          });
      }
    }
  };

  joinGroup = () => {
    sendBirdEnterChannel(this.state.user.sendbirdRoomUrl)
      .then((channelConnection) => {
        this.roomConnection = channelConnection;
        this.loadMessages();
        this.messageListener();
      })
      .catch((error) => {
        console.log(error);
        if (error?.code === 900100) {
          this.setState({isBanned: true});
          Alert.alert('Oops', constants.CHAT_CANNOT_JOIN_BANNED_MESSAGE, [
            {text: 'Okay'},
          ]);
        } else {
          Alert.alert('Oops', constants.ERROR_ALERT_MSG, [{text: 'Okay'}]);
        }
      })
      .finally(() => this.setState({loading: false}));
  };

  messageListener = () => {
    getDefaultEmojisFromSendBird()
      .then((data) => {
        this.setState({
          emojies: data?.[0]?.emojis ?? [],
        });
      })
      .catch((error) =>
        Alert.alert('Oops', constants.ERROR_ALERT_MSG, [{text: 'Okay'}]),
      );

    const [channelHandler, clearChannelHandler] = startSendBirdChannelHandler(
      this.roomConnection.url,
      async (type, channel, message) => {
        this.roomConnectionActions = channel;
        switch (type) {
          case SENDBIRD_MESSAGE_CALLBACK_TYPES.RECEIVE:
            await this.buildMessages([message]);

            if (this.scrollToEnd) {
              this.commentsFlatListRef?.scrollToEnd();
            }
            break;

          case SENDBIRD_MESSAGE_CALLBACK_TYPES.DELETE:
            const comments = this.state.comments.filter(
              (comment) => comment.messageId !== message.messageId,
            );
            this.setState({comments});
            break;

          case SENDBIRD_MESSAGE_CALLBACK_TYPES.BAN:
            if (message.userId === Store.user.uid) {
              this.clearChannelHandler();
              sendBirdLeaveChannel(this.roomConnection);
              this.roomConnection = null;
              this.setState({isBanned: true, comments: []});
              Alert.alert('Oops', constants.CHAT_IN_BANNED_MESSAGE, [
                {text: 'Okay'},
              ]);
            }
            break;

          default:
            break;
        }
      },
    );
    this.channelHandler = channelHandler;
    this.clearChannelHandler = () => clearChannelHandler();
  };

  loadMessages = async (scrollToEnd = true) => {
    const {offset, limit, refreshing, endReached} = this.state;
    if (refreshing || endReached) {
      this.scrollToEnd = false;
      return;
    }
    this.scrollToEnd = scrollToEnd;
    this.setState({refreshing: true});

    loadSendBirdChannelMessages(this.roomConnection, offset, limit, false)
      .then(async (messages) => {
        await this.buildMessages(messages);

        if (this.state.comments.length === (offset + 1) * limit) {
          this.setState({offset: offset + 1});
        } else {
          this.setState({endReached: true});
        }
      })
      .catch((error) => {
        Alert.alert('Oops', constants.ERROR_ALERT_MSG, [{text: 'Okay'}]);
      })
      .finally(() => this.setState({refreshing: false}));
  };

  buildMessages = async (messagesData) => {
    let comments = [...this.state.comments];

    messagesData.forEach(async (messageData) => {
      if (
        comments.some((comment) => comment.messageId === messageData.messageId)
      ) {
        comments = comments.filter(
          (comment) => comment.messageId !== messageData.messageId,
        );
      }
      const constantCommentData = {
        comment: messageData.message,
        replies: [],
        createdTimestampt: messageData.createdAt,
        updatedTimestampt: messageData.updatedAt,
        isOperator: messageData.isOperatorMessage === true,
        messageId: messageData.messageId,
        nativeMessageObject: messageData,
      };
      if (messageData.messageType === 'admin') {
        comments.push({
          user: {
            username: 'Admin Announcement',
            photo: '',
            role: '',
          },
          ...constantCommentData,
          isAdmin: true,
        });
        return;
      }
      if (messageData.isOperatorMessage === true) {
        comments.push({
          user: {
            username: messageData._sender.nickname,
            photo: messageData._sender.plainProfileUrl ?? '',
            role: messageData._sender.role ?? '',
          },
          ...constantCommentData,
        });
        return;
      }
      if (Store.user.uid === messageData._sender.userId) {
        comments.push({
          user: {
            ...Store.user,
            username: Store.user.username,
            photo: Store.user.photo,
          },
          ...constantCommentData,
        });
        return;
      }
      await database()
        .ref('users')
        .child(messageData._sender.userId)
        .once('value', (user) => {
          user = user?.toJSON();

          if (user) {
            comments.push({
              user,
              ...constantCommentData,
            });
          }
        });
    });

    this.setState({
      comments: await comments.sort((a, b) => b.timestamp - a.timestamp),
    });
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

  componentWillUnmount = () => {
    if (this.roomConnection !== null) {
      sendBirdLeaveChannel(this.roomConnection);
    }
    if (this.clearChannelHandler !== null) {
      this.clearChannelHandler();
    }
  };

  showReplyTab = (reply, set = true) => {
    if (set) {
      this.textinput.focus();
      this.setState({comment: `@${reply.user.username} `});
    } else {
      this.setState({comment: ''});
    }

    this.setState({reply});
  };

  seeThread = (item, index) => {
    var comments = this.state.comments;
    comments[index].showReply = !item.showReply;
    this.setState({comments});
  };

  likeComment = async (messageData) => {};

  banUser = async (messageData) => {
    banUserFromSendBirdChannel(this.roomConnection, messageData.user.uid)
      .then(() => {
        this.setState({optionsList: [], optionsVisible: false});
        Alert.alert(
          'Success',
          `${messageData.user.username} has been successfully banned.`,
          [{text: 'Okay'}],
        );
      })
      .catch((error) =>
        Alert.alert('Oops', constants.ERROR_ALERT_MSG, [{text: 'Okay'}]),
      );
  };

  muteUser = async (messageData) => {};

  deleteComment = async (messageData) => {
    this.roomConnection.deleteMessage(
      messageData.nativeMessageObject,
      (deletedMessage, error) => {
        this.setState({optionsList: [], optionsVisible: false});
        if (error) {
          Alert.alert('Oops', constants.ERROR_ALERT_MSG, [{text: 'Okay'}]);
          return;
        }
      },
    );
  };

  // TODO: Send reply comment.
  sendComment = async () => {
    if (!this.state.reply) {
      sendMessageToSendBirdChannel(this.state.comment, this.roomConnection)
        .then((message) => {
          this.buildMessages([message]);
        })
        .catch((error) =>
          Alert.alert('Oops', constants.ERROR_ALERT_MSG, [{text: 'Okay'}]),
        );
    }
    this.setState({comment: '', reply: null});
  };

  showOptions = (messageData) => {
    const constantOptionsList = [
      {title: 'Like', onPress: () => this.likeComment(messageData)},
    ];
    const myOptionsList = [
      ...constantOptionsList,
      {
        title: 'Delete Message',
        onPress: () => this.deleteComment(messageData),
      },
    ];
    const adminOptionsList = [
      ...myOptionsList,
      {
        title: 'Mute User',
        onPress: () => this.muteUser(messageData),
        color: constants.RED,
      },
      {
        title: 'Ban User',
        onPress: () => this.banUser(messageData),
        color: constants.RED,
      },
    ];
    const optionsList =
      !messageData.isOperator &&
      !messageData.isAdmin ?
        (messageData.user.uid === Store.user.uid && this.state.user.uid !== Store.user.uid)
          ? myOptionsList
          : this.state.user.uid === Store.user.uid
            ? adminOptionsList
            : constantOptionsList
        : constantOptionsList;

    this.setState({
      optionsVisible: true,
      optionsList,
    });
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

  commentBar = () => {
    const {comment, reply} = this.state;

    return (
      <View
        style={{
          alignItems: 'center',
          width: width,
          backgroundColor: constants.BACKGROUND_COLOR,
          paddingVertical: 10,
        }}>
        {reply ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: width - 40,
              paddingVertical: 5,
            }}>
            <Text
              text={`Reply to ${reply.user.username}`}
              style={{color: 'gray', fontWeight: 'normal'}}
            />
            <TouchableOpacity onPress={() => this.showReplyTab(null, false)}>
              <View style={{padding: 5}}>
                <Icon
                  name="close"
                  color="gray"
                  type="material-community"
                  size={16}
                />
              </View>
            </TouchableOpacity>
          </View>
        ) : null}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: width - 20,
            borderRadius: 4,
            backgroundColor: constants.BAR_COLOR,
          }}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <TextInput
              ref={(input) => (this.textinput = input)}
              placeholder="Add a comment"
              style={{
                fontFamily:
                  Platform.OS === 'ios' ? 'Avenir' : 'sans-serif-condensed',
                color: '#FFF',
                width: width - 110,
                fontSize: 16,
                padding: 10,
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
    );
  };

  isCloseToBottom = ({layoutMeasurement, contentOffset, contentSize}) => {
    return (
      layoutMeasurement.height + contentOffset.y >= contentSize.height - 70
    );
  };

  renderComments = () => {
    const {refreshing, comments, endReached, isBanned} = this.state;

    return (
      <SafeAreaView style={{width, alignItems: 'center', flex: 1}}>
        <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={170}>
          <FlatList
            ref={(ref) => (this.commentsFlatListRef = ref)}
            data={comments}
            inverted={comments.length > 0}
            onScroll={({nativeEvent}) => {
              if (
                this.isCloseToBottom(nativeEvent) &&
                this.scrollToEnd === false
              ) {
                this.scrollToEnd = true;
              } else if (this.scrollToEnd === false) {
                this.scrollToEnd = false;
              }
            }}
            onEndReachedThreshold={0.5}
            onEndReached={() => this.loadMessages(false)}
            ListHeaderComponentStyle={{flexGrow: 1}}
            ListHeaderComponent={
              <>
                {refreshing && !endReached ? (
                  <ActivityIndicator size={'large'} color={'gray'} />
                ) : null}
              </>
            }
            ListEmptyComponent={() => {
              return (
                <View
                  style={{
                    width: width,
                    alignItems: 'center',
                  }}>
                  <Text
                    text={
                      isBanned
                        ? constants.CHAT_CANNOT_JOIN_BANNED_MESSAGE
                        : 'There is no comments'
                    }
                    style={{color: 'gray', textAlign: 'center'}}
                  />
                </View>
              );
            }}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={{
              flexGrow: 1,
              // flexDirection:
              //   comments.length === 0 ? 'column' : 'column-reverse',
            }}
            renderItem={({item, index}) => {
              const propsForMessage = {
                sendbird,
                channel: this.roomConnection,
                message: item.nativeMessageObject,
                onPress: () => console.log('onPress'),
                onLongPress: () => console.log('onLongPress'),
              };

              if (item.isAdmin || item.isOperator) return <AdminMessage {...propsForMessage} />;
              else return <UserMessage {...propsForMessage} />;
            }}
          />
          {!isBanned ? this.commentBar() : null}
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  };

  renderReply = (reply, mainComment, mainCommentIndex) => {
    return (
      <FlatList
        data={reply}
        keyExtractor={(item) => item.uid}
        renderItem={({item, index}) => (
          <View
            style={{
              width: width,
              alignItems: 'flex-end',
              backgroundColor: constants.BACKGROUND_COLOR,
            }}>
            <View
              style={{
                backgroundColor: constants.BAR_COLOR,
                marginTop: 10,
                paddingTop: 10,
                paddingHorizontal: 10,
                borderTopLeftRadius: 8,
                borderBottomLeftRadius: 8,
              }}>
              <View
                style={{
                  width: width - 60,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    width: width - 110,
                    justifyContent: 'space-between',
                  }}>
                  <View style={{width: width - 110}}>
                    <View style={{flexDirection: 'row'}}>
                      <Text text={item.user.username} />
                      {item.user.verified === true ? (
                        <VerifiedIcon size={14} />
                      ) : null}
                    </View>
                    <Text
                      text={item.comment}
                      style={{fontSize: 12, fontWeight: 'normal'}}
                    />
                  </View>
                  <View
                    style={{
                      width: 60,
                      alignItems: 'flex-end',
                      paddingRight: 10,
                    }}>
                    <Text
                      text={timeDifference(item.timestamp)}
                      style={{color: 'gray', fontSize: 10}}
                    />
                  </View>
                </View>
              </View>
              <View
                style={{
                  width: width - 60,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <TouchableOpacity
                  onPress={() =>
                    this.likeComment(
                      item,
                      index,
                      item.likeStatus,
                      true,
                      mainComment,
                      mainCommentIndex,
                    )
                  }>
                  <View
                    style={{
                      paddingVertical: 10,
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                    <Icon
                      name={item.likeStatus ? 'heart' : 'heart-outline'}
                      color="#FFF"
                      type="material-community"
                      size={16}
                    />
                    {item.likeCount !== 0 ? (
                      <Text
                        text={followerCount(item.likeCount)}
                        style={{fontSize: 12, marginLeft: 5}}
                      />
                    ) : null}
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />
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
        <Options
          list={optionsList}
          visible={optionsVisible}
          cancelPress={() =>
            this.setState({optionsList: [], optionsVisible: false})
          }
        />
      </View>
    );
  }
}

export default observer(Chat);

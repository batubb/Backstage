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
  RefreshControl,
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
} from '../../components';
import {constants} from '../../resources';
import {
  sendComment,
  setLikeCommentStatus,
  shareItem,
  getUserPosts,
  checkSubscribtion,
} from '../../services';
import Store from '../../store/Store';
import {followerCount, timeDifference} from '../../lib';
import {StackActions} from '@react-navigation/native';
import database from '@react-native-firebase/database';
import LinearGradient from 'react-native-linear-gradient';
import PostsCard from '../../components/ScreenComponents/ProfileComponents/PostsCard/PostsCard';
import {
  sendBirdCreateChannel,
  sendBirdEnterChannel,
  sendBirdLeaveChannel,
  startSendBirdChannelHandler,
  sendMessageToSendBirdChannel,
  loadSendBirdChannelMessages,
} from '../../services/connectSendbird';
import {COLORS, SIZES} from '../../resources/theme';

const {width} = Dimensions.get('window');

class Chat extends Component {
  constructor(props) {
    super(props);
    this.state = {
      offset: 0,
      limit: 20,
      loading: true,
      refreshing: false,
      user: this.props.route.params.user,
      general: true,
      comments: [],
      comment: '',
      reply: null,
      posts: [],
      anonymus: this.props.route.params.anonymus,
      subscribtion: null,
    };
    this.roomConnection = null;
    this.channelHandler = null;
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
        Alert.alert('Oops', constants.ERROR_ALERT_MSG, [{text: 'Okay'}]);
      })
      .finally(() => this.setState({loading: false}));
  };

  messageListener = () => {
    this.channelHandler = startSendBirdChannelHandler(
      this.roomConnection.url,
      async (channel, message) => {
        await this.buildMessages([message]);
        this.commentsFlatListRef?.scrollToEnd();
      },
    );
  };

  loadMessages = async () => {
    const {offset, limit, refreshing} = this.state;
    if (refreshing || this.state.comments.length >= (offset + 1) * limit) {
      return;
    }
    this.setState({refreshing: true});

    loadSendBirdChannelMessages(this.roomConnection, offset, limit, false)
      .then(async (messages) => {
        await this.buildMessages(messages);

        if (this.state.comments.length >= (offset + 1) * limit) {
          this.setState({offset: offset + 1});
        }
      })
      .catch((error) => {
        Alert.alert('Oops', constants.ERROR_ALERT_MSG, [{text: 'Okay'}]);
      })
      .finally(() => this.setState({refreshing: false}));
  };

  // TODO: Set admin messages.
  buildMessages = async (messagesData) => {
    let comments = [...this.state.comments];

    messagesData.forEach(async (messageData) => {
      // if (messageData.messageType === 'admin') {
      // }

      if (
        comments.some((comment) => comment.messageId === messageData.messageId)
      ) {
        comments = comments.filter(
          (comment) => comment.messageId !== messageData.messageId,
        );
      }
      const constantCommentData = {
        comment: messageData.message,
        reply: [],
        showReply: false,
        likeStatus: false,
        likeCount: 0,
        timestampt: messageData.createdAt,
        isOperator: messageData.isOperatorMessage === true,
        messageId: messageData.messageId,
      };
      if (messageData.isOperatorMessage === true) {
        comments.push({
          user: {
            username: messageData._sender.nickname,
            photo: messageData._sender.plainProfileUrl ?? '',
            role: messageData._sender.role,
          },
          ...constantCommentData,
        });
      } else {
        if (Store.user.uid === messageData._sender.userId) {
          comments.push({
            user: {
              username: Store.user.username,
              photo: Store.user.photo,
            },
            ...constantCommentData,
          });
        } else {
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
        }
      }
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
    if (this.channelHandler !== null) {
      this.channelHandler();
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

  likeComment = async (
    item,
    index,
    status = false,
    reply = false,
    mainComment = null,
    mainCommentIndex = 0,
  ) => {
    if (!reply) {
      var comments = this.state.comments;
      comments[index].likeStatus = !item.likeStatus;

      if (item.likeStatus) {
        comments[index].likeCount = item.likeCount + 1;
      } else {
        comments[index].likeCount = item.likeCount - 1;
      }

      this.setState({comments});
    } else {
      var comments = this.state.comments;
      comments[mainCommentIndex].reply[index].likeStatus = !item.likeStatus;

      if (item.likeStatus) {
        comments[mainCommentIndex].reply[index].likeCount = item.likeCount + 1;
      } else {
        comments[mainCommentIndex].reply[index].likeCount = item.likeCount - 1;
      }

      this.setState({comments});
    }

    await setLikeCommentStatus(
      Store.user,
      this.state.user,
      item,
      status,
      reply,
      mainComment,
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

  renderComments = () => {
    const {refreshing, comments} = this.state;

    return (
      <SafeAreaView style={{width, alignItems: 'center', flex: 1}}>
        <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={170}>
          <FlatList
            ref={(ref) => (this.commentsFlatListRef = ref)}
            data={comments}
            inverted={comments.length > 0}
            onEndReachedThreshold={0.8}
            onEndReached={() => this.loadMessages()}
            ListHeaderComponent={
              <>
                {refreshing && (
                  <ActivityIndicator
                    size="large"
                    color="white"
                    style={{padding: SIZES.padding}}
                  />
                )}
              </>
            }
            ListEmptyComponent={() => {
              return (
                <View
                  style={{
                    width: width,
                    alignItems: 'center',
                  }}>
                  <Text text="There is no comments" style={{color: 'gray'}} />
                </View>
              );
            }}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={{
              flexDirection:
                comments.length === 0 ? 'column' : 'column-reverse',
            }}
            renderItem={({item, index}) => (
              <View
                style={{
                  paddingTop: 15,
                  flex: 1,
                  alignItems: 'center',
                  backgroundColor: constants.BAR_COLOR,
                  marginTop: SIZES.spacing * 3,
                  marginHorizontal: SIZES.padding,
                  paddingHorizontal: SIZES.padding,
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                  <View
                    style={{
                      flexDirection: 'column',
                      flex: 1,
                      justifyContent: 'space-between',
                    }}>
                    <View style={{flexDirection: 'row', flex: 1}}>
                      <Text
                        text={`${
                          item.isOperator === true ? 'Moderator - ' : ''
                        }${item.user.username}`}
                      />
                      {item.user.verified === true ? (
                        <VerifiedIcon size={14} />
                      ) : null}
                      {item.isOperator === true ? (
                        <VerifiedIcon size={14} color={COLORS.secondary} />
                      ) : null}
                    </View>
                    <Text
                      text={item.comment}
                      style={{fontSize: 12, fontWeight: 'normal'}}
                    />
                  </View>
                  <View style={{width: 60, alignItems: 'flex-end'}}>
                    <Text
                      text={timeDifference(item.timestamp)}
                      style={{color: 'gray', fontSize: 10}}
                    />
                  </View>
                </View>
                <View
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignSelf: 'flex-start',
                    justifyContent: 'space-between',
                  }}>
                  <View style={{flexDirection: 'row'}}>
                    <TouchableOpacity
                      onPress={() =>
                        this.likeComment(item, index, item.likeStatus)
                      }>
                      <View
                        style={{
                          padding: SIZES.padding * 0.8,
                          paddingLeft: SIZES.spacing,
                          flexDirection: 'row',
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
                    <TouchableOpacity onPress={() => this.showReplyTab(item)}>
                      <View
                        style={{
                          padding: SIZES.padding,
                        }}>
                        <Icon
                          name="reply"
                          color="#FFF"
                          type="material-community"
                          size={16}
                        />
                      </View>
                    </TouchableOpacity>
                  </View>
                  {item.reply.length !== 0 ? (
                    <TouchableOpacity
                      onPress={() => this.seeThread(item, index)}>
                      <View
                        style={{padding: SIZES.padding, flexDirection: 'row'}}>
                        <Icon
                          name={item.showReply ? 'chevron-up' : 'chevron-down'}
                          color="#FFF"
                          type="material-community"
                          size={16}
                        />
                        <Text
                          text="See Thread"
                          style={{fontSize: 12, marginLeft: SIZES.spacing}}
                        />
                      </View>
                    </TouchableOpacity>
                  ) : null}
                </View>
                {item.showReply
                  ? this.renderReply(item.reply.slice(0, 5), item, index)
                  : null}
              </View>
            )}
          />
          {this.commentBar()}
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
    const {loading, general} = this.state;
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
        ) : !this.state.subscribtion.subscribtion ? (
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

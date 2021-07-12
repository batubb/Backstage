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
} from 'react-native';
import {observer} from 'mobx-react';
import {Icon} from 'react-native-elements';
import {Loading, Header, Text, MyImage, Button, VerifiedIcon} from '../../components';
import {constants} from '../../resources';
import {
  sendComment,
  setLikeCommentStatus,
  shareItem,
  getUserPosts,
  checkSubscribtion,
} from '../../services';
import Store from '../../store/Store';
import { followerCount, timeDifference, setPosts } from '../../lib';
import { StackActions } from '@react-navigation/native';
import database from '@react-native-firebase/database';
import LinearGradient from 'react-native-linear-gradient';
import PostsCard from '../../components/ScreenComponents/ProfileComponents/PostsCard/PostsCard';

const { width } = Dimensions.get('window');

// TODO Pagination Eklenecek.

class Chat extends Component {
    constructor(props) {
        super(props);
        this.state = {
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
            daily: [],
        };
    }

    componentDidMount = async () => {
        await database().ref('comments').child(this.state.user.uid).on('value', snap => {
            var comments = [];
            const uid = Store.user.uid;

            snap.forEach(element => {
                const { reply, likes } = element.val();
                var replyArray = [];
                var likeStatus = false;
                var likeCount = 0;
                var keys = [];

                if (typeof reply !== 'undefined') {
                    const replyKeys = Object.keys(reply);

                    for (let i = 0; i < replyKeys.length; i++) {
                        const k = replyKeys[i];

                        if (typeof reply[k].likes !== 'undefined') {
                            keys = Object.keys(reply[k].likes);

                            for (let j = 0; j < keys.length; j++) {
                                const m = keys[j];

                                if (reply[k].likes[m]) {
                                    likeCount++;
                                }
                            }

                            if (typeof reply[k].likes[uid] !== 'undefined') {
                                likeStatus = reply[k].likes[uid];
                            }
                        }

                        replyArray.push({ ...reply[k], likeStatus, likeCount });
                    }

                    replyArray.sort(function (a, b) { return b.timestamp - a.timestamp; });
                }

                likeStatus = false;
                likeCount = 0;

                if (typeof likes !== 'undefined') {
                    keys = Object.keys(likes);
                    for (let j = 0; j < keys.length; j++) {
                        const m = keys[j];

                        if (likes[m]) {
                            likeCount++;
                        }
                    }

                    if (typeof likes[uid] !== 'undefined') {
                        likeStatus = likes[uid];
                    }
                }

                const result = this.state.comments.filter(comment => comment.uid === element.val().uid);

                var showReply = false;

                if (result.length > 0) {
                    showReply = result[0].showReply;
                }

                comments.push({ ...element.val(), reply: replyArray, showReply, likeStatus, likeCount });
            });

            comments.sort(function (a, b) { return b.timestamp - a.timestamp; });

            this.setState({ comments, loading: false });
        });

        const posts = await getUserPosts(this.state.user.uid);
        const { daily } = setPosts(posts);

        this.setState({ posts, daily });
    }

    goTo = (route, info = null) => {
        if (route === 'Comments') {
            const replaceActions = StackActions.push(route, { video: info, anonymus: this.state.anonymus });
            return this.props.navigation.dispatch(replaceActions);
        } else if (route === 'UserProfile') {
            const replaceActions = StackActions.push(route, { user: info });
            return this.props.navigation.dispatch(replaceActions);
        }
    }

    componentWillUnmount = () => {
        database().ref('comments').child(this.state.user.uid).off();
    }

    showReplyTab = (reply, set = true) => {
        if (set) {
            this.textinput.focus();
            this.setState({ comment: `@${reply.user.username} ` });
        } else {
            this.setState({ comment: '' });
        }

        this.setState({ reply });
    }

    seeThread = (item, index) => {
        var comments = this.state.comments;
        comments[index].showReply = !item.showReply;
        this.setState({ comments });
    }

    likeComment = async (item, index, status = false, reply = false, mainComment = null, mainCommentIndex = 0) => {
        await setLikeCommentStatus(Store.user, this.state.user, item, status, reply, mainComment);
    }

    sendComment = async () => {
        if (this.state.anonymus) {
            await sendComment({ ...Store.user, type: 'anonymus', name: this.state.anonymus.nickname, photo: constants.DEFAULT_PHOTO }, this.state.user, this.state.comment, this.state.reply);
        } else {
            await sendComment(Store.user, this.state.user, this.state.comment, this.state.reply);
        }
        this.setState({ comment: '', reply: null });
    }

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
            data={comments}
            refreshControl={
              <RefreshControl refreshing={refreshing} tintColor="white" />
            }
            ListEmptyComponent={() => {
              return (
                <View style={{width: width, alignItems: 'center'}}>
                  <Text text="There is no comments" style={{color: 'gray'}} />
                </View>
              );
            }}
            keyExtractor={(item) => item.uid}
            renderItem={({item, index}) => (
              <View
                style={{
                  paddingTop: 15,
                  width: width,
                  alignItems: 'center',
                  backgroundColor: constants.BAR_COLOR,
                  marginTop: 10,
                }}>
                <View
                  style={{
                    width: width - 20,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      width: width - 80,
                      justifyContent: 'space-between',
                    }}>
                    <View style={{width: width - 80}}>
                      <View style={{flexDirection: 'row'}}>
                        <Text text={item.user.username} />
                        {item.user.verified === true ? <VerifiedIcon size={14} /> : null}
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
                </View>
                <View
                  style={{
                    width: width,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <TouchableOpacity
                      onPress={() =>
                        this.likeComment(item, index, item.likeStatus)
                      }>
                      <View
                        style={{
                          padding: 10,
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
                    <TouchableOpacity onPress={() => this.showReplyTab(item)}>
                      <View style={{padding: 10}}>
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
                      <View style={{padding: 10, flexDirection: 'row'}}>
                        <Icon
                          name={item.showReply ? 'chevron-up' : 'chevron-down'}
                          color="#FFF"
                          type="material-community"
                          size={16}
                        />
                        <Text
                            text={`${followerCount(user.follower)} members`}
                            style={{ fontSize: 12, color: 'gray' }}
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
                      {item.user.verified === true ? <VerifiedIcon size={14} /> : null}
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

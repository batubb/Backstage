/* eslint-disable react/no-did-mount-set-state */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React, {Component} from 'react';
import {
  View,
  Dimensions,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  KeyboardAvoidingView,
  SafeAreaView,
  Platform,
  TextInput,
  Alert,
} from 'react-native';
import {observer} from 'mobx-react';
import {StackActions} from '@react-navigation/native';
import {Icon} from 'react-native-elements';
import {Loading, Header, Text, MyImage, VerifiedIcon} from '../../components';
import {constants} from '../../resources';
import {
  sendComment,
  setVideoComment,
  setLikeCommentStatus,
  checkSubscribtion,
} from '../../services';
import {timeDifference} from '../../lib';
import Store from '../../store/Store';
import followerCount from '../../lib/followerCount';
import {getBottomSpace} from '../../lib/iPhoneXHelper';
import {SIZES} from '../../resources/theme';
import {ActivityIndicator} from 'react-native';

const {width} = Dimensions.get('window');

// TODO Pagination Eklenecek.

class Comments extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      refreshing: false,
      isCommentSending: false,
      video: this.props.route.params.video,
      comments: [],
      comment: '',
      reply: null,
      anonymus: this.props.route.params.anonymus,
      subscribtion: null,
    };
  }

  componentDidMount = async () => {
    const subscribtion =
      Store.user.uid !== this.state.video.user.uid
        ? await checkSubscribtion(Store.uid, this.state.video.user.uid)
        : {subscribtion: true};

    const comments = await setVideoComment(Store.user.uid, this.state.video);
    this.setState({loading: false, comments, subscribtion});
  };

  sendComment = async () => {
    this.setState({isCommentSending: true});

    if (typeof this.state.subscribtion.subscribtion === 'undefined') {
      return Alert.alert(
        'Oops',
        'You must become a member to view the content.',
        [{text: 'Okay'}],
      );
    }

    if (this.state.subscribtion.subscribtion !== true) {
      return Alert.alert(
        'Oops',
        'You must become a member to view the content.',
        [{text: 'Okay'}],
      );
    }

    if (this.state.anonymus) {
      await sendComment(
        {
          ...Store.user,
          type: 'anonymus',
          name: this.state.anonymus.nickname,
          photo: constants.DEFAULT_PHOTO,
        },
        this.state.video,
        this.state.comment,
        this.state.reply,
      );
    } else {
      await sendComment(
        Store.user,
        this.state.video,
        this.state.comment,
        this.state.reply,
      );
    }

    const comments = await setVideoComment(Store.user.uid, this.state.video);
    this.setState({
      comments,
      comment: '',
      reply: null,
      isCommentSending: false,
    });
  };

  onRefresh = async () => {
    this.setState({refreshing: true});
    const comments = await setVideoComment(Store.user, this.state.video);
    this.setState({refreshing: false, comments});
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
      this.state.video,
      item,
      status,
      reply,
      mainComment,
    );
  };

  commentBar = () => {
    const {comment, reply, isCommentSending} = this.state;

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
              text={`Reply to ${reply.user.name}`}
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
              placeholder="Write your comment..."
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
                isCommentSending === true
                  ? null
                  : this.setState({comment: commentInput})
              }
              value={comment}
              placeholderTextColor="#FFF"
            />
          </View>
          {isCommentSending ? (
            <View style={{padding: 10}}>
              <ActivityIndicator color="#FFF" />
            </View>
          ) : comment !== '' ? (
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
        <KeyboardAvoidingView
          behavior="padding"
          keyboardVerticalOffset={80 + getBottomSpace()}>
          <FlatList
            data={comments}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => this.onRefresh()}
                tintColor="white"
              />
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
                        <Text text={`${item.user.username}`} />
                        {item.user.verified === true ? (
                          <VerifiedIcon
                            size={14}
                            style={{paddingLeft: SIZES.spacing}}
                          />
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
                          text="See Thread"
                          style={{fontSize: 12, marginLeft: 3}}
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
                    <Text text={item.user.username} />
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

  render() {
    const {loading} = this.state;

    return (
      <View style={{flex: 1, backgroundColor: constants.BACKGROUND_COLOR}}>
        <Header
          leftButtonPress={() =>
            this.props.navigation.dispatch(StackActions.pop())
          }
          leftButtonIcon="chevron-left"
          title="Comments"
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
          this.renderComments()
        )}
      </View>
    );
  }
}

export default observer(Comments);

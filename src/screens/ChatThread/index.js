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
  Thread as StreamThreadComponent,
} from 'stream-chat-react-native';
import {StreamChat} from 'stream-chat';
import jwt from 'react-native-pure-jwt';
import {getBottomSpace, getStatusBarHeight} from '../../lib/iPhoneXHelper';
import {COLORS, SIZES, STREAM_THEME} from '../../resources/theme';

class ChatThread extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      thread: props.route.params.thread,
      user: props.route.params.influencer,
    };
    this.channel = props.route.params.channel;
    this.streamServerClient = props.route.params.streamServerClient;
  }

  componentDidMount = async () => {
    this.setState({loading: false});
  };

  renderThread = () => {
    return (
      <SafeAreaView
        style={{flex: 1, backgroundColor: STREAM_THEME.colors.white}}>
        <KeyboardAvoidingView
          behavior="padding"
          keyboardVerticalOffset={80 + getBottomSpace()}>
          <StreamChatComponent
            client={this.streamServerClient}
            i18nInstance={constants.STREAM_I18N}>
            <Channel
              channel={this.channel}
              keyboardVerticalOffset={getStatusBarHeight()}
              thread={this.state.thread}
              MessageHeader={(props) => (
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
                    <VerifiedIcon size={10} style={{paddingBottom: SIZES.spacing}} />
                  ) : null}
                </View>
              )}>
              <View style={{flex: 1}}>
                <StreamThreadComponent />
              </View>
            </Channel>
          </StreamChatComponent>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  };

  render() {
    const {loading, thread} = this.state;
    return (
      <View style={{flex: 1, backgroundColor: constants.BACKGROUND_COLOR}}>
        <Header
          title={`${thread.user.username}'s thread`}
          leftButtonPress={() => {
            this.props.navigation.dispatch(StackActions.pop(1));
          }}
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
        ) : (
          this.renderThread()
        )}
      </View>
    );
  }
}

export default observer(ChatThread);

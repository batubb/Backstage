/* eslint-disable react/no-did-mount-set-state */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React, {Component} from 'react';
import {
  View,
  Dimensions,
  ScrollView,
  RefreshControl,
  Switch,
} from 'react-native';
import {observer} from 'mobx-react';
import {Loading, Header, Text, Divider} from '../../components';
import {constants} from '../../resources';
import Store from '../../store/Store';
import {StackActions} from '@react-navigation/native';
import database from '@react-native-firebase/database';
import {COLORS} from '../../resources/theme';

const {width} = Dimensions.get('window');

class Notifications extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      refreshing: false,
      pauseAll: false,
      videos: false,
      likes: false,
      roomActivities: false,
    };
  }

  componentDidMount = async () => {
    this.setSwitchs();
    this.setState({loading: false});
  };

  setSwitchs = () => {
    var pauseAll = true;

    if (typeof Store.user.notifications === 'undefined') {
      return this.setState({
        pauseAll: false,
        videos: true,
        likes: true,
        roomActivities: true,
      });
    }

    if (
      Store.user.notifications.videos ||
      typeof Store.user.notifications.videos === 'undefined'
    ) {
      pauseAll = false;
      this.setState({videos: true});
    }

    if (
      Store.user.notifications.likes ||
      typeof Store.user.notifications.likes === 'undefined'
    ) {
      pauseAll = false;
      this.setState({likes: true});
    }

    if (
      Store.user.notifications.roomActivities ||
      typeof Store.user.notifications.roomActivities === 'undefined'
    ) {
      pauseAll = false;
      this.setState({roomActivities: true});
    }

    this.setState({pauseAll});
  };

  changeSwitch = async (type = 'pauseall') => {
    if (type === 'pauseall') {
      if (this.state.pauseAll) {
        var updates = {
          likes: true,
          videos: true,
          roomActivities: true,
        };

        database()
          .ref('users')
          .child(Store.user.uid)
          .child('notifications')
          .update(updates);

        Store.setUser({...Store.user, notifications: updates});
        this.setState({
          pauseAll: false,
          videos: true,
          likes: true,
          roomActivities: true,
        });
      } else {
        var updates = {
          likes: false,
          videos: false,
          roomActivities: false,
        };

        database()
          .ref('users')
          .child(Store.user.uid)
          .child('notifications')
          .update(updates);

        Store.setUser({...Store.user, notifications: updates});
        this.setState({
          pauseAll: true,
          videos: false,
          likes: false,
          roomActivities: false,
        });
      }
    } else if (type === 'videos') {
      if (this.state.videos) {
        var updates = {
          likes: this.state.likes,
          videos: false,
          roomActivities: this.state.roomActivities,
        };

        database()
          .ref('users')
          .child(Store.user.uid)
          .child('notifications')
          .update(updates);

        Store.setUser({...Store.user, notifications: updates});
        this.setState({videos: false});
      } else {
        var updates = {
          likes: this.state.likes,
          videos: true,
          roomActivities: this.state.roomActivities,
        };

        database()
          .ref('users')
          .child(Store.user.uid)
          .child('notifications')
          .update(updates);

        Store.setUser({...Store.user, notifications: updates});
        this.setState({videos: true});
      }
    } else if (type === 'roomActivities') {
      if (this.state.roomActivities) {
        var updates = {
          likes: this.state.likes,
          videos: this.state.videos,
          roomActivities: false,
        };

        database()
          .ref('users')
          .child(Store.user.uid)
          .child('notifications')
          .update(updates);

        Store.setUser({...Store.user, notifications: updates});
        this.setState({roomActivities: false});
      } else {
        var updates = {
          likes: this.state.likes,
          videos: this.state.videos,
          roomActivities: false,
        };

        database()
          .ref('users')
          .child(Store.user.uid)
          .child('notifications')
          .update(updates);

    changeSwitch = async (type = 'pauseall') => {
        if (type === 'pauseall') {
            if (this.state.pauseAll) {
                var updates = {
                    likes: true,
                    videos: true,
                    roomActivities: true,
                };

                database().ref('users').child(Store.user.uid).child('notifications').update(updates);

                Store.setUser({ ...Store.user, notifications: updates });
                this.setState({ pauseAll: false, videos: true, likes: true, roomActivities: true });
            } else {
                var updates = {
                    likes: false,
                    videos: false,
                    roomActivities: false,
                };

                database().ref('users').child(Store.user.uid).child('notifications').update(updates);

                Store.setUser({ ...Store.user, notifications: updates });
                this.setState({ pauseAll: true, videos: false, likes: false, roomActivities: false });
            }
        } else if (type === 'videos') {
            if (this.state.videos) {
                var updates = {
                    likes: this.state.likes,
                    videos: false,
                    roomActivities: this.state.roomActivities,
                };

                database().ref('users').child(Store.user.uid).child('notifications').update(updates);

                Store.setUser({ ...Store.user, notifications: updates });
                this.setState({ videos: false });
            } else {
                var updates = {
                    likes: this.state.likes,
                    videos: true,
                    roomActivities: this.state.roomActivities,
                };

                database().ref('users').child(Store.user.uid).child('notifications').update(updates);

                Store.setUser({ ...Store.user, notifications: updates });
                this.setState({ videos: true });
            }
        } else if (type === 'roomActivities') {
            if (this.state.roomActivities) {
                var updates = {
                    likes: this.state.likes,
                    videos: this.state.videos,
                    roomActivities: false,
                };

                database().ref('users').child(Store.user.uid).child('notifications').update(updates);

                Store.setUser({ ...Store.user, notifications: updates });
                this.setState({ roomActivities: false });
            } else {
                var updates = {
                    likes: this.state.likes,
                    videos: this.state.videos,
                    roomActivities: true,
                };

                database().ref('users').child(Store.user.uid).child('notifications').update(updates);

                Store.setUser({ ...Store.user, notifications: updates });
                this.setState({ roomActivities: true });
            }
        } else if (type === 'likes') {
            if (this.state.likes) {
                var updates = {
                    likes: false,
                    videos: this.state.videos,
                    roomActivities: this.state.roomActivities,
                };

                database().ref('users').child(Store.user.uid).child('notifications').update(updates);

                Store.setUser({ ...Store.user, notifications: updates });
                this.setState({ likes: false });
            } else {
                var updates = {
                    likes: true,
                    videos: this.state.videos,
                    roomActivities: this.state.roomActivities,
                };

                database().ref('users').child(Store.user.uid).child('notifications').update(updates);

                Store.setUser({ ...Store.user, notifications: updates });
                this.setState({ likes: true });
            }
        }

        this.setSwitchs();
    }

    render() {
        const { loading, refreshing, pauseAll, roomActivities, likes, videos } = this.state;

        return (
            <View style={{ flex: 1, backgroundColor: constants.BACKGROUND_COLOR }}>
                <Header
                    leftButtonPress={() => this.props.navigation.dispatch(StackActions.pop())}
                    leftButtonIcon="chevron-left"
                    title="Notifications"
                />
                {
                    loading ?
                        <Loading
                            loadingStyle={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
                            textStyle={{ marginTop: 10, fontWeight: 'normal' }}
                            text="Loading"
                        />
                        :
                        <ScrollView refreshControl={<RefreshControl refreshing={refreshing} tintColor="white" />}>
                            <View style={{ width: width, paddingHorizontal: 20, marginTop: 10 }}>
                                <Text
                                    text="Push Notifications"
                                    style={{ fontSize: 20 }}
                                />
                            </View>
                            <View style={{ width: width, paddingHorizontal: 40, marginTop: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Text
                                    text="Pause All"
                                    style={{ fontSize: 16 }}
                                />
                                <Switch
                                    trackColor={{ false: 'gray', true: 'gray' }}
                                    thumbColor="#FFF"
                                    ios_backgroundColor="gray"
                                    onChange={() => this.changeSwitch()}
                                    value={pauseAll}
                                />
                            </View>
                            <View style={{ width: width, paddingHorizontal: 40, marginTop: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Text
                                    text="Videos"
                                    style={{ fontSize: 16 }}
                                />
                                <Switch
                                    trackColor={{ false: 'gray', true: 'gray' }}
                                    thumbColor="#FFF"
                                    ios_backgroundColor="gray"
                                    onChange={() => this.changeSwitch('videos')}
                                    value={videos}
                                />
                            </View>
                            <View style={{ width: width, paddingHorizontal: 40, marginTop: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Text
                                    text="Comments"
                                    style={{ fontSize: 16 }}
                                />
                                <Switch
                                    trackColor={{ false: 'gray', true: 'gray' }}
                                    thumbColor="#FFF"
                                    ios_backgroundColor="gray"
                                    onChange={() => this.changeSwitch('roomActivities')}
                                    value={roomActivities}
                                />
                            </View>
                            <View style={{ width: width, paddingHorizontal: 40, marginTop: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Text
                                    text="Likes"
                                    style={{ fontSize: 16 }}
                                />
                                <Switch
                                    trackColor={{ false: 'gray', true: 'gray' }}
                                    thumbColor="#FFF"
                                    ios_backgroundColor="gray"
                                    onChange={() => this.changeSwitch('likes')}
                                    value={likes}
                                />
                            </View>
                        </ScrollView>
                }
            </View>
            <Divider />
            <View
              style={{
                width: width,
                paddingHorizontal: 20,
                marginTop: 20,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 20,
              }}>
              <Text text="Videos" style={{fontSize: 16}} />
              <Switch
                trackColor={{
                  false: COLORS.systemFill,
                  true: COLORS.primary,
                }}
                thumbColor="#FFF"
                ios_backgroundColor={COLORS.systemFill}
                onChange={() => this.changeSwitch('videos')}
                value={videos}
              />
            </View>
            <Divider />
            <View
              style={{
                width: width,
                paddingHorizontal: 20,
                marginTop: 20,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 20,
              }}>
              <Text text="Room Activities" style={{fontSize: 16}} />
              <Switch
                trackColor={{
                  false: COLORS.systemFill,
                  true: COLORS.primary,
                }}
                thumbColor="#FFF"
                ios_backgroundColor={COLORS.systemFill}
                onChange={() => this.changeSwitch('roomActivities')}
                value={roomActivities}
              />
            </View>
            <Divider />
            <View
              style={{
                width: width,
                paddingHorizontal: 20,
                marginTop: 20,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 20,
              }}>
              <Text text="Likes" style={{fontSize: 16}} />
              <Switch
                trackColor={{
                  false: COLORS.systemFill,
                  true: COLORS.primary,
                }}
                thumbColor="#FFF"
                ios_backgroundColor={COLORS.systemFill}
                onChange={() => this.changeSwitch('likes')}
                value={likes}
              />
            </View>
            <Divider />
          </ScrollView>
        )}
      </View>
    );
  }
}

export default observer(Notifications);

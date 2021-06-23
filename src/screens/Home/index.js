/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React, { Component } from 'react';
import { View, Dimensions, FlatList, TouchableOpacity, ScrollView, RefreshControl, Alert, Image } from 'react-native';
import { observer } from 'mobx-react';
import LinearGradient from 'react-native-linear-gradient';
import { Icon, Header } from 'react-native-elements';
import { StackActions } from '@react-navigation/native';
import { Loading, Text, MyImage } from '../../components';
import { constants } from '../../resources';
import { getFollowingLiveData, getFollowingUserPosts, getFollowingUserStories } from '../../services';
import Store from '../../store/Store';
import { followerCount } from '../../lib';
import AsyncStorage from '@react-native-async-storage/async-storage';
import database from '@react-native-firebase/database';
import axios from 'axios';

const { width } = Dimensions.get('window');

class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            refreshing: false,
            liveArray: [],
            userPostsArray: [],
            userStoriesArray: [],
            myStoriesArray: [],
        };

        this.mux_instance = axios.create({
            baseURL: constants.MUX_BASE_URL,
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
                'mp4_support': 'standard',
            },
            auth: {
                username: constants.MUX_USERNAME,
                password: constants.MUX_PASSWORD,
            },
        });
    }

    componentDidMount = async () => {
        Promise.all([
            getFollowingLiveData(Store.uid, Store.followList),
            getFollowingUserPosts(Store.uid, Store.followList),
            getFollowingUserStories(Store.uid, Store.followList),
        ]).then((values) => {
            this.setState({ loading: false, liveArray: values[0], userPostsArray: values[1], userStoriesArray: values[2].userStoriesArray, myStoriesArray: values[2].myStoriesArray });
        });

        this.setPushId()
    }

    onRefresh = async () => {
        this.setState({ refreshing: true });

        Promise.all([
            getFollowingLiveData(Store.uid, Store.followList),
            getFollowingUserPosts(Store.uid, Store.followList),
            getFollowingUserStories(Store.uid, Store.followList),
        ]).then((values) => {
            this.setState({ refreshing: false, liveArray: values[0], userPostsArray: values[1], userStoriesArray: values[2].userStoriesArray, myStoriesArray: values[2].myStoriesArray });
        });
    }

    setPushId = async () => {
        try {
            const push = await AsyncStorage.getItem('pushInfo');

            if (push) {
                database().ref('users').child(Store.uid).child('token').set(push);
            }
        } catch (e) {
            // saving error
        }
    }

    goTo = async (route, info = null) => {
        if (route === 'UserProfile') {
            const replaceActions = StackActions.push(route, { user: info });
            return this.props.navigation.dispatch(replaceActions);
        } else if (route === 'WatchVideo') {
            if (info.type === 'live') {
                const livestreamResponse = await this.mux_instance.get('/video/v1/live-streams/' + info.liveId);
                const status = livestreamResponse.data.data.status;

                if (status === 'active') {
                    const replaceActions = StackActions.push(route, { video: info });
                    return this.props.navigation.dispatch(replaceActions);
                } else {
                    this.onRefresh();
                    return Alert.alert('Oops', 'This livestream is over.', [{ text: 'Okay' }]);
                }
            } else {
                const replaceActions = StackActions.push(route, { video: info });
                return this.props.navigation.dispatch(replaceActions);
            }
        } else if (route === 'WatchStory') {
            const userStories = [];

            for (let i = 0; i < this.state.userStoriesArray.length; i++) {
                const element = this.state.userStoriesArray[i];
                userStories.push(element.stories);
            }

            const replaceActions = StackActions.push(route, { stories: info, allStories: this.state.myStoriesArray.length === 0 ? userStories : [this.state.myStoriesArray, ...userStories] });
            return this.props.navigation.dispatch(replaceActions);
        } else if (route === 'AddContent') {
            const replaceActions = StackActions.push(route);
            return this.props.navigation.dispatch(replaceActions);
        }
    }

    expireAlert = () => {
        Alert.alert(
            'Oops',
            'You must be a member to view the content.',
            [
                {
                    text: 'Okay',
                },
            ]
        );
    }

    captionBar = (text = 'Now', live = false, user = null) => {
        return (
            <View style={{ width: width, paddingHorizontal: 15, paddingVertical: 5, flexDirection: 'row', alignItems: 'center' }}>
                {
                    live ?
                        <View style={{ paddingHorizontal: 15, paddingVertical: 5, borderRadius: 4, marginRight: 10, backgroundColor: constants.RED }}>
                            <Text
                                text="LIVE"
                                style={{ fontSize: 16 }}
                            />
                        </View>
                        :
                        <MyImage
                            style={{ width: 40, height: 40, borderRadius: 20, marginRight: 10 }}
                            photo={user.photo}
                        />
                }
                <Text
                    text={text}
                    style={{ fontSize: live ? 16 : 20 }}
                />
            </View>
        );
    }

    liveArrayCard = (liveArray) => {
        return (
            <>
                {this.captionBar('Now', true)}
                <FlatList
                    data={liveArray}
                    keyExtractor={(item) => item.uid}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    renderItem={({ item }) => <View style={{ width: (width / 2.5), alignItems: 'center' }}>
                        <TouchableOpacity onPress={() => this.goTo('WatchVideo', item)}>
                            <View style={{ borderRadius: 16, width: (width / 2.5) - 10, height: (1.5) * ((width / 2.5) - 10), backgroundColor: '#4d4d4d', alignItems: 'center', justifyContent: 'center' }}>
                                <MyImage
                                    style={{ width: (width / 2.5) - 10, height: (1.5) * ((width / 2.5) - 10), borderRadius: 16 }}
                                    photo={item.photo}
                                />
                                <LinearGradient
                                    colors={['transparent', 'transparent', constants.BACKGROUND_COLOR]}
                                    style={{ width: (width / 2.5) - 10, height: (1.5) * ((width / 2.5) - 10), borderRadius: 16, position: 'absolute' }}
                                />
                                <View style={{ position: 'absolute', bottom: 0, paddingVertical: 5, paddingHorizontal: 10, flexDirection: 'row', width: (width / 2.5) - 10, justifyContent: 'space-between', alignItems: 'center' }}>
                                    <MyImage
                                        style={{ width: 40, height: 40, borderRadius: 20 }}
                                        photo={item.user.photo}
                                    />
                                    <View style={{ width: (width / 2.5) - 80 }}>
                                        <Text
                                            text={item.user.name.length >= 10 ? `${item.user.name.substring(0, 10)}...` : item.user.name}
                                            style={{ fontSize: 12 }}
                                        />
                                        <Text
                                            text={`${followerCount(item.view)} viewer`}
                                            style={{ fontSize: 12, fontWeight: 'normal' }}
                                        />
                                    </View>
                                </View>
                            </View>
                        </TouchableOpacity>
                        {item.expired ? this.expiredCard(item) : null}
                    </View>
                    }
                />
            </>
        );
    }

    userPostsArrayCard = (influencer) => {
        return (
            <View>
                <TouchableOpacity onPress={() => this.goTo('UserProfile', influencer)}>
                    {this.captionBar(influencer.name, false, influencer)}
                </TouchableOpacity>
                <FlatList
                    data={influencer.posts}
                    keyExtractor={(item) => item.uid}
                    horizontal
                    ListFooterComponent={() => {
                        return (<View style={{ alignItems: 'center', height: (1.5) * ((width / 2.5) - 10), justifyContent: 'center', marginBottom: 10 }}>
                            <TouchableOpacity style={{ alignItems: 'center', marginHorizontal: 20 }} onPress={() => this.goTo('UserProfile', influencer)}>
                                <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: constants.RED, alignItems: 'center', justifyContent: 'center' }}>
                                    <Icon name="chevron-right" color="#FFF" type="material-community" />
                                </View>
                                <Text
                                    text="More Posts"
                                    style={{ fontSize: 12, marginTop: 10 }}
                                />
                            </TouchableOpacity>
                        </View>);
                    }}
                    showsHorizontalScrollIndicator={false}
                    renderItem={({ item }) => <View style={{ width: (width / 2.5), alignItems: 'center', marginBottom: 10 }}>
                        <TouchableOpacity onPress={() => this.goTo('WatchVideo', item)}>
                            <View style={{ borderRadius: 16, width: (width / 2.5) - 10, height: (1.5) * ((width / 2.5) - 10), backgroundColor: '#4d4d4d', alignItems: 'center', justifyContent: 'center' }}>
                                <MyImage
                                    style={{ width: (width / 2.5) - 10, height: (1.5) * ((width / 2.5) - 10), borderRadius: 16 }}
                                    photo={item.photo}
                                />
                                <LinearGradient
                                    colors={['transparent', 'transparent', constants.BACKGROUND_COLOR]}
                                    style={{ width: (width / 2.5) - 10, height: (1.5) * ((width / 2.5) - 10), borderRadius: 16, position: 'absolute' }}
                                />
                                <View style={{ position: 'absolute', bottom: 0, paddingVertical: 5, paddingHorizontal: 10, width: (width / 2.5) - 10 }}>
                                    <Text
                                        text={item.title.length >= 17 ? `${item.title.substring(0, 17)}...` : item.title}
                                        style={{ fontSize: 12 }}
                                    />
                                    <Text
                                        text={`${followerCount(item.view)} views`}
                                        style={{ fontSize: 12, fontWeight: 'normal' }}
                                    />
                                </View>
                            </View>
                        </TouchableOpacity>
                        {influencer.expired ? this.expiredCard(influencer) : null}
                    </View>
                    }
                />
            </View>
        );
    }

    expiredCard = () => {
        return (
            <TouchableOpacity activeOpacity={0.9} style={{ position: 'absolute' }} onPress={() => this.expireAlert()}>
                <View style={{ width: (width / 2.5) - 10, height: (1.5) * ((width / 2.5) - 10), borderRadius: 16, alignItems: 'center', justifyContent: 'center' }}>
                    <View style={{ position: 'absolute', width: (width / 2.5) - 10, height: (1.5) * ((width / 2.5) - 10), borderRadius: 16, backgroundColor: 'black', opacity: 0.8 }} />
                    <View style={{ width: 80, height: 80, borderColor: '#FFF', borderWidth: 2, borderRadius: 40, alignItems: 'center', justifyContent: 'center' }}>
                        <Icon name="lock-outline" color="#FFF" type="material-community" size={48} />
                    </View>
                </View>
            </TouchableOpacity>
        );
    }

    renderStories = () => {
        if (this.state.loading) {
            return (
                <View style={{ width: width }}>
                    <ScrollView horizontal>
                        <View style={{ width: 60, height: 60, borderRadius: 30, marginHorizontal: 5, alignItems: 'center', justifyContent: 'center', backgroundColor: constants.BAR_COLOR }} />
                        <View style={{ width: 60, height: 60, borderRadius: 30, marginHorizontal: 5, alignItems: 'center', justifyContent: 'center', backgroundColor: constants.BAR_COLOR }} />
                        <View style={{ width: 60, height: 60, borderRadius: 30, marginHorizontal: 5, alignItems: 'center', justifyContent: 'center', backgroundColor: constants.BAR_COLOR }} />
                        <View style={{ width: 60, height: 60, borderRadius: 30, marginHorizontal: 5, alignItems: 'center', justifyContent: 'center', backgroundColor: constants.BAR_COLOR }} />
                        <View style={{ width: 60, height: 60, borderRadius: 30, marginHorizontal: 5, alignItems: 'center', justifyContent: 'center', backgroundColor: constants.BAR_COLOR }} />
                    </ScrollView>
                </View>
            );
        }

        return (
            <View style={{ width: width }}>
                <ScrollView horizontal>
                    {
                        this.state.myStoriesArray.length !== 0 ?
                            <TouchableOpacity onPress={() => this.goTo('WatchStory', this.state.myStoriesArray)} style={{ alignItems: 'center' }}>
                                <View style={{ width: 60, height: 60, borderRadius: 30, marginHorizontal: 5, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFF' }}>
                                    <MyImage
                                        style={{ width: 60, height: 60, borderRadius: 30, borderWidth: 2, borderColor: '#FFF' }}
                                        photo={Store.user.photo}
                                    />
                                </View>
                                <Text
                                    text="Your Stories"
                                    style={{ fontSize: 10, marginTop: 5, fontWeight: 'normal' }}
                                />
                            </TouchableOpacity>
                            :
                            <TouchableOpacity onPress={() => this.goTo('AddContent')} style={{ alignItems: 'center' }}>
                                <View style={{ width: 60, height: 60, borderRadius: 30, marginHorizontal: 5, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFF' }}>
                                    <Icon name="plus" color="#FFF" type="material-community" size={32} />
                                </View>
                                <Text
                                    text="Add Story"
                                    style={{ fontSize: 10, marginTop: 5, fontWeight: 'normal' }}
                                />
                            </TouchableOpacity>
                    }
                    <FlatList
                        data={this.state.userStoriesArray}
                        keyExtractor={(item) => item.uid}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        renderItem={({ item }) => <TouchableOpacity onPress={() => this.goTo('WatchStory', item.stories)} style={{ alignItems: 'center' }}>
                            <View style={{ width: 60, height: 60, borderRadius: 30, marginHorizontal: 5, alignItems: 'center', justifyContent: 'center' }}>
                                <MyImage
                                    style={{ width: 60, height: 60, borderRadius: 30, borderWidth: 2, borderColor: '#FFF' }}
                                    photo={item.photo}
                                />
                            </View>
                            <Text
                                text={item.username}
                                style={{ fontSize: 10, marginTop: 5, fontWeight: 'normal' }}
                            />
                        </TouchableOpacity>
                        }
                    />
                </ScrollView>
            </View>
        );
    }

    render() {
        const { loading, liveArray, refreshing, userPostsArray } = this.state;

        return (
            <View style={{ flex: 1, backgroundColor: constants.BACKGROUND_COLOR }}>
                <Header
                    statusBarProps={{ barStyle: 'light-content', backgroundColor: constants.BACKGROUND_COLOR }}
                    centerComponent={
                        <Image
                            style={{ height: (width / 3) * (247 / 853), width: width / 3 }}
                            source={require('../../images/icon.jpeg')}
                        />
                    }
                    containerStyle={{ borderBottomWidth: 0, backgroundColor: constants.BACKGROUND_COLOR, borderColor: constants.BACKGROUND_COLOR }}
                />
                {this.renderStories()}
                {
                    loading ?
                        <Loading
                            loadingStyle={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
                            textStyle={{ marginTop: 10, fontWeight: 'normal' }}
                            text="Loading"
                        />
                        :
                        <ScrollView
                            refreshControl={<RefreshControl
                                refreshing={refreshing}
                                onRefresh={() => this.onRefresh()}
                                tintColor="white"
                            />}
                        >
                            {liveArray.length !== 0 ? this.liveArrayCard(liveArray) : null}
                            {
                                userPostsArray.length !== 0 ?
                                    <FlatList
                                        data={userPostsArray}
                                        keyExtractor={(item) => item.uid}
                                        renderItem={({ item }) => this.userPostsArrayCard(item)}
                                    />
                                    :
                                    null
                            }
                        </ScrollView>
                }
            </View>
        );
    }
}

export default observer(Home);

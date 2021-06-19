/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React, { Component } from 'react';
import { View, Dimensions, FlatList, TouchableOpacity, ScrollView, RefreshControl, Alert } from 'react-native';
import { observer } from 'mobx-react';
import { StackActions } from '@react-navigation/native';
import { Loading, Header, Text, MyImage, Button, Options } from '../../components';
import { constants } from '../../resources';
import { followerCount, setPosts } from '../../lib';
import { getUserPosts, checkSubscribtion, shareItem, report, getFollowerCount, unsubscribe } from '../../services';
import Store from '../../store/Store';
import { Icon } from 'react-native-elements';
import LinearGradient from 'react-native-linear-gradient';
import database from '@react-native-firebase/database';
import moment from 'moment';

const { width } = Dimensions.get('window');

class UserProfile extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            refreshing: false,
            subscribtion: false,
            user: this.props.route.params.user,
            posts: [],
            postsArray: [],
            daily: [],
            optionsVisible: false,
            followerNumber: 0,
        };

        this.list = [
            { title: 'Report', onPress: this.reportVideo },
            { title: 'Block', onPress: this.blockUser },
        ];
    }

    componentDidMount = async () => {
        this.unsubscribe = this.props.navigation.addListener('focus', (e) => {
            this.checkInfluencerInfos();
        });
    }

    checkInfluencerInfos = async () => {
        const followerNumber = await getFollowerCount(this.state.user.uid);
        const subscribtion = await checkSubscribtion(Store.uid, this.state.user.uid);
        const posts = await getUserPosts(this.state.user.uid);
        const { postsArray, daily } = setPosts(posts);

        this.setState({ posts: posts, postsArray: postsArray, daily: daily, subscribtion, loading: false, followerNumber });
    }

    componentWillUnmount = () => {
        this.unsubscribe();
    }

    goTo = (route, info = null) => {
        if (route === 'WatchVideo') {
            const replaceActions = StackActions.push(route, { video: info });
            return this.props.navigation.dispatch(replaceActions);
        } else if (route === 'Subscribe') {
            const replaceActions = StackActions.push(route, { influencer: info, posts: this.state.posts });
            return this.props.navigation.dispatch(replaceActions);
        } else if (route === 'Chat') {
            const replaceActions = StackActions.push(route, { user: info });
            return this.props.navigation.dispatch(replaceActions);
        }
    }

    reportVideo = async () => {
        const result = await report(this.state.user, 'account');

        if (result) {
            Alert.alert('Thank You', 'You have reported this user. We will investigate this user.', [{ text: 'Okay' }]);
        } else {
            Alert.alert('Oops', 'We are sorry for this. Please try again later.', [{ text: 'Okay' }]);
        }

        this.setState({ optionsVisible: false });
    }

    blockUser = async () => {
        Alert.alert('Success', 'You have blocked this user. Now this user can not see your profile.', [{ text: 'Okay' }]);

        this.setState({ optionsVisible: false });
    }

    shareVideo = async () => {
        await shareItem(`Hey did you see this user on BackStage. ${this.state.user.name} is live!`);
        this.setState({ optionsVisible: false });
    }

    unsubscribeInf = () => {
        Alert.alert(
            'Are you sure?',
            `Do you want to unsubscribe ${this.state.user.name}.`,
            [
                { text: 'Yes', onPress: () => this.cancelSubscribtion() },
                { text: 'No', style: 'cancel' },
            ]);
    }

    cancelSubscribtion = async () => {
        this.setState({ loading: true });
        const result = await unsubscribe(this.state.subscribtion.stripeId);

        if (result) {
            var updates = {};

            updates[`followList/${Store.user.uid}/${this.state.user.uid}/cancel`] = true;
            await database().ref().update(updates);
            await this.checkInfluencerInfos();
            this.setState({ loading: false });

            Alert.alert('Oops', `You have cancelled your subscribtion. Your subscription will continue until ${moment(this.state.subscribtion.endTimestamp).format('LL')}.`, [{ text: 'Okay' }]);
        } else {
            Alert.alert('Oops', 'We are sorry for this. Please try again later.', [{ text: 'Okay' }]);
        }
    }

    renderProfileTop = (user, posts) => {
        const { subscribtion } = this.state;
        const constWidth = width / 3;
        return (
            <View style={{ width: width, flexDirection: 'row', padding: 15, alignItems: 'center' }}>
                <MyImage
                    style={{ width: constWidth, height: constWidth, borderRadius: constWidth / 2 }}
                    photo={user.photo}
                />
                <View style={{ marginLeft: 10, width: (width - constWidth) - 50, alignItems: 'center' }}>
                    <Text
                        text={user.name}
                        style={{ fontSize: 20 }}
                    />
                    <Text
                        text={typeof user.biography === 'undefined' ? 'No Biography' : user.biography}
                        style={{ fontSize: 12, color: 'gray' }}
                    />
                    {
                        user.uid !== Store.user.uid && !subscribtion.cancel ?
                            <Button
                                buttonStyle={{ width: (width - constWidth) - 50, backgroundColor: '#FFF', padding: 10, marginTop: 10, borderRadius: 24 }}
                                textStyle={{ fontSize: 12, color: 'black' }}
                                text={subscribtion.subscribtion ? 'Unsubscribe' : `Subscribe / ${user.price.toFixed(2)} $`}
                                onPress={() => subscribtion.subscribtion ? this.unsubscribeInf() : this.goTo('Subscribe', this.state.user)}
                            />
                            :
                            null
                    }
                    {
                        user.uid !== Store.user.uid && subscribtion.cancel ?
                            <Button
                                buttonStyle={{ width: (width - constWidth) - 50, backgroundColor: '#FFF', padding: 10, marginTop: 10, borderRadius: 24 }}
                                textStyle={{ fontSize: 12, color: 'black' }}
                                text={`Last date is ${moment(this.state.subscribtion.endTimestamp).format('L')}.`}
                            />
                            :
                            null
                    }
                </View>
            </View>
        );
    }

    renderPosts = (posts) => {
        return (
            <>
                <FlatList
                    data={posts}
                    keyExtractor={(item) => item.uid}
                    extraData={posts}
                    numColumns={2}
                    renderItem={({ item }) =>
                        <View style={{ width: (width / 2), alignItems: 'center', marginTop: 10 }}>
                            <TouchableOpacity onPress={() => this.goTo('WatchVideo', item)}>
                                <View style={{ borderRadius: 16, width: (width / 2) - 10, height: (1.5) * ((width / 2) - 10), backgroundColor: '#4d4d4d', alignItems: 'center', justifyContent: 'center' }}>
                                    <MyImage
                                        style={{ width: (width / 2) - 10, height: (1.5) * ((width / 2) - 10), borderRadius: 16 }}
                                        photo={item.photo}
                                    />
                                    <LinearGradient
                                        colors={['transparent', 'transparent', constants.BACKGROUND_COLOR]}
                                        style={{ width: (width / 2) - 10, height: (1.5) * ((width / 2) - 10), borderRadius: 16, position: 'absolute' }}
                                    />
                                    <View style={{ position: 'absolute', bottom: 0, paddingVertical: 5, paddingHorizontal: 10, width: (width / 2) - 10 }}>
                                        <Text
                                            text={typeof item.title !== 'undefined' ? (item.title.length >= 17 ? `${item.title.substring(0, 17)}...` : item.title) : ''}
                                            style={{ fontSize: 12 }}
                                        />
                                        <Text
                                            text={`${followerCount(item.view)} views`}
                                            style={{ fontSize: 12, fontWeight: 'normal' }}
                                        />
                                    </View>
                                </View>
                            </TouchableOpacity>
                            {this.state.subscribtion.subscribtion ? null : this.expiredCard()}
                        </View>
                    }
                />
            </>
        );
    }

    expiredCard = () => {
        return (
            <View style={{ width: (width / 2) - 10, height: (1.5) * ((width / 2) - 10), borderRadius: 16, alignItems: 'center', justifyContent: 'center', position: 'absolute' }}>
                <View style={{ position: 'absolute', width: (width / 2) - 10, height: (1.5) * ((width / 2) - 10), borderRadius: 16, backgroundColor: 'black', opacity: 0.8 }} />
                <View style={{ width: 80, height: 80, borderColor: '#FFF', borderWidth: 2, borderRadius: 40, alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="lock-outline" color="#FFF" type="material-community" size={48} />
                </View>
            </View>
        );
    }

    renderDataBar = (user) => {

        return (
            <View style={{ flexDirection: 'row', width: width, paddingVertical: 10, marginBottom: 10 }}>
                <View style={{ alignItems: 'center', width: (width) / 2 }}>
                    <Text
                        text={followerCount(this.state.followerNumber)}
                        style={{ fontSize: 18 }}
                    />
                    <Text
                        text="Members"
                        style={{ fontSize: 16 }}
                    />
                </View>
                <TouchableOpacity onPress={() => this.goTo('Chat', this.state.user)}>
                    <View style={{ alignItems: 'center', width: (width) / 2 }}>
                        <Icon
                            name="account-group-outline"
                            color="#FFF"
                            type="material-community"
                        />
                        <Text
                            text="Rooms"
                            style={{ fontSize: 16 }}
                        />
                    </View>
                </TouchableOpacity>
            </View>
        );
    }

    renderEmptyPost = () => {
        return (
            <View style={{ marginTop: 30, alignItems: 'center', justifyContent: 'center' }}>
                <View style={{ width: 100, height: 100, borderColor: '#FFF', borderWidth: 2, borderRadius: 50, alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="lock-open-outline" color="#FFF" type="material-community" size={64} />
                </View>
                <Button
                    buttonStyle={{ width: (width - width / 4) - 50, borderColor: '#FFF', borderWidth: 2, backgroundColor: constants.BACKGROUND_COLOR, padding: 10, marginTop: 10, borderRadius: 8 }}
                    textStyle={{ fontSize: 16 }}
                    text="Unlock content now!"
                    onPress={() => this.goTo('Subscribe', this.state.user)}
                />
            </View>
        );
    }

    render() {
        const { loading, refreshing, user, posts, daily, optionsVisible } = this.state;

        return (
            <View style={{ flex: 1, backgroundColor: constants.BACKGROUND_COLOR }}>
                <Header
                    leftButtonPress={() => this.props.navigation.dispatch(StackActions.pop())}
                    leftButtonIcon="chevron-left"
                    title={user.username}
                    rightButtonPress={() => this.setState({ optionsVisible: true })}
                    rightButtonIcon="dots-horizontal"
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
                            {this.renderProfileTop(user, posts)}
                            {this.renderDataBar(user)}
                            <View>
                                {daily.length !== 0 ? this.renderPosts(daily) : null}
                            </View>
                        </ScrollView>
                }
                <Options
                    list={this.list}
                    visible={optionsVisible}
                    cancelPress={() => this.setState({ optionsVisible: false })}
                />
            </View>
        );
    }
}

export default observer(UserProfile);

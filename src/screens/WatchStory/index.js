/* eslint-disable radix */
/* eslint-disable react/no-did-mount-set-state */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React, { Component } from 'react';
import { View, Dimensions, TouchableOpacity, Alert, Platform, Image } from 'react-native';
import { observer } from 'mobx-react';
import { Icon } from 'react-native-elements';
import Video from 'react-native-video';
import { StackActions } from '@react-navigation/native';
import { Loading, Text, MyImage } from '../../components';
import { constants } from '../../resources';
import { checkSubscribtion, checkUserInfo, report } from '../../services';
import Store from '../../store/Store';

const { width, height } = Dimensions.get('window');
var BOTTOM_PADDING = height >= 812 ? 44 : 20;
BOTTOM_PADDING = Platform.OS === 'android' ? 0 : BOTTOM_PADDING;

// TODO Canlı yayın izleme eklenecek.

class WatchStory extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            refreshing: false,
            stories: this.props.route.params.stories,
            paused: true,
            videoLoading: true,
            isCommentModalVisible: false,
            videoInfo: {},
            content: { ...this.props.route.params.stories[0], id: 0 },
            allStories: this.props.route.params.allStories,
            subscribtion: {
                subscribtion: false,
            },
        };

        this.list = [
            { title: 'Report', onPress: this.reportVideo },
        ];

        if (Store.user.uid === this.props.route.params.stories[0].user.uid) {
            this.list = [...this.list, { title: 'Edit', color: constants.RED, onPress: this.editVideo }];
        }
    }

    componentDidMount = async () => {
        const subscribtion = await checkSubscribtion(Store.uid, this.state.content.user.uid);
        this.setState({ subscribtion });

        if (subscribtion.subscribtion) {
            const influencer = await checkUserInfo(this.state.content.user.uid);
            this.setState({ loading: false, paused: false, influencer });
        } else {
            Alert.alert(
                'Oops',
                'You must be a member to view the content.',
                [
                    {
                        text: 'Okay', onPress: () => this.props.navigation.dispatch(StackActions.pop()),
                    },
                ]
            );
        }
    }

    reportVideo = async () => {
        const result = await report(this.state.content);

        if (result) {
            Alert.alert('Thank You', 'You have reported this video. We will investigate this video.', [{ text: 'Okay' }]);
        } else {
            Alert.alert('Oops', 'We are sorry for this. Please try again later.', [{ text: 'Okay' }]);
        }

        this.setState({ optionsVisible: false });
    }

    editVideo = () => {
        // TODO Video editleme
    }

    nextStory = (stories, content) => {
        const lastStories = this.state.allStories[this.state.allStories.length - 1];

        if (stories[0].user.uid === lastStories[0].user.uid && stories.length - 1 === content.id) {
            return this.props.navigation.dispatch(StackActions.pop());
        }

        var x = 0;

        for (let i = 0; i < this.state.allStories.length; i++) {
            const element = this.state.allStories[i];
            if (element[0].user.uid === stories[0].user.uid) {
                x = i;
            }
        }

        if (stories.length - 1 === content.id) {
            return this.setState({ stories: this.state.allStories[x + 1], content: { ...this.state.allStories[x + 1][0], id: 0 } });
        }

        this.setState({ content: { ...stories[content.id + 1], id: content.id + 1 } });
    }

    previousStory = (stories, content) => {
        const firstStory = this.state.allStories[0];

        if (stories[0].user.uid === firstStory[0].user.uid && content.id === 0) {
            return true;
        }

        var x = 0;

        for (let i = 0; i < this.state.allStories.length; i++) {
            const element = this.state.allStories[i];

            if (element[0].user.uid === stories[0].user.uid) {
                x = i;
            }
        }

        if (content.id === 0) {
            return this.setState({ stories: this.state.allStories[x - 1], content: { ...this.state.allStories[x - 1][0], id: 0 } });
        }

        this.setState({ content: { ...stories[content.id - 1], id: content.id - 1 } });
    }

    renderVideoPlayer = (video) => {
        return (
            <View style={{ width, height, position: 'absolute', alignItems: 'center', justifyContent: 'center' }}>
                <Video
                    source={{ uri: video.url }}
                    ref={(ref) => { this.player = ref; }}
                    onEnd={() => this.nextStory(this.state.stories, this.state.content)}
                    style={{ flex: 1, width: width, height: height, position: 'absolute' }}
                    paused={false}
                    onLoadStart={() => this.setState({ loading: true })}
                    onLoad={() => this.setState({ loading: false })}
                />
            </View>
        );
    }

    renderImage = (content) => {
        return (
            <View style={{ width, height, position: 'absolute', alignItems: 'center', justifyContent: 'center' }}>
                <Image
                    style={{ flex: 1, width, height, position: 'absolute' }}
                    source={{ uri: content.url }}
                    onLoadStart={() => this.setState({ loading: true })}
                    onLoadEnd={() => this.setState({ loading: false })}
                />
            </View>
        );
    }

    render() {
        const { loading, stories, content, subscribtion } = this.state;

        return (
            <View style={{ flex: 1, backgroundColor: constants.BACKGROUND_COLOR }}>
                {content.type === 'photo' && subscribtion.subscribtion ? this.renderImage(content) : null}
                {content.type === 'video' && subscribtion.subscribtion ? this.renderVideoPlayer(content) : null}
                {
                    loading ?
                        <View style={{ width, height, backgroundColor: constants.BACKGROUND_COLOR, alignItems: 'center', justifyContent: 'center', position: 'absolute' }}>
                            <Loading />
                        </View>
                        :
                        null
                }
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => this.nextStory(stories, content)}
                    style={{ width: width / 2, height, position: 'absolute', right: 0 }}
                />
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => this.previousStory(stories, content)}
                    style={{ width: width / 2, height, position: 'absolute', left: 0 }}
                />
                <View style={{ width, flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 10, marginTop: BOTTOM_PADDING, justifyContent: 'space-between' }}>
                    {
                        stories.map((item, index) =>
                            <View
                                key={item.uid}
                                style={{ width: ((width - 40) / stories.length) - 2.5, height: 2, backgroundColor: index <= content.id ? '#FFF' : 'gray' }}
                            />
                        )
                    }
                </View>
                <View style={{ width, flexDirection: 'row', paddingHorizontal: 20, alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ alignItems: 'center', flexDirection: 'row' }}>
                        <MyImage
                            photo={content.user.photo}
                            style={{ width: 50, height: 50, borderRadius: 25 }}
                        />
                        <View>
                            <Text
                                text={content.user.name}
                                style={{ marginLeft: 5 }}
                            />
                            {
                                content.title !== '' ?
                                    <Text
                                        text={content.title}
                                        style={{ marginLeft: 5, fontSize: 12, fontWeight: 'normal' }}
                                    />
                                    :
                                    null
                            }
                        </View>
                    </View>
                    <TouchableOpacity style={{ padding: 5 }} onPress={() => this.props.navigation.dispatch(StackActions.pop())}>
                        <Icon name="close" color="#FFF" type="material-community" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
}

export default observer(WatchStory);

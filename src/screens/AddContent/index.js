/* eslint-disable dot-notation */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React, { Component } from 'react';
import { StyleSheet, View, Alert, TouchableOpacity, Dimensions, PermissionsAndroid, Platform, TextInput } from 'react-native';
import { NodeCameraView } from 'react-native-nodemediaclient';
import axios from 'axios';
import Carousel from 'react-native-snap-carousel';
import Video from 'react-native-video';
import * as ImagePicker from 'react-native-image-picker';
import { makeid, sleep } from '../../lib';
import storage from '@react-native-firebase/storage';
import { StackActions } from '@react-navigation/native';
import Store from '../../store/Store';
import { Loading, Text, Button, Header } from '../../components';
import { constants } from '../../resources';
import { createVideoData, getUserPosts, checkUserInfo, createStoryData } from '../../services';
import { Icon } from 'react-native-elements';
import { createThumbnail } from 'react-native-create-thumbnail';
import { SafeAreaView } from 'react-native';
import { KeyboardAvoidingView } from 'react-native';
import { RNCamera } from 'react-native-camera';
import database from '@react-native-firebase/database';
import MyImage from '../../components/MyImage';

const { width, height } = Dimensions.get('window');
const TOP_PADDING = height >= 812 ? 60 : 40;

export default class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isPublishing: false,
            hasPermission: false,
            paused: true,
            streamId: '',
            streamKey: '',
            publicKey: '',
            ratio: '16:9',
            isRecording: false,
            indexButton: 1,
            liveStreamId: '',
            loading: false,
            url: '',
            title: '',
            assetId: '',
            uid: '',
            camera: 1,
            influencerPrice: constants.TIERS[0],
            influencer: false,
            editTextModal: false,
            seconds: 0,
            timer: false,
            type: '',
            storyVideo: false,
            onPage: true,
        };

        this.settings = {
            audio: { bitrate: 128000, profile: 1, samplerate: 44100 },
            video: {
                preset: 4,
                bitrate: 2000000,
                profile: 2,
                fps: 30,
                videoFrontMirror: true,
            },
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

    componentDidMount() {
        this.createStream();
    }

    componentWillUnmount = async () => {
        if (this.state.isPublishing && this.state.seconds >= 10) {
            await this.stopLiveAndPublishPost();
            this.setState({ onPage: false });
        }
    }

    getAssetInfo = async (id) => {
        try {
            const uid = makeid(40, 'uuid');
            this.setState({ uid });

            var livestream = {
                uid: uid,
                url: `https://stream.mux.com/${this.state.publicKey}.m3u8`,
                thumbnail: {
                    url: `https://image.mux.com/${this.state.publicKey}/thumbnail.png?width=${width}&height=${height}&fit_mode=pad`,
                    width: width,
                    height: height,
                },
                publicKey: this.state.publicKey,
                liveId: id,
                title: this.state.title === '' ? 'Livestream' : this.state.title,
                photo: `https://image.mux.com/${this.state.publicKey}/thumbnail.png?width=${width}&height=${height}&fit_mode=pad`,
            };

            if (!this.state.onPage) {
                return true;
            }

            await sleep(5000);

            const livestreamResponse = await this.mux_instance.get('/video/v1/live-streams/' + id);
            const assetResponse = await this.mux_instance.get('/video/v1/assets/' + livestreamResponse.data.data.active_asset_id);

            const assetPlaybackId = assetResponse.data.data.playback_ids[0].id;
            var video = {
                uid: uid,
                url: `https://stream.mux.com/${assetPlaybackId}.m3u8`,
                thumbnail: {
                    url: `https://image.mux.com/${assetPlaybackId}/thumbnail.png?width=${width}&height=${height}&fit_mode=pad`,
                    width: width,
                    height: height,
                },
                assetPlaybackId: assetPlaybackId,
                title: this.state.title === '' ? 'New Video' : this.state.title,
                photo: `https://image.mux.com/${assetPlaybackId}/thumbnail.png?width=${width}&height=${height}&fit_mode=pad`,
                active: false,
            };

            await createVideoData(Store.user, livestream, 'live');
            await createVideoData(Store.user, video);

            this.setState({ assetId: livestreamResponse.data.data.active_asset_id, assetPlaybackId });
        } catch (err) {
            console.log('err: ', err);
            return Alert.alert('Oops', 'Something unexpected happens.', [{ text: 'Okay' }]);
        }
    }

    createStream = async () => {
        try {
            const mux_response = await this.mux_instance.post('/video/v1/live-streams', {
                reduced_latency: true,
                playback_policy: ['public'],
                new_asset_settings: {
                    playback_policy: ['public'],
                },
            });

            const mux_stream_key = mux_response.data.data.stream_key;
            const mux_playback_id = mux_response.data.data.playback_ids[0].id;

            this.setState({
                streamKey: mux_stream_key,
                publicKey: mux_playback_id,
                liveStreamId: mux_response.data.data.id,
            });
        } catch (err) {
            console.log('error creating new livestream: ', err);
        }
    };

    uploadVideo = async (uri, onname, type = 'photo') => {
        var ref = storage().ref().child(`videos/${onname}.mp4`);
        await ref.putFile(uri);

        return await ref.getDownloadURL();
    };

    uploadThumbnail = async (uri, onname) => {
        var ref = storage().ref().child(`thumbnails/${onname}.jpg`);
        await ref.putFile(uri);

        return await ref.getDownloadURL();
    };

    uploadStories = async (uri, onname, type = 'photo') => {
        if (type === 'photo') {
            var ref = storage().ref().child(`stories/${onname}.jpg`);
            await ref.putFile(uri);

            return await ref.getDownloadURL();
        } else {
            var ref = storage().ref().child(`stories/${onname}.mp4`);
            await ref.putFile(uri);

            return await ref.getDownloadURL();
        }
    };

    handlevideoPicked = async (url) => {
        this.setState({ loading: true, paused: true });

        const onname = makeid(40, 'uuid');

        const data = await this.uploadVideo(url, onname);
        const thumbnail = await createThumbnail({ url: url, timeStamp: 10000 });
        const thumbnailUrl = await this.uploadThumbnail(thumbnail.path, onname);

        const videoThumbURL = `${constants.VIDEO_THUMB_URL}${onname}_500x500.jpg?alt=media`;

        var video = {
            uid: onname,
            url: data,
            thumbnail: {
                url: thumbnailUrl,
                width: thumbnail.width,
                height: thumbnail.height,
            },
            title: this.state.title === '' ? 'New Video' : this.state.title,
            photo: videoThumbURL,
        };

        try {
            await createVideoData(Store.user, video);
            await getUserPosts(Store.user.uid, true);
            this.props.navigation.dispatch(StackActions.pop());
        } catch (error) {
            return Alert.alert('Oops', 'Something unexpected happens.', [{ text: 'Okay' }]);
        }

        this.setState({ loading: false });
    }

    onBuffer = (buffer) => {
        console.log('onBuffer: ', buffer);
    };

    onError = (error) => {
        console.log('onError: ', error);
    };

    handleStoryPicked = async (url, type) => {
        this.setState({ loading: true, storyVideo: true });

        const onname = makeid(40, 'uuid');

        const data = await this.uploadStories(url, onname, type);

        var content = {
            uid: onname,
            url: data,
        };

        try {
            await createStoryData(Store.user, content, type, this.state.title);
            this.props.navigation.dispatch(StackActions.pop());
        } catch (error) {
            return Alert.alert('Oops', 'Something unexpected happens.', [{ text: 'Okay' }]);
        }

        this.setState({ loading: false });
    }

    checkPermissions = async () => {
        try {
            const granted = await PermissionsAndroid.requestMultiple([
                PermissionsAndroid.PERMISSIONS.CAMERA,
                PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            ]);

            let hasAllPermissions = true;
            Object.keys(granted).forEach((key) => {
                if (granted[key] !== 'granted') {
                    hasAllPermissions = false;
                }
            });

            this.setState({ hasPermission: hasAllPermissions });
        } catch (err) {
            console.warn(err);
        }
    };

    startRecord = async () => {
        const { isRecording, hasPermission } = this.state;

        if (Platform.OS === 'android') {
            if (!hasPermission) {
                this.checkPermissions();
                return;
            }
        }

        const options = {
            mute: false,
            codec: RNCamera.Constants.VideoCodec['H264'],
        };

        try {
            if (isRecording) {
                await this.camera.stopRecording();
                this.setState({ isRecording: false });
            } else {
                const data = this.camera.recordAsync(options);
                this.setState({ isRecording: true });
                const result = await data;
                this.setState({ url: result.uri, type: 'video' });
            }
        } catch (error) {
            console.log(error);
        }
    };

    onPressPublishBtn = async () => {
        const { isPublishing: publishingState, hasPermission } = this.state;

        if (Platform.OS === 'android') {
            if (!hasPermission) {
                this.checkPermissions();
                return;
            }
        }

        if (publishingState) {
            this.vb.stop();
            this.stopLiveAndPublishPost();
            this.props.navigation.dispatch(StackActions.pop());
            this.setState({ timer: false, seconds: 0 });
        } else {
            const activeLive = await this.checkActiveLive();

            if (activeLive) {
                return Alert.alert('Oops', 'The previous live broadcast is still in progress. Please try again in 1-2 minutes.', [{ text: 'Okay' }]);
            } else {
                this.vb.start();
                this.getAssetInfo(this.state.liveStreamId);
                this.setState({ timer: true }, () => {
                    this.startTimer();
                });
            }
        }

        this.setState({ isPublishing: !publishingState });
    };

    checkActiveLive = async () => {
        try {
            const result = await database().ref('live').once('value');
            const data = result.val();
            const keys = Object.keys(data);

            for (let i = 0; i < keys.length; i++) {
                const k = keys[i];
                const element = data[k];

                if (element.user.uid === Store.user.uid) {
                    return true;
                }
            }

            return false;
        } catch (error) {
            return false;
        }
    }

    startTimer = async () => {
        while (this.state.timer) {
            await sleep(1000);
            this.setState({ seconds: this.state.seconds + 1 });
            if (this.state.indexButton === 2 && this.state.seconds >= 10) {
                this.stopStoryVideo();
                break;
            }
        }
    }

    stopStoryVideo = async () => {
        this.camera.stopRecording();
        this.setState({ isRecording: false, seconds: 0, timer: false });
    }

    startStoryVideo = async () => {
        const options = {
            mute: false,
            codec: RNCamera.Constants.VideoCodec['H264'],
        };

        const data = this.camera.recordAsync(options);

        this.setState({ timer: true }, () => {
            this.startTimer();
        });

        this.setState({ isRecording: true });
        const result = await data;

        this.setState({ url: result.uri, type: 'storyVideo', timer: true });
    }

    stopLiveAndPublishPost = async () => {
        // const result = await database().ref('posts').child(Store.user.uid).child(this.state.uid).once('value');

        // var updates = {};

        // updates[`live/${this.state.uid}`] = null;

        // if (result.val()) {
        //     updates[`posts/${Store.user.uid}/${this.state.uid}/active`] = true;
        // }

        // database().ref().update(updates);
        return Alert.alert('Yeyy', 'Your live stream is over. Your live broadcast will appear in your videos section in 1-2 minutes.', [{ text: 'Okay' }]);
    }

    selectVideoFromRoll = async () => {
        ImagePicker.launchImageLibrary({ mediaType: 'video' }, result => {
            if (!result.didCancel) {
                this.setState({ url: result.uri, type: 'video' });
            }
        });
    }

    becomeInfluencer = async () => {
        var updates = {};

        if (!this.state.influencer) {
            return Alert.alert('Oops', 'You have to accept Terms & Conditions.', [{ text: 'Okay' }]);
        }

        updates[`users/${Store.user.uid}/type`] = 'influencer';
        updates[`users/${Store.user.uid}/price`] = parseFloat(this.state.influencerPrice.price.toFixed(2));

        this.setState({ loading: true });
        await database().ref().update(updates);
        await checkUserInfo(Store.uid, true);
        this.setState({ loading: false });
    }

    setPrice = (type) => {
        const { influencerPrice } = this.state;
        var counter = 0;

        for (let i = 0; i < constants.TIERS.length; i++) {
            const element = constants.TIERS[i];

            if (element.price === influencerPrice.price) {
                counter = i;
                break;
            }
        }

        if (type === 'minus') {
            if (influencerPrice.price === constants.TIERS[0].price) {
                this.setState({ influencerPrice: constants.TIERS[constants.TIERS.length - 1] });
            } else {
                this.setState({ influencerPrice: constants.TIERS[counter - 1] });
            }
        } else {
            if (influencerPrice.price === constants.TIERS[constants.TIERS.length - 1].price) {
                this.setState({ influencerPrice: constants.TIERS[0] });
            } else {
                this.setState({ influencerPrice: constants.TIERS[counter + 1] });
            }
        }
    }

    takeStoryPhoto = async () => {
        const data = await this.camera.takePictureAsync({ quality: 0.2 });
        this.setState({ type: 'storyPhoto', url: data.uri });
    }

    setSnapToItem = (index) => {
        const { isPublishing, isRecording } = this.state;

        if (index === 0) {
            this.carousel.snapToItem(1, true, true);
            return this.selectVideoFromRoll();
        }

        if (!isPublishing && !isRecording) {
            return this.setState({ indexButton: index });
        }
    }

    renderItem = ({ item, index }) => {
        const { isPublishing, isRecording } = this.state;

        return (
            <TouchableOpacity
                onPress={() => {
                    if (index === 0) {
                        return this.selectVideoFromRoll();
                    }

                    if (!isPublishing && !isRecording) {
                        this.carousel.snapToItem(index);
                        this.setState({ indexButton: index });
                    }
                }}>
                <View style={{ justifyContent: 'center', alignItems: 'center', alignSelf: 'center', backgroundColor: 'transparent', elevation: 4, padding: 20 }}>
                    <Text
                        text={item.name}
                        style={styles.btnText}
                    />
                </View>
            </TouchableOpacity>
        );
    };

    renderVideo = () => {
        return (
            <SafeAreaView style={{ position: 'absolute', flex: 1, width: width, height: height, backgroundColor: constants.BACKGROUND_COLOR, alignItems: 'center', justifyContent: 'center' }}>
                <Video
                    source={{ uri: this.state.url }}
                    ref={(ref) => { this.player = ref; }}
                    style={{ flex: 1, width: width, height: height }}
                    paused={this.state.paused}
                    repeat
                />
                <KeyboardAvoidingView behavior="padding" style={{ position: 'absolute', width: width, height: height, alignItems: 'center', justifyContent: 'center' }}>
                    <View style={{ position: 'absolute', width: width, height: height, alignItems: 'center', justifyContent: 'center', backgroundColor: '#000', opacity: 0.6 }} />
                    <TouchableOpacity onPress={() => this.setState({ paused: !this.state.paused })}>
                        <View style={{ width: width / 2, height: width / 2, borderRadius: width / 4, borderColor: 'white', borderWidth: 2, alignItems: 'center', justifyContent: 'center' }}>
                            <View style={{ width: width / 2, height: width / 2, borderRadius: width / 4, borderColor: 'white', borderWidth: 2, position: 'absolute', backgroundColor: 'white', opacity: 0.5 }} />
                            <Icon
                                name={this.state.paused ? 'play' : 'pause'}
                                color="#FFF"
                                type="material-community"
                                size={64}
                            />
                        </View>
                    </TouchableOpacity>
                    <TextInput
                        placeholder="Title"
                        style={{ fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif-condensed', margin: 10, padding: 15, color: 'white', fontSize: 14 }}
                        underlineColorAndroid="transparent"
                        onChangeText={textInput => this.setState({ title: textInput })}
                        value={this.state.title}
                        maxLength={50}
                        placeholderTextColor="whitesmoke"
                    />
                    <Button
                        text="POST"
                        buttonStyle={{ backgroundColor: '#FFF', width: width / 2, borderRadius: 24, padding: 13 }}
                        textStyle={{ color: '#000', fontSize: 16, fontWeight: 'normal' }}
                        onPress={() => this.handlevideoPicked(this.state.url)}
                    />
                </KeyboardAvoidingView>
            </SafeAreaView>
        );
    }

    renderCamera = () => {
        const { hasPermission, camera } = this.state;

        if (Platform.OS === 'android' && !hasPermission) {
            return <View />;
        }

        return (
            <RNCamera
                ref={ref => {
                    this.camera = ref;
                }}
                style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, width, height }}
                type={camera === 1 ? RNCamera.Constants.Type.front : RNCamera.Constants.Type.back}
                androidCameraPermissionOptions={{
                    title: 'Permission to use camera',
                    message: 'We need your permission to use your camera',
                    buttonPositive: 'Ok',
                    buttonNegative: 'Cancel',
                }}
                autoFocus={camera === 1 ? RNCamera.Constants.AutoFocus.off : RNCamera.Constants.AutoFocus.on}
                androidRecordAudioPermissionOptions={{
                    title: 'Permission to use audio recording',
                    message: 'We need your permission to use your audio',
                    buttonPositive: 'Ok',
                    buttonNegative: 'Cancel',
                }}
            />
        );
    }

    renderLiveCamera = () => {
        const { hasPermission, streamKey } = this.state;

        if (Platform.OS === 'android' && !hasPermission) {
            return <View />;
        }

        return (
            <NodeCameraView
                style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, width, height }}
                ref={(vb) => { this.vb = vb; }}
                outputUrl={`rtmp://live.mux.com/app/${streamKey}`}
                camera={{
                    cameraId: this.state.camera,
                    cameraFrontMirror: true,
                }}
                audio={this.settings.audio}
                video={this.settings.video}
                autopreview={true}
            />
        );
    };

    renderEdit = () => {
        return (
            <SafeAreaView style={{ position: 'absolute', flex: 1, width: width, height: height, alignItems: 'center', justifyContent: 'center' }}>
                <KeyboardAvoidingView behavior="padding" style={{ position: 'absolute', width: width, height: height, alignItems: 'center', justifyContent: 'center' }}>
                    <TouchableOpacity activeOpacity={0.9} style={{ position: 'absolute' }} onPress={() => this.setState({ editTextModal: false, title: '' })}>
                        <View style={{ width: width, height: height, alignItems: 'center', justifyContent: 'center', backgroundColor: '#000', opacity: 0.6 }} />
                    </TouchableOpacity>
                    <TextInput
                        placeholder="Title"
                        style={{ fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif-condensed', margin: 10, padding: 15, color: 'white', fontSize: 14, fontWeight: 'bold' }}
                        underlineColorAndroid="transparent"
                        onChangeText={textInput => this.setState({ title: textInput })}
                        value={this.state.title}
                        maxLength={30}
                        placeholderTextColor="gray"
                    />
                    <Button
                        text="Set Title"
                        buttonStyle={{ backgroundColor: '#FFF', width: width / 2, borderRadius: 24, padding: 13 }}
                        textStyle={{ color: '#000', fontSize: 12 }}
                        onPress={() => this.setState({ editTextModal: false })}
                    />
                </KeyboardAvoidingView>
            </SafeAreaView>
        );
    }

    renderStoryVideo = () => {
        return (
            <SafeAreaView style={{ position: 'absolute', flex: 1, width: width, height: height, backgroundColor: constants.BACKGROUND_COLOR, alignItems: 'center', justifyContent: 'flex-end' }}>
                <Video
                    source={{ uri: this.state.url }}
                    ref={(ref) => { this.player = ref; }}
                    style={{ width, height, position: 'absolute' }}
                    paused={this.state.storyVideo}
                    repeat
                />
                <TouchableOpacity
                    style={{ position: 'absolute', left: 0, bottom: height / 2 }}
                    onPress={() => this.setState({ editTextModal: true })}>
                    <View style={{ paddingHorizontal: 10, paddingVertical: 3, flexDirection: 'row', alignItems: 'center' }}>
                        <Icon name="text" color="#FFF" type="material-community" />
                        <Text text={this.state.title !== '' ? this.state.title : 'Title'} style={{ marginLeft: 5 }} />
                    </View>
                </TouchableOpacity>
                <Button
                    text="POST"
                    buttonStyle={{ backgroundColor: '#FFF', width: width / 2, borderRadius: 24, padding: 13, marginBottom: 20 }}
                    textStyle={{ color: '#000', fontSize: 16, fontWeight: 'normal' }}
                    onPress={() => this.handleStoryPicked(this.state.url, 'video')}
                />
            </SafeAreaView>
        );
    }

    renderStoryPhoto = () => {
        return (
            <SafeAreaView style={{ position: 'absolute', flex: 1, width: width, height: height, backgroundColor: constants.BACKGROUND_COLOR, alignItems: 'center', justifyContent: 'flex-end' }}>
                <MyImage
                    photo={this.state.url}
                    style={{ width, height, position: 'absolute' }}
                />
                <TouchableOpacity
                    style={{ position: 'absolute', left: 0, bottom: height / 2 }}
                    onPress={() => this.setState({ editTextModal: true })}>
                    <View style={{ paddingHorizontal: 10, paddingVertical: 3, flexDirection: 'row', alignItems: 'center' }}>
                        <Icon name="text" color="#FFF" type="material-community" />
                        <Text text={this.state.title !== '' ? this.state.title : 'Title'} style={{ marginLeft: 5 }} />
                    </View>
                </TouchableOpacity>
                <Button
                    text="POST"
                    buttonStyle={{ backgroundColor: '#FFF', width: width / 2, borderRadius: 24, padding: 13, marginBottom: 20 }}
                    textStyle={{ color: '#000', fontSize: 16, fontWeight: 'normal' }}
                    onPress={() => this.handleStoryPicked(this.state.url, 'photo')}
                />
            </SafeAreaView>
        );
    }

    render() {
        const {
            loading,
            isPublishing,
            indexButton,
            url,
            isRecording,
            influencerPrice,
            influencer,
            editTextModal,
            seconds,
            type,
            title,
        } = this.state;

        if (Store.user.type === 'user') {
            return (
                <View style={{ flex: 1, backgroundColor: constants.BACKGROUND_COLOR }}>
                    <Header
                        title="Become a Creator"
                        leftButtonPress={() => this.props.navigation.dispatch(StackActions.pop())}
                        leftButtonIcon="close"
                    />
                    {
                        loading ?
                            <Loading
                                loadingStyle={{ width, height, alignItems: 'center', justifyContent: 'center' }}
                                textStyle={{ marginTop: 10, fontWeight: 'normal' }}
                                text="Loading"
                            />
                            :
                            <View style={{ flex: 1, backgroundColor: constants.BACKGROUND_COLOR, justifyContent: 'center', alignItems: 'center' }}>
                                <Text
                                    text="Set your subscription price"
                                    style={{ fontSize: 20, marginTop: 10 }}
                                />
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <TouchableOpacity onPress={() => this.setPrice('minus')}>
                                        <View style={{ padding: 5 }}>
                                            <Icon name="chevron-left" color="#FFF" type="material-community" />
                                        </View>
                                    </TouchableOpacity>
                                    <View style={{ paddingHorizontal: 20 }}>
                                        <Text
                                            text={`${influencerPrice.price.toFixed(2)} $`}
                                            style={{ fontSize: 24, marginTop: 10 }}
                                        />
                                        <Text
                                            text={'/per month'}
                                            style={{ fontSize: 12, color: 'gray' }}
                                        />
                                    </View>
                                    <TouchableOpacity onPress={() => this.setPrice('plus')}>
                                        <View style={{ padding: 5 }}>
                                            <Icon name="chevron-right" color="#FFF" type="material-community" />
                                        </View>
                                    </TouchableOpacity>
                                </View>
                                <TouchableOpacity onPress={() => this.setState({ influencer: !influencer })}>
                                    <View style={{ flexDirection: 'row', marginTop: 10, width: width - 40, alignItems: 'center' }}>
                                        <Icon name="check-circle" color={influencer ? constants.BLUE : 'gray'} type="material-community" />
                                        <Text
                                            text="I want to be as an influencer. I have readed Term & Conditions."
                                            style={{ fontSize: 12, marginLeft: 5, fontWeight: 'normal' }}
                                        />
                                    </View>
                                </TouchableOpacity>
                                <Button
                                    text="Become an Creator"
                                    buttonStyle={{ backgroundColor: '#FFF', borderRadius: 24, padding: 13, width: width - 40, marginTop: 20 }}
                                    textStyle={{ color: '#000', fontSize: 16 }}
                                    onPress={() => this.becomeInfluencer()}
                                />
                            </View>
                    }
                </View>
            );
        }

        var icon = 'camera';
        var iconColor = constants.BACKGROUND_COLOR;
        var buttonColor = 'white';

        if (indexButton === 0) {
            if (isPublishing || isRecording) {
                icon = 'camera-off';
                iconColor = constants.RED;
                buttonColor = constants.RED;
            } else {
                icon = 'camera';
                iconColor = constants.BACKGROUND_COLOR;
                buttonColor = 'white';
            }
        } else if (indexButton === 1) {
            if (isPublishing || isRecording) {
                iconColor = constants.RED;
                buttonColor = constants.RED;
            } else {
                iconColor = constants.BACKGROUND_COLOR;
                buttonColor = 'white';
            }

            icon = 'access-point';
        } else {
            if (isPublishing || isRecording) {
                iconColor = constants.RED;
                buttonColor = constants.RED;
            } else {
                iconColor = constants.BACKGROUND_COLOR;
                buttonColor = 'white';
            }

            icon = 'camera';
        }

        return (
            <View style={{ flex: 1, backgroundColor: constants.BACKGROUND_COLOR }}>
                {(indexButton === 1 && url === '') ? this.renderLiveCamera() : null}
                {(indexButton === 2 && url === '') ? this.renderCamera() : null}
                {(indexButton === 0 && url === '') ? this.renderCamera() : null}
                <View style={{ position: 'absolute', bottom: 30, justifyContent: 'center', alignItems: 'center', width: width }}>
                    <TouchableOpacity
                        style={{ margin: 10 }}
                        onPressOut={() => indexButton === 2 ? this.stopStoryVideo() : null}
                        onLongPress={() => indexButton === 2 ? this.startStoryVideo() : null}
                        onPress={() => {
                            if (indexButton === 1) {
                                this.onPressPublishBtn();
                            } else if (indexButton === 0) {
                                this.startRecord();
                            } else {
                                this.takeStoryPhoto();
                            }
                        }}>
                        <View style={{ justifyContent: 'center', alignItems: 'center', alignSelf: 'center', backgroundColor: 'white', elevation: 4, width: 70, height: 70, borderRadius: 35, borderWidth: 1, borderColor: buttonColor }}>
                            <Icon
                                name={icon}
                                color={iconColor}
                                type="material-community"
                            />
                        </View>
                    </TouchableOpacity>
                    <Carousel
                        ref={(c) => { this.carousel = c; }}
                        data={[{ name: 'Video' }, { name: 'Live' }, { name: 'Story' }]}
                        renderItem={this.renderItem}
                        sliderWidth={width * 0.8}
                        itemWidth={width / 3}
                        activeAnimationType={'spring'}
                        activeAnimationOptions={{
                            friction: 4,
                            tension: 40,
                        }}
                        removeClippedSubviews={false}
                        inactiveSlideScale={0.6}
                        inactiveSlideOpacity={0.6}
                        scrollEnabled={(!isPublishing && !isRecording)}
                        enableMomentum
                        firstItem={1}
                        activeSlideAlignment={'center'}
                        onSnapToItem={(index) => this.setSnapToItem(index)}
                    />
                    {
                        indexButton === 0 ?
                            <TouchableOpacity
                                style={{ position: 'absolute', left: 0, top: 10 }}
                                onPress={() => this.selectVideoFromRoll()}>
                                <View style={{ justifyContent: 'center', alignItems: 'center', alignSelf: 'center', backgroundColor: 'transparent', borderColor: 'darkgrey', borderTopWidth: 1, borderBottomWidth: 1, borderRightWidth: 1, borderTopRightRadius: 12, borderBottomRightRadius: 12, padding: 10, flexDirection: 'row' }}>
                                    <Icon name="upload" color="#FFF" type="material-community" size={16} />
                                    <Text text="Upload" style={{ marginLeft: 5 }} />
                                </View>
                            </TouchableOpacity>
                            :
                            null
                    }
                </View>
                {
                    indexButton === 1 ?
                        <TouchableOpacity
                            style={{ position: 'absolute', right: 0, top: TOP_PADDING }}>
                            <View style={{ justifyContent: 'center', alignItems: 'center', alignSelf: 'center', backgroundColor: '#FFF', borderTopLeftRadius: 12, borderBottomLeftRadius: 12, paddingVertical: 10, paddingHorizontal: 20 }}>
                                <Text text={isPublishing ? 'Live' : 'Ready'} style={{ color: isPublishing ? constants.RED : '#000' }} />
                            </View>
                        </TouchableOpacity>
                        :
                        null
                }
                {
                    indexButton === 1 && !isPublishing ?
                        <TouchableOpacity
                            style={{ position: 'absolute', left: 0, bottom: height / 2 }}
                            onPress={() => this.setState({ editTextModal: true })}>
                            <View style={{ paddingHorizontal: 10, paddingVertical: 3, flexDirection: 'row', alignItems: 'center' }}>
                                <Icon name="text" color="#FFF" type="material-community" />
                                <Text text={title !== '' ? title : 'Title'} style={{ marginLeft: 5 }} />
                            </View>
                        </TouchableOpacity>
                        :
                        null
                }
                {
                    indexButton === 1 && isPublishing ?
                        <View style={{ position: 'absolute', left: 0, bottom: height / 2 }}>
                            <View style={{ paddingHorizontal: 10, paddingVertical: 3, flexDirection: 'row', alignItems: 'center' }}>
                                <Icon name="clock" color="#FFF" type="material-community" />
                                <Text text={`${Math.floor(seconds / 60) < 10 ? '0' + Math.floor(seconds / 60) : Math.floor(seconds / 60)}:${Math.floor(seconds % 60) < 10 ? '0' + Math.floor(seconds % 60) : Math.floor(seconds % 60)}`} style={{ marginLeft: 5 }} />
                            </View>
                        </View>
                        :
                        null
                }
                {
                    indexButton === 2 && isRecording ?
                        <View style={{ position: 'absolute', left: 0, bottom: height / 2 }}>
                            <View style={{ paddingHorizontal: 10, paddingVertical: 3, flexDirection: 'row', alignItems: 'center' }}>
                                <Icon name="clock" color="#FFF" type="material-community" />
                                <Text text={`${Math.floor(seconds / 60) < 10 ? '0' + Math.floor(seconds / 60) : Math.floor(seconds / 60)}:${Math.floor(seconds % 60) < 10 ? '0' + Math.floor(seconds % 60) : Math.floor(seconds % 60)}`} style={{ marginLeft: 5 }} />
                            </View>
                        </View>
                        :
                        null
                }
                <TouchableOpacity
                    style={{ position: 'absolute', right: 0, bottom: 40 }}
                    onPress={() => {
                        this.setState({ camera: this.state.camera === 1 ? 0 : 1 });

                        if (indexButton === 1) {
                            this.vb.switchCamera();
                        }
                    }}>
                    <View style={{ padding: 10 }}>
                        <Icon name="camera-reverse" color="#FFF" type="ionicon" size={32} />
                    </View>
                </TouchableOpacity>
                {
                    (url !== '' && type === 'video') ?
                        this.renderVideo()
                        :
                        null
                }
                {
                    (url !== '' && type === 'storyPhoto') ?
                        this.renderStoryPhoto()
                        :
                        null
                }
                {
                    (url !== '' && type === 'storyVideo') ?
                        this.renderStoryVideo()
                        :
                        null
                }
                {
                    editTextModal ?
                        this.renderEdit()
                        :
                        null
                }
                {
                    loading ?
                        <Loading
                            loadingStyle={{ width, height, alignItems: 'center', justifyContent: 'center', backgroundColor: constants.BACKGROUND_COLOR }}
                            textStyle={{ marginTop: 10, fontWeight: 'normal' }}
                            text="Loading"
                        />
                        :
                        null
                }
                {
                    !isPublishing && !isRecording ?
                        <TouchableOpacity
                            style={{ position: 'absolute', left: 0, top: TOP_PADDING }}
                            onPress={() => this.props.navigation.dispatch(StackActions.pop())}>
                            <View style={{ paddingHorizontal: 10 }}>
                                <Icon name="close" color="#FFF" type="material-community" />
                            </View>
                        </TouchableOpacity>
                        :
                        null
                }
            </View>
        );
    }
}

const styles = StyleSheet.create({
    adminBtn: {
        backgroundColor: '#006D9E',
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
        elevation: 4,
        borderWidth: 0,
        marginVertical: 10,
    },
    preview: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    btnText: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
    uploadText: { color: '#FFF', fontSize: 18 },

    flipButton: {
        flex: 0.3,
        height: 40,
        marginHorizontal: 2,
        marginBottom: 10,
        marginTop: 10,
        borderRadius: 8,
        borderColor: 'white',
        borderWidth: 1,
        padding: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

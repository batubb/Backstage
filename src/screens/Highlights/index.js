/* eslint-disable react/no-did-mount-set-state */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React, { Component } from 'react';
import { View, Dimensions, FlatList, TouchableOpacity, TextInput, Platform, Modal, RefreshControl } from 'react-native';
import { observer } from 'mobx-react';
import LinearGradient from 'react-native-linear-gradient';
import { Icon, Overlay } from 'react-native-elements';
import { Loading, Header, Text, MyImage } from '../../components';
import { constants } from '../../resources';
import { getUserPosts, setHighlights } from '../../services';
import Store from '../../store/Store';
import { setPosts, makeid } from '../../lib';
import { StackActions } from '@react-navigation/native';

const { width } = Dimensions.get('window');

class Highlights extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            refreshing: false,
            group: typeof this.props.route.params.group === 'undefined' ? null : this.props.route.params.group,
            groupName: typeof this.props.route.params.group === 'undefined' ? '' : this.props.route.params.group.name,
            groupId: typeof this.props.route.params.group === 'undefined' ? makeid(30) : this.props.route.params.group.uid,
            highlights: [],
        };
    }

    componentDidMount = async () => {
        const posts = await getUserPosts(Store.user.uid, true);
        var highlights = [];

        for (let i = 0; i < posts.length; i++) {
            const element = posts[i];
            var control = false;

            if (typeof element.groups !== 'undefined') {
                if (typeof element.groups[this.state.groupId] !== 'undefined') {
                    if (element.groups[this.state.groupId].uid === this.state.groupId) {
                        control = true;
                    }
                }
            }

            if (control) {
                highlights.push({ ...element, active: true });
            } else {
                highlights.push({ ...element, active: false });
            }
        }

        const { postsArray, daily } = setPosts(posts);

        this.setState({ posts, highlights, postsArray, daily: daily, loading: false });
    }

    setHighlights = (item, index) => {
        var highlights = this.state.highlights;
        highlights[index].active = !highlights[index].active;
        this.setState({ highlights });
    }

    saveHighlights = async () => {
        const result = await setHighlights(Store.user, this.state.highlights, { name: this.state.groupName, uid: this.state.groupId });

        if (result) {
            await getUserPosts(Store.user.uid, true);
            this.props.navigation.dispatch(StackActions.pop(1));
        }
    }

    groupNameInput = (groupName) => {
        return (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: width - 20, borderRadius: 4, backgroundColor: constants.BAR_COLOR }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TextInput
                        placeholder="Highlight Name"
                        style={{ fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif-condensed', color: '#FFF', width: width - 100, fontSize: 16, padding: 10 }}
                        underlineColorAndroid="transparent"
                        onChangeText={groupNameInput => this.setState({ groupName: groupNameInput })}
                        value={groupName}
                        placeholderTextColor="gray"
                    />
                </View>
                {
                    groupName !== '' ?
                        <TouchableOpacity onPress={() => this.setState({ groupName: '' })}>
                            <View style={{ padding: 10 }}>
                                <Icon name="close-circle" color="#FFF" type="material-community" size={16} />
                            </View>
                        </TouchableOpacity>
                        :
                        null
                }
            </View>
        );
    }

    render() {
        const { loading, refreshing, group, posts, groupName, groupId, highlights } = this.state;

        return (
            <View style={{ flex: 1, backgroundColor: constants.BACKGROUND_COLOR }}>
                <Header
                    title={group ? 'Edit Highlights' : 'Add Highlights'}
                    leftButtonPress={() => this.props.navigation.dispatch(StackActions.pop())}
                    leftButtonIcon="chevron-left"
                    rightButtonPress={() => this.saveHighlights()}
                    rightButtonIcon="check"
                />
                <View style={{ width: width, alignItems: 'center', paddingBottom: 5 }}>
                    {this.groupNameInput(groupName)}
                </View>
                {
                    loading ?
                        <Loading
                            loadingStyle={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
                            textStyle={{ marginTop: 10, fontWeight: 'normal' }}
                            text="Loading"
                        />
                        :
                        <FlatList
                            data={highlights}
                            keyExtractor={(item) => item.uid}
                            extraData={posts}
                            refreshControl={<RefreshControl refreshing={refreshing} tintColor="white" />}
                            numColumns={3}
                            renderItem={({ item, index }) =>
                                <View style={{ width: (width / 3), alignItems: 'center', marginVertical: 5 }}>
                                    <TouchableOpacity onPress={() => this.setHighlights(item, index)}>
                                        <View style={{ width: (width / 3) - 5, height: (1.5) * ((width / 3) - 5), backgroundColor: '#4d4d4d', alignItems: 'center', justifyContent: 'center' }}>
                                            <MyImage
                                                style={{ width: (width / 3) - 5, height: (1.5) * ((width / 3) - 5) }}
                                                photo={item.photo}
                                            />
                                            {
                                                item.active ?
                                                    <View style={{ width: (width / 3) - 5, height: (1.5) * ((width / 3) - 5), position: 'absolute', backgroundColor: '#000', opacity: 0.5, alignItems: 'center', justifyContent: 'center' }}>
                                                        <Icon name="check" color="#FFF" type="material-community" size={64} />
                                                    </View>
                                                    :
                                                    null
                                            }
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            }
                        />
                }

            </View>
        );
    }
}

export default observer(Highlights);

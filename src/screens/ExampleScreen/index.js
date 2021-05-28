/* eslint-disable react/no-did-mount-set-state */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React, { Component } from 'react';
import { View, Dimensions, FlatList, TouchableOpacity, Image, ScrollView, RefreshControl } from 'react-native';
import { observer } from 'mobx-react';
import LinearGradient from 'react-native-linear-gradient';
import { Icon } from 'react-native-elements';
import { Loading, Header, Text } from '../../components';
import { constants } from '../../resources';
import { getFollowingLiveData, getFollowingUserPosts } from '../../services';
import Store from '../../store/Store';
import { followerCount } from '../../lib';

const { width } = Dimensions.get('window');

class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            refreshing: false,
        };
    }

    componentDidMount = async () => {

        this.setState({ loading: false });
    }

    render() {
        const { loading, refreshing } = this.state;

        return (
            <View style={{ flex: 1, backgroundColor: constants.BACKGROUND_COLOR }}>
                <Header
                    title="Featured"
                    placement='right'
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

                        </ScrollView>
                }
            </View>
        );
    }
}

export default observer(Home);

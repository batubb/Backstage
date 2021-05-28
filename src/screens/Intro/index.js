/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React, { Component } from 'react';
import { View, Dimensions, ScrollView, Image } from 'react-native';
import { observer } from 'mobx-react';
import { StackActions } from '@react-navigation/native';
import { Loading, Header, Text, MyImage, Button, Label } from '../../components';
import { constants } from '../../resources';
import Swiper from 'react-native-swiper'

const { width, height } = Dimensions.get('window');

class Intro extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            swiperIndex: 1,
        };
    }

    componentDidMount = async () => {

    }


    renderSwiperView = (image, title, caption, index) => {
        return (
            <View style={{ backgroundColor: constants.BAR_COLOR, borderRadius: 25, marginHorizontal: 10 }}>
                <Image
                    style={{ height: height * 0.50, width: width - 20, borderRadius: 25 }}
                    source={require(`../../images/slide-1.png`)}
                />
                <View style={{ padding: 20 }}>
                    <Text text={title} style={{ fontSize: 20 }} />
                    <Text text={caption} style={{ color: 'gray' }} />
                    <View style={{ flexDirection: 'row', marginTop: 10 }}>
                        <View style={{ padding: 3, borderWidth: 2, borderColor: '#FFF', width: index === 1 ? 20 : 5, borderRadius: 5, marginRight: 5, backgroundColor: index === 1 ? '#FFF' : null }} />
                        <View style={{ padding: 3, borderWidth: 2, borderColor: '#FFF', width: index === 2 ? 20 : 5, borderRadius: 5, marginRight: 5, backgroundColor: index === 2 ? '#FFF' : null }} />
                        <View style={{ padding: 3, borderWidth: 2, borderColor: '#FFF', width: index === 3 ? 20 : 5, borderRadius: 5, backgroundColor: index === 3 ? '#FFF' : null }} />
                    </View>
                    <View style={{ width: width - 60, flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, alignItems: 'center' }}>
                        <Button
                            buttonStyle={{ width: width / 3 - 25, backgroundColor: 'transparent', borderRadius: 25, borderWidth: 2, borderColor: 'gray' }}
                            textStyle={{ color: 'gray' }}
                            text="Skip"
                            onPress={() => this.props.navigation.dispatch(StackActions.pop())}
                        />
                        <Button
                            buttonStyle={{ width: 2 * width / 3 - 45, backgroundColor: 'white', borderWidth: 2, borderColor: '#FFF' }}
                            textStyle={{ color: '#000' }}
                            text="Next"
                            onPress={() => this.state.swiperIndex === 3 ? this.setState({ swiperIndex: 1 }) : this.setState({ swiperIndex: this.state.swiperIndex + 1 })}
                        />
                    </View>
                </View>
            </View>
        );
    }
    render() {
        const { loading, swiperIndex } = this.state;

        return (
            <View style={{ flex: 1, backgroundColor: constants.BACKGROUND_COLOR }}>
                <Header
                    title="Intro"
                    placement='right'
                    leftButtonPress={() => this.props.navigation.dispatch(StackActions.pop())} leftButtonIcon="chevron-left"
                />
                <View style={{ width: width, alignItems: 'center', flex: 1 }}>
                    {swiperIndex === 1 ? this.renderSwiperView('slide-1', 'Follow Your Favorite Influencer', 'Unlock your favorite influencer and follow him/her.', 1) : null}
                    {swiperIndex === 2 ? this.renderSwiperView('slide-1', 'Follow Your Favorite Influencer', 'Unlock your favorite influencer and follow him/her.', 2) : null}
                    {swiperIndex === 3 ? this.renderSwiperView('slide-1', 'Follow Your Favorite Influencer', 'Unlock your favorite influencer and follow him/her.', 3) : null}
                </View>
            </View>
        );
    }
}

export default observer(Intro);

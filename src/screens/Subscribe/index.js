/* eslint-disable radix */
/* eslint-disable react/no-did-mount-set-state */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React, { Component } from 'react';
import { View, Dimensions, TouchableOpacity, ScrollView, RefreshControl, Alert, Platform } from 'react-native';
import { observer } from 'mobx-react';
import { Loading, Header, Text, MyImage, Button } from '../../components';
import { constants } from '../../resources';
import { subscribeInfluencer, checkUserInfo, createCustomerAndSubscription, createToken } from '../../services';
import Store from '../../store/Store';
import { followerCount } from '../../lib';
import { StackActions } from '@react-navigation/native';
import TextInputMask from 'react-native-text-input-mask';

const { width } = Dimensions.get('window');

class Subscribe extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            refreshing: false,
            influencer: this.props.route.params.influencer,
            posts: typeof this.props.route.params.posts === 'undefined' ? [] : this.props.route.params.posts,
            showCard: false,
            cvc: '',
            cardNumber: '',
            expMonth: '',
            expYear: '',
            currency: 'usd',
        };
    }

    componentDidMount = async () => {
        const influencer = await checkUserInfo(this.state.influencer.uid);
        this.setState({ loading: false, influencer });
    }

    subscribeInf = async (influencer = this.state.influencer) => {
        if (this.state.cardNumber === '' || this.state.expMonth === '' || this.state.expYear === '' || this.state.cvc === '') {
            return Alert.alert('Oops', 'You have to enter all inputs.', [{ text: 'Okay' }]);
        }

        const year = new Date().getFullYear() - 2000;

        if (parseInt(this.state.expYear) === year) {
            if (parseInt(this.state.expMonth) - 1 < new Date().getMonth()) {
                return Alert.alert('Oops', "You card's expired date is invalid.", [{ text: 'Okay' }]);
            }
        } else if (parseInt(this.state.expYear) < year) {
            return Alert.alert('Oops', "You card's expired date is invalid.", [{ text: 'Okay' }]);
        }

        if (parseInt(this.state.expMonth) < 1 && parseInt(this.state.expMonth) > 12) {
            return Alert.alert('Oops', "You card's expired date is invalid.", [{ text: 'Okay' }]);
        }

        this.setState({ loading: true });

        try {
            const params = {
                number: this.state.cardNumber,
                exp_month: parseInt(this.state.expMonth),
                exp_year: parseInt(this.state.expYear),
                cvc: this.state.cvc,
            };

            const token = await createToken(params);

            if (typeof token.id !== 'undefined') {
                const subs = await createCustomerAndSubscription(Store.user, this.state.influencer, token, constants.TIER_1);

                if (subs) {
                    const result = await subscribeInfluencer(Store.user, influencer, subs);
                    if (result) {
                        return this.props.navigation.dispatch(StackActions.pop());
                    }
                } else {
                    this.setState({ loading: false });
                    return Alert.alert('Oops', 'Something is wrong please try again.', [{ text: 'Okay' }]);
                }
            } else {
                this.setState({ loading: false });
                return Alert.alert('Oops', 'Something is wrong please try again.', [{ text: 'Okay' }]);
            }
        } catch (error) {
            console.log(error);
            this.setState({ loading: false });
        }

    }

    renderProfileTop = (user) => {
        const constWidth = width / 3;
        return (
            <View style={{ width: width, flexDirection: 'row', padding: 15, alignItems: 'center' }}>
                <MyImage
                    style={{ width: constWidth, height: (constWidth) * (4 / 3), borderRadius: 8 }}
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
                </View>
            </View>
        );
    }

    renderDataBar = (user) => {
        return (
            <View style={{ flexDirection: 'row', width: width, paddingVertical: 10, marginBottom: 10 }}>
                <View style={{ alignItems: 'center', width: (width) / 2 }}>
                    <Text
                        text={followerCount(user.follower)}
                        style={{ fontSize: 18 }}
                    />
                    <Text
                        text="Members"
                        style={{ fontSize: 16 }}
                    />
                </View>
                <View style={{ alignItems: 'center', width: (width) / 2 }}>
                    <Text
                        text={this.state.posts.length.toString()}
                        style={{ fontSize: 18 }}
                    />
                    <Text
                        text="Posts"
                        style={{ fontSize: 16 }}
                    />
                </View>
            </View>
        );
    }

    renderPayments = () => {
        return (
            <View style={{ width: width, paddingHorizontal: 20, marginBottom: 10, alignItems: 'center' }}>
                <Text
                    text="Membership Payment"
                    style={{ fontSize: 24 }}
                />
                <Text
                    text="As a member, you'll remain anonymus. Become a member The creator won't see your username."
                    style={{ fontSize: 16, color: 'gray', fontWeight: 'normal', marginTop: 10 }}
                />
                <Text
                    text={`$ ${this.state.influencer.price.toFixed(2)}`}
                    style={{ fontSize: 32, marginTop: 10 }}
                />
                <Text
                    text="/ per month"
                    style={{ color: 'gray', fontWeight: 'normal' }}
                />
                <Button
                    buttonStyle={{ width: (width) - 60, backgroundColor: '#FFF', padding: 10, marginTop: 20, borderRadius: 24 }}
                    textStyle={{ color: 'black', fontWeight: 'normal' }}
                    text="JOIN"
                    onPress={() => this.setState({ showCard: true })}
                />
            </View>
        );
    }

    renderCard = () => {
        return (
            <View style={{ width: width, padding: 10 }}>
                <TextInputMask
                    value={this.state.cardNumber}
                    style={{ fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif-condensed', color: '#FFF', fontSize: 16, fontWeight: 'bold', width: width - 20, padding: 10, backgroundColor: 'gray', borderRadius: 4, textAlign: 'center' }}
                    onChangeText={(formatted, extracted) => this.setState({ cardNumber: extracted })}
                    mask={'[0000] [0000] [0000] [0000]'}
                    placeholder="Card Number"
                    placeholderTextColor="lightgray"
                    keyboardType="number-pad"
                />
                <View style={{ width: width - 20, flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
                    <TextInputMask
                        value={this.state.expMonth}
                        style={{ fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif-condensed', color: '#FFF', fontSize: 16, fontWeight: 'bold', width: (width - 20) / 5 - 5, padding: 10, backgroundColor: 'gray', borderRadius: 4, textAlign: 'center' }}
                        onChangeText={(formatted, extracted) => this.setState({ expMonth: extracted })}
                        mask={'[00]'}
                        placeholder="Month"
                        placeholderTextColor="lightgray"
                        keyboardType="number-pad"
                    />
                    <TextInputMask
                        value={this.state.expYear}
                        style={{ fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif-condensed', color: '#FFF', fontSize: 16, fontWeight: 'bold', width: (width - 20) / 5 - 5, padding: 10, backgroundColor: 'gray', borderRadius: 4, textAlign: 'center' }}
                        onChangeText={(formatted, extracted) => this.setState({ expYear: extracted })}
                        mask={'[00]'}
                        placeholder="Year"
                        placeholderTextColor="lightgray"
                        keyboardType="number-pad"
                    />
                    <TextInputMask
                        value={this.state.cvc}
                        style={{ fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif-condensed', color: '#FFF', fontSize: 16, fontWeight: 'bold', width: ((width - 20) * 3) / 5 - 5, padding: 10, backgroundColor: 'gray', borderRadius: 4, textAlign: 'center' }}
                        onChangeText={(formatted, extracted) => this.setState({ cvc: extracted })}
                        mask={'[000]'}
                        placeholder="CVC"
                        placeholderTextColor="lightgray"
                        keyboardType="number-pad"
                    />
                </View>
                <Text
                    text="We do not record or store your card information anywhere. All transactions are made and protected by the Stripe payment system."
                    style={{ color: 'gray', fontWeight: 'normal', fontSize: 12, marginTop: 10, marginHorizontal: 5 }}
                />
                <Button
                    buttonStyle={{ width: (width) - 20, backgroundColor: '#FFF', padding: 10, marginTop: 10, borderRadius: 4 }}
                    textStyle={{ color: 'black', fontSize: 16 }}
                    text="Subscribe"
                    onPress={() => this.subscribeInf()}
                />
            </View>
        );
    }

    render() {
        const { loading, refreshing, influencer, showCard } = this.state;

        return (
            <View style={{
                flex: 1, backgroundColor: constants.BACKGROUND_COLOR
            }}>
                <Header
                    leftButtonPress={() => this.props.navigation.dispatch(StackActions.pop())}
                    leftButtonIcon="chevron-left"
                    title={`Subscribe to ${influencer.name}`}
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
                            {
                                showCard ?
                                    this.renderCard()
                                    :
                                    <>
                                        {this.renderProfileTop(influencer)}
                                        {this.renderDataBar(influencer)}
                                        {this.renderPayments()}
                                    </>
                            }
                        </ScrollView>
                }
            </View >
        );
    }
}

export default observer(Subscribe);

/* eslint-disable no-shadow */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React, { Component } from 'react';
import { View, Dimensions, Platform, Alert, TouchableOpacity } from 'react-native';
import { observer } from 'mobx-react';
import { StackActions } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import TextInputMask from 'react-native-text-input-mask';
import { Loading, Header, Text, Button } from '../../components';
import { constants } from '../../resources';
import Store from '../../store/Store';
import SMSVerifyCode from 'react-native-sms-verifycode';
import { SafeAreaView } from 'react-native';
import { KeyboardAvoidingView } from 'react-native';
import { Icon } from 'react-native-elements';

const { width } = Dimensions.get('window');

// auth().settings.appVerificationDisabledForTesting = true;

class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            phoneFormatted: '',
            phoneExtracted: '',
            confirmation: false,
            confirmationCode: '',
            readed: true,
        };
    }

    componentDidMount = async () => {
        auth().onAuthStateChanged(auth => {
            if (auth) {
                Store.setPhone(auth.phoneNumber);
                Store.setUID(auth.uid);
                const replaceActions = StackActions.replace('CheckInfo');
                return this.props.navigation.dispatch(replaceActions);
            } else {
                Store.clearUserData();
                this.setState({ loading: false });
            }
        });
    }

    sendAuthCode = async () => {
        if (!this.state.readed) {
            return Alert.alert('Oops', 'You should read privacy policy, term & conditions and you have to accept these terms.', [{ text: 'Okay' }]);
        }

        this.setState({ loading: true });

        try {
            const confirmation = await auth().signInWithPhoneNumber(`+${this.state.phoneExtracted}`);
            this.setState({ confirmation, loading: false });
        } catch (error) {
            console.log(error);
            Alert.alert('Oops', 'Invalid format.', [{ text: 'Okay' }]);
            this.setState({ loading: false });
        }

    }

    enterAuthCode = async () => {
        this.setState({ loading: true });

        try {
            const confirmation = this.state.confirmation;
            await confirmation.confirm(this.state.confirmationCode);
        } catch (error) {
            Alert.alert('Oops', 'Wrong code. Please try again.', [{ text: 'Okay' }]);
            this.setState({ loading: false });
        }
    }

    goTo = (route) => {
        const replaceActions = StackActions.push(route);
        return this.props.navigation.dispatch(replaceActions);
    }

    phoneInput = (phoneExtracted) => {
        return (
            <TextInputMask
                value={phoneExtracted}
                style={{ fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif-condensed', color: '#FFF', fontSize: 20, fontWeight: 'bold', width: width - 20, padding: 10, backgroundColor: 'gray', borderRadius: 25, textAlign: 'center' }}
                onChangeText={(formatted, extracted) => this.setState({ phoneFormatted: formatted, phoneExtracted: extracted })}
                mask={'+[00] [000] [000] [00] [00]'}
                placeholder="+90 (555) 555 55 55"
                placeholderTextColor="lightgray"
                keyboardType="phone-pad"
            />
        );
    }

    codeInput = (confirmationCode) => {
        return (
            <SMSVerifyCode
                ref={ref => (this.verifycode = ref)}
                onInputCompleted={(text) => this.setState({ confirmationCode: text })}
                verifyCodeLength={6}
                containerBackgroundColor={constants.BACKGROUND_COLOR}
                codeViewBorderRadius={24}
                codeViewBorderWidth={2}
                containerPaddingVertical={20}
                containerPaddingHorizontal={50}
                focusedCodeViewBorderColor="lightgray"
                codeViewBorderColor="gray"
                codeFontSize={20}
                codeColor={'#FFF'}
            />
        );
    }

    render() {
        const { loading, phoneFormatted, phoneExtracted, confirmation, confirmationCode, readed } = this.state;

        if (loading) {
            return (
                <View style={{ flex: 1, backgroundColor: constants.BACKGROUND_COLOR }}>
                    <Header />
                    <Loading
                        loadingStyle={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
                        textStyle={{ marginTop: 10, fontWeight: 'normal' }}
                        text="Loading"
                    />
                </View>
            );
        } else {
            return (
                <SafeAreaView style={{ flex: 1, backgroundColor: constants.BACKGROUND_COLOR, justifyContent: 'center' }}>
                    <KeyboardAvoidingView behavior="padding">
                        {
                            confirmation ?
                                <View style={{ width: width, alignItems: 'center' }}>
                                    <View style={{ width: width - 20 }}>
                                        <Text
                                            text={`Enter the 6-digit code sent to you at ${phoneFormatted}`}
                                            style={{ fontSize: 24 }}
                                        />
                                    </View>
                                    {this.codeInput(confirmationCode)}
                                    <Button
                                        text="Enter Code"
                                        buttonStyle={{ backgroundColor: '#FFF', width: width - 20, borderRadius: 24, padding: 13 }}
                                        textStyle={{ color: '#000', fontSize: 16 }}
                                        onPress={() => this.enterAuthCode()}
                                    />
                                </View>
                                :
                                <View style={{ width: width, alignItems: 'center' }}>
                                    <View style={{ width: width - 20, marginVertical: 10 }}>
                                        <Text
                                            text="Enter your phone number"
                                            style={{ fontSize: 24 }}
                                        />
                                    </View>
                                    {this.phoneInput(phoneExtracted)}
                                    <View style={{ flexDirection: 'row', width: width - 40, alignItems: 'center' }}>
                                        <TouchableOpacity style={{ paddingVertical: 10 }} onPress={() => this.setState({ readed: !readed })}>
                                            <Icon name="check-circle" color={readed ? constants.BLUE : 'gray'} type="material-community" />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => this.goTo('PrivacyPolicy')}>
                                            <Text
                                                text="I have read and accept the terms of use and privacy policies."
                                                style={{ fontSize: 12, marginLeft: 5, fontWeight: 'normal' }}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                    <Button
                                        text="Next"
                                        buttonStyle={{ backgroundColor: '#FFF', width: width - 20, borderRadius: 24, padding: 13 }}
                                        textStyle={{ color: '#000', fontSize: 16 }}
                                        onPress={() => this.sendAuthCode()}
                                    />
                                </View>
                        }
                    </KeyboardAvoidingView>
                </SafeAreaView>
            );
        }
    }
}

export default observer(Login);

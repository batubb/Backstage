/* eslint-disable no-shadow */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React, {Component} from 'react';
import {View, Dimensions, Platform, ScrollView, Alert} from 'react-native';
import {observer} from 'mobx-react';
import {StackActions} from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import {Loading, Header, Text, Button} from '../../components';
import {constants} from '../../resources';
import Store from '../../store/Store';
import SMSVerifyCode from 'react-native-sms-verifycode';
import {SafeAreaView} from 'react-native';
import {KeyboardAvoidingView} from 'react-native';
import PhoneInput from 'react-native-phone-number-input';
import {COLORS, SIZES} from '../../resources/theme';

const {width} = Dimensions.get('window');
auth().settings.appVerificationDisabledForTesting = false;
const BORDER_RADIUS = 6;

class Login extends Component {
  constructor(props) {
    super(props);
    this.phoneRef = React.createRef();
    this.state = {
      loading: true,
      phoneFormatted: '',
      phoneExtracted: '',
      confirmation: false,
      confirmationCode: '',
    };
  }

  componentDidMount = async () => {
    auth().onAuthStateChanged((auth) => {
      if (auth) {
        console.log('in here auth');
        Store.setPhone(auth.phoneNumber);
        Store.setUID(auth.uid);
        const replaceActions = StackActions.replace('CheckInfo');
        return this.props.navigation.dispatch(replaceActions);
      } else {
        Store.clearUserData();
        this.setState({loading: false});
      }
    });
  };

  sendAuthCode = async () => {
    this.setState({loading: true});

    try {
      const confirmation = await auth().signInWithPhoneNumber(
        `${this.state.phoneFormatted}`,
      );
      this.setState({confirmation, loading: false});
    } catch (error) {
      Alert.alert('Oops', 'Please try again. Error: ' + error, [
        {text: 'Okay'},
      ]);
      this.setState({loading: false});
    }
  };

  enterAuthCode = async () => {
    this.setState({loading: true});

    try {
      const confirmation = this.state.confirmation;
      confirmation.confirm(this.state.confirmationCode);
    } catch (error) {
      Alert.alert('Oops', 'Wrong code. Please try again.', [{text: 'Okay'}]);
      this.setState({loading: false});
    }
  };

  goTo = (route) => {
    const replaceActions = StackActions.push(route);
    return this.props.navigation.dispatch(replaceActions);
  };

  codeInput = (confirmationCode) => {
    return (
      <SMSVerifyCode
        ref={(ref) => (this.verifycode = ref)}
        onInputCompleted={(text) => this.setState({confirmationCode: text})}
        verifyCodeLength={6}
        containerBackgroundColor={constants.BACKGROUND_COLOR}
        codeViewBorderRadius={0}
        codeViewBorderWidth={2}
        containerPaddingVertical={20}
        containerPaddingHorizontal={30}
        focusedCodeViewBorderColor={COLORS.secondary}
        codeViewBorderColor={COLORS.gray}
        codeFontSize={20}
        codeColor={'#FFF'}
        autoFocus
      />
    );
  };

  render() {
    const {
      loading,
      phoneFormatted,
      phoneExtracted,
      confirmation,
      confirmationCode,
    } = this.state;
    if (loading) {
      return (
        <View style={{flex: 1, backgroundColor: constants.BACKGROUND_COLOR}}>
          <Header />
          <Loading
            loadingStyle={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            textStyle={{marginTop: 10, fontWeight: 'normal'}}
            text="Loading"
          />
        </View>
      );
    } else {
      return (
        <SafeAreaView
          style={{
            flex: 1,
            backgroundColor: constants.BACKGROUND_COLOR,
          }}>
          {confirmation && (
            <Header
              leftButtonPress={() => this.setState({confirmation: false})}
              leftButtonIcon="chevron-left"
            />
          )}
          <KeyboardAvoidingView behavior="padding">
            <View
              style={{
                width: '85%',
                height: '100%',
                alignSelf: 'center',
              }}>
              <View
                style={{
                  width: '100%',
                  height: '40%',
                  justifyContent: 'flex-end',
                  //alignItems: 'center',
                }}>
                <Text
                  text={
                    confirmation
                      ? 'Enter the code we just texted you '
                      : 'Enter your phone number'
                  }
                  style={{fontWeight: 'normal', fontSize: 30}}
                />
              </View>
              <View
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'space-around',
                }}>
                {confirmation ? (
                  this.codeInput(confirmationCode)
                ) : (
                  <PhoneInput
                    ref={this.phoneRef}
                    defaultValue={''}
                    containerStyle={{
                      borderRadius: BORDER_RADIUS,
                      width: '100%',
                    }}
                    textContainerStyle={{
                      borderTopRightRadius: BORDER_RADIUS,
                      borderBottomRightRadius: BORDER_RADIUS,
                    }}
                    defaultCode="US"
                    layout="first"
                    onChangeText={(text) => {
                      this.setState({phoneExtracted: text});
                    }}
                    onChangeFormattedText={(text) => {
                      this.setState({phoneFormatted: text});
                    }}
                    withShadow
                    autoFocus
                  />
                )}
              </View>
              <View
                style={{
                  width: '100%',
                  height: '30%',
                  alignItems: 'center',
                }}>
                {!confirmation && (
                  <Text
                    text={
                      "By entering your number, you're agreeing to our Terms of Service and Privacy Policy. Thanks!"
                    }
                    style={{
                      width: '100%',
                      textAlign: 'center',
                      fontWeight: 'normal',
                      marginBottom: SIZES.spacing * 5,
                    }}
                    secondary
                  />
                )}
                <Button
                  text={'Next'}
                  buttonStyle={{width: '100%'}}
                  onPress={() =>
                    confirmation ? this.enterAuthCode() : this.sendAuthCode()
                  }
                />
              </View>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      );
    }
  }
}

export default observer(Login);

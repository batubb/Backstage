/* eslint-disable no-shadow */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React, {Component} from 'react';
import {
  View,
  Dimensions,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import {observer} from 'mobx-react';
import {StackActions} from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import {Loading, Header, Text, Button, GradientText} from '../../components';
import {constants} from '../../resources';
import Store from '../../store/Store';
import SMSVerifyCode from 'react-native-sms-verifycode';
import {SafeAreaView} from 'react-native';
import {KeyboardAvoidingView} from 'react-native';
import PhoneInput from 'react-native-phone-number-input';
import {COLORS, SIZES} from '../../resources/theme';
import LinearGradient from 'react-native-linear-gradient';
import {Icon} from 'react-native-elements';
import {RFValue} from 'react-native-responsive-fontsize';

const {width, height} = Dimensions.get('window');
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
    auth().onAuthStateChanged(async (auth) => {
      if (auth) {
        Store.setPhone(auth.phoneNumber);
        Store.setUID(auth.uid);
        const replaceActions = StackActions.replace('CheckInfo', {
          goToDiscover: true,
          userUidReferedBy: this.props.route.params?.userUidReferedBy,
        });
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
        containerBackgroundColor={'transparent'}
        codeViewBorderRadius={0}
        codeViewBorderWidth={2}
        containerPaddingVertical={20}
        containerPaddingHorizontal={30}
        focusedCodeViewBorderColor={COLORS.white}
        codeViewBorderColor={COLORS.white}
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
        <LinearGradient
          colors={constants.CUSTOM_PURPLE_GRADIENT}
          start={{x: -0.2, y: 0.7}}
          end={{x: 0.7, y: 0}}
          locations={[0, 0.4, 1]}
          style={{flex: 1}}>
          <SafeAreaView
            style={{
              flex: 1,
            }}>
            {confirmation && (
              <Header
                leftButtonPress={() => this.setState({confirmation: false})}
                leftButtonIcon="chevron-left"
                backgroundColor={'transparent'}
              />
            )}
            <KeyboardAvoidingView
              behavior={
                Platform.OS === 'ios' ? constants.KEYBOARD_BEHAVIOR : null
              }
              style={{flex: 1}}>
              <View
                style={{
                  width: '85%',
                  flex: 1,
                  alignSelf: 'center',
                }}>
                <View
                  style={{
                    width: '100%',
                    flex: confirmation ? 0.3 : 0.4,
                    justifyContent: 'flex-end',
                  }}>
                  <Text
                    text={
                      confirmation
                        ? 'Enter the code we just texted you '
                        : 'Enter your phone number'
                    }
                    style={{
                      fontWeight: 'bold',
                      fontSize: RFValue(26),
                      fontFamily: 'SF Pro Display',
                    }}
                  />
                </View>
                <View
                  style={{
                    flex: 0.25,
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
                        paddingVertical:
                          SIZES.spacing * (Platform.OS === 'ios' ? 6 : 1),
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
                    flex: 0.5,
                    alignItems: 'center',
                  }}>
                  {!confirmation ? (
                    <Text
                      text={
                        "By entering your number, you're agreeing to our Terms of Service and Privacy Policy. Thanks!"
                      }
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        fontWeight: 'normal',
                        color: COLORS.white,
                        fontSize: RFValue(16),
                      }}
                      secondary
                    />
                  ) : (
                    <TouchableOpacity
                      onPress={() => this.sendAuthCode()}
                      style={{
                        width: '100%',
                      }}>
                      <Text
                        text={"Didn't receive a code? Tap to resend."}
                        style={{
                          textAlign: 'center',
                          right: SIZES.padding * 0.5,
                          fontWeight: 'normal',
                          fontSize: RFValue(18),
                          color: COLORS.white,
                        }}
                        secondary
                      />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    onPress={() =>
                      confirmation ? this.enterAuthCode() : this.sendAuthCode()
                    }
                    disabled={
                      confirmation
                        ? confirmationCode.length !== 6
                        : phoneExtracted.length === 0
                    }
                    style={{
                      backgroundColor: confirmation
                        ? confirmationCode.length === 6
                          ? '#ffffff'
                          : '#ffffff50'
                        : phoneExtracted.length !== 0
                        ? '#ffffff'
                        : '#ffffff50',
                      paddingVertical: SIZES.padding * 1.2,
                      alignItems: 'center',
                      borderRadius: 12,
                      marginRight: width * 0.03,
                      paddingHorizontal: SIZES.padding * 3.5,
                      marginTop: RFValue(SIZES.padding * 5),
                    }}>
                    <GradientText
                      colors={['#872EC4', '#B150E2']}
                      start={{x: -0.2, y: 0.7}}
                      end={{x: 0.7, y: 0}}
                      style={{
                        color: 'black',
                        fontSize: RFValue(23),
                        fontWeight: 'bold',
                        fontFamily: 'SF Pro Display',
                      }}>
                      Next
                      <Icon
                        name="arrow-right"
                        type="font-awesome-5"
                        size={RFValue(20)}
                        color={
                          confirmation
                            ? confirmationCode.length === 6
                              ? COLORS.primary
                              : '#ffffff90'
                            : phoneExtracted.length !== 0
                            ? COLORS.primary
                            : '#ffffff90'
                        }
                        style={[
                          {paddingLeft: 5},
                          Platform.OS === 'android' ? {top: 2} : null,
                        ]}
                      />
                    </GradientText>
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </LinearGradient>
      );
    }
  }
}

export default observer(Login);

import React, {Component} from 'react';
import {View, Dimensions, Text, TouchableOpacity} from 'react-native';
import {observer} from 'mobx-react';
import {Loading, Header, GradientText} from '../../components';
import {constants} from '../../resources';
import {SafeAreaView} from 'react-native';
import {COLORS} from '../../resources/theme';
import LinearGradient from 'react-native-linear-gradient';
import {Icon} from 'react-native-elements';
import {StackActions} from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import Store from '../../store/Store';

const {width} = Dimensions.get('window');

class Welcome extends Component {
  state = {
    loading: true,
  };

  componentDidMount() {
    auth().onAuthStateChanged((auth) => {
      if (auth) {
        Store.setPhone(auth.phoneNumber);
        Store.setUID(auth.uid);
        const replaceActions = StackActions.replace('CheckInfo');
        return this.props.navigation.dispatch(replaceActions);
      } else {
        Store.clearUserData();
        this.setState({loading: false});
      }
    });
  }

  render() {
    if (this.state.loading) {
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
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text
              style={{
                fontSize: 50,
                fontWeight: 'bold',
                color: COLORS.white,
                bottom: 35,
                fontFamily: 'Oswald',
              }}>
              BACKSTAGE
            </Text>
            <View
              style={{
                justifyContent: 'space-between',
                position: 'absolute',
                bottom: 60,
                flex: 1,
                flexDirection: 'row',
                marginHorizontal: width * 0.06,
              }}>
              <TouchableOpacity
                onPress={() =>
                  this.props.navigation.dispatch(StackActions.push('Login'))
                }
                style={{
                  flex: 1,
                  backgroundColor: '#ffffff',
                  paddingVertical: 12,
                  alignItems: 'center',
                  borderRadius: 12,
                  marginRight: width * 0.03,
                }}>
                <GradientText
                  colors={['#872EC4', '#B150E2']}
                  start={{x: -0.2, y: 0.7}}
                  end={{x: 0.7, y: 0}}
                  locations={[0, 0.4, 1]}
                  style={{
                    top: 2,
                    color: 'black',
                    fontSize: 25,
                    fontWeight: 'bold',
                    fontFamily: 'SF Pro Display',
                  }}>
                  Get Started
                </GradientText>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  this.props.navigation.dispatch(StackActions.push('Login'))
                }
                style={{
                  flex: 1,
                  backgroundColor: '#ffffff7D',
                  paddingVertical: 12,
                  alignItems: 'center',
                  fontFamily: 'SF Pro Display',
                  borderRadius: 12,
                  marginLeft: width * 0.03,
                }}>
                <Text
                  style={{color: '#ffffff', fontSize: 25, fontWeight: 'bold'}}>
                  Login
                  <Icon
                    name="arrow-right"
                    type="font-awesome-5"
                    size={25}
                    color={'#ffffff'}
                    style={{paddingLeft: 5}}
                  />
                </Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </LinearGradient>
      );
    }
  }
}

export default observer(Welcome);

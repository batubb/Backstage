/* eslint-disable react/no-did-mount-set-state */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React, {Component} from 'react';
import {
  View,
  Dimensions,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
} from 'react-native';
import {observer} from 'mobx-react';
import {StackActions} from '@react-navigation/native';
import {
  Loading,
  Header,
  Text,
  Button,
  MyImage,
  SearchBar,
} from '../../components';
import {constants} from '../../resources';
import {
  checkUserInfo,
  createUser,
  getFollowList,
  getDealsData,
  searchUser,
  checkUsernameValid,
} from '../../services';
import {Icon} from 'react-native-elements';
import {followerCount, controlArray, regexCheck} from '../../lib';

import Store from '../../store/Store';
import {SafeAreaView} from 'react-native';
import {COLORS, SIZES} from '../../resources/theme';

const {width} = Dimensions.get('window');
const BORDER_RADIUS = 6;

class CheckInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      name: '',
      username: '@',
      step: 3,
      followingArray: [],
      userArray: [],
      search: '',
      searchArray: [],
    };
  }

  componentDidMount = async () => {
    const result = await checkUserInfo(Store.uid, true);
    await getFollowList(Store.uid);

    if (!result) {
      const userArray = await getDealsData();
      //this.setState({ loading: false, userArray });
    } else {
      const replaceActions = StackActions.replace('TabBarMenu');
      return this.props.navigation.dispatch(replaceActions);
    }
  };

  createAccount = async () => {
    const data = {
      name: this.state.name,
      username: this.state.username.toLowerCase(),
      type: 'user',
      follower: 0,
      like: 0,
      price: 0,
    };

    const result = await createUser(
      Store.uid,
      Store.phone,
      data,
      this.state.followingArray,
    );

    if (result) {
      const replaceActions = StackActions.replace('TabBarMenu');
      return this.props.navigation.dispatch(replaceActions);
    }
  };

  nextStep = async () => {
    if (this.state.name === '') {
      return Alert.alert('Oops', 'You have to enter your name.', [
        {text: 'Okay'},
      ]);
    }

    if (this.state.username === '') {
      return Alert.alert('Oops', 'You have to enter your username.', [
        {text: 'Okay'},
      ]);
    }

    if (regexCheck(this.state.username)) {
      return Alert.alert(
        'Oops',
        'You can not user any symbol. Please use only letters and numbers',
        [{text: 'Okay'}],
      );
    }

    const checkUsername = await checkUsernameValid(
      this.state.username.toLowerCase(),
    );

    if (checkUsername) {
      return Alert.alert(
        'Oops',
        'This username is taken. Please try a different username.',
        [{text: 'Okay'}],
      );
    }

    return this.setState({step: 2});
  };

  searchUser = async (search) => {
    this.setState({search: search});

    if (search.length >= 3) {
      const searchArray = await searchUser(search, 'influencer');
      this.setState({searchArray});
    } else {
      this.setState({searchArray: []});
    }
  };

  addFollowing = (user, index, like, search) => {
    var followingArray = this.state.followingArray;
    var userArray = this.state.userArray;
    var searchArray = this.state.searchArray;

    if (like) {
      followingArray.splice(index, 1);
      userArray.push(user);
    } else {
      const result = controlArray(followingArray, user);

      if (result) {
        if (!search) {
          searchArray.splice(index, 1);
        } else {
          userArray.splice(index, 1);
        }
        followingArray.push(user);
      }
    }

    this.setState({followingArray, userArray});
  };

  renderStepOne = () => {
    return (
      <View style={{width: width, alignItems: 'center'}}>
        <Text text="Your Name" style={{fontSize: 20, marginTop: 10}} />
        <TextInput
          value={this.state.name}
          style={{
            marginTop: 5,
            fontFamily:
              Platform.OS === 'ios' ? 'Avenir' : 'sans-serif-condensed',
            color: '#FFF',
            fontSize: 16,
            fontWeight: 'bold',
            width: width - 20,
            padding: 10,
            backgroundColor: 'gray',
            borderRadius: 25,
            textAlign: 'center',
          }}
          onChangeText={(name) => this.setState({name})}
          placeholder="John Doe"
          placeholderTextColor="lightgray"
        />
        <Text text="Your Username" style={{fontSize: 20, marginTop: 10}} />
        <TextInput
          value={this.state.username}
          style={{
            marginTop: 5,
            fontFamily:
              Platform.OS === 'ios' ? 'Avenir' : 'sans-serif-condensed',
            color: '#FFF',
            fontSize: 16,
            fontWeight: 'bold',
            width: width - 20,
            padding: 10,
            backgroundColor: 'gray',
            borderRadius: 25,
            textAlign: 'center',
          }}
          onChangeText={(username) =>
            this.setState({username: username.toLocaleLowerCase()})
          }
          placeholder="@johndoe"
          placeholderTextColor="lightgray"
          maxLength={20}
        />
        <Button
          text="Next"
          buttonStyle={{
            backgroundColor: '#FFF',
            width: width - 20,
            borderRadius: 24,
            padding: 10,
            marginTop: 20,
          }}
          textStyle={{color: '#000', fontSize: 16}}
          onPress={() => this.nextStep()}
        />
      </View>
    );
  };

  renderSearchTerms = (data, like = true, search = false) => {
    return data.map((item, index) => (
      <View style={{width: width, alignItems: 'center'}}>
        <TouchableOpacity
          onPress={() => this.addFollowing(item, index, like, search)}>
          <View
            style={{
              width: width - 20,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 10,
            }}>
            <MyImage
              style={{width: 60, height: 60, borderRadius: 30}}
              photo={item.photo}
            />
            <View
              style={{
                flexDirection: 'row',
                width: width - 90,
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
              <View style={{width: width - 150}}>
                <Text text="Influencer" style={{fontSize: 16}} />
                <Text
                  text={item.name}
                  style={{fontSize: 14, fontWeight: 'normal'}}
                />
              </View>
              {like ? (
                <View style={{width: 60, alignItems: 'center'}}>
                  <Icon
                    name="check-circle"
                    color="green"
                    type="material-community"
                  />
                </View>
              ) : (
                <View style={{width: 60}}>
                  <View
                    style={{
                      width: 60,
                      justifyContent: 'flex-end',
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                    <Text
                      text={followerCount(item.follower)}
                      style={{
                        fontSize: 12,
                        fontWeight: 'normal',
                        color: 'lightgray',
                        marginRight: 5,
                      }}
                    />
                    <Icon
                      name="account-outline"
                      color="lightgray"
                      type="material-community"
                      size={12}
                    />
                  </View>
                  <View
                    style={{
                      width: 60,
                      justifyContent: 'flex-end',
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                    <Text
                      text={followerCount(item.like)}
                      style={{
                        fontSize: 12,
                        fontWeight: 'normal',
                        color: 'lightgray',
                        marginRight: 5,
                      }}
                    />
                    <Icon
                      name="heart-outline"
                      color="lightgray"
                      type="material-community"
                      size={12}
                    />
                  </View>
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </View>
    ));
  };

  render() {
    const {
      loading,
      search,
      step,
      userArray,
      followingArray,
      searchArray,
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
      const confirmation = true;
      return (
        <View style={{flex: 1, backgroundColor: constants.BACKGROUND_COLOR}}>
          <Header
            leftButtonPress={step === 2 ? () => this.setState({step: 1}) : null}
            leftButtonIcon="chevron-left"
          />
          {step === 1 ? (
            <SafeAreaView
              style={{
                flex: 1,
                backgroundColor: constants.BACKGROUND_COLOR,
                //justifyContent: 'center',
              }}>
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
                      text={"What's your full name?"}
                      style={{fontWeight: 'normal', fontSize: 30}}
                    />
                  </View>
                  <View
                    style={{
                      flex: 1,
                      alignItems: 'center',
                      justifyContent: 'space-around',
                    }}>
                    <View style={{width: '100%'}}>
                      <TextInput
                        value={this.state.name}
                        style={{
                          backgroundColor: COLORS.white,
                          borderRadius: BORDER_RADIUS,
                          textAlign: 'center',
                          height: 50,
                          fontSize: 20,
                        }}
                        onChangeText={(name) =>
                          this.setState({
                            name: name,
                          })
                        }
                        autoFocus
                        placeholder="Jane Doe"
                        placeholderTextColor={'lightgray'}
                        placeholderStyle={{fontSize: 50}}
                        maxLength={25}
                      />
                    </View>
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
                        confirmation
                          ? this.enterAuthCode()
                          : this.sendAuthCode()
                      }
                    />
                  </View>
                </View>
              </KeyboardAvoidingView>
            </SafeAreaView>
          ) : null}
          {step === 2 ? (
            <SafeAreaView style={{width: width, alignItems: 'center', flex: 1}}>
              <View style={{width: width, alignItems: 'center', flex: 1}}>
                <SearchBar searchUser={(input) => this.searchUser(input)} />
                {this.renderSearchTerms(followingArray)}
                {this.renderSearchTerms(
                  searchArray.length === 0 ? userArray : searchArray,
                  false,
                  searchArray.length === 0 ? true : false,
                )}
              </View>
              <Button
                text="Done"
                buttonStyle={{
                  backgroundColor: '#FFF',
                  width: width - 20,
                  borderRadius: 4,
                  padding: 13,
                  marginTop: 10,
                }}
                textStyle={{color: '#000', fontSize: 16}}
                onPress={() => this.createAccount()}
              />
            </SafeAreaView>
          ) : null}
          {step === 3 ? (
            <SafeAreaView
              style={{
                flex: 1,
                backgroundColor: constants.BACKGROUND_COLOR,
                //justifyContent: 'center',
              }}>
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
                      text={'Pick a username'}
                      style={{fontWeight: 'normal', fontSize: 30}}
                    />
                  </View>
                  <View
                    style={{
                      flex: 1,
                      alignItems: 'center',
                      justifyContent: 'space-around',
                    }}>
                    <View style={{width: '100%'}}>
                      <TextInput
                        value={this.state.username}
                        style={{
                          backgroundColor: COLORS.white,
                          borderRadius: BORDER_RADIUS,
                          textAlign: 'center',
                          height: 50,
                          fontSize: 20,
                        }}
                        onChangeText={(username) =>
                          this.setState({
                            username: (this.state.username !== ''
                              ? username
                              : username === '@'
                              ? username
                              : '@' + username
                            ).toLocaleLowerCase(),
                          })
                        }
                        autoFocus
                        maxLength={20}
                      />
                    </View>
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
                        confirmation
                          ? this.enterAuthCode()
                          : this.sendAuthCode()
                      }
                    />
                  </View>
                </View>
              </KeyboardAvoidingView>
            </SafeAreaView>
          ) : null}
        </View>
      );
    }
  }
}

export default observer(CheckInfo);

/* eslint-disable react/no-did-mount-set-state */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React, {Component} from 'react';
import {
  View,
  Dimensions,
  PlatformColor,
  Alert,
  TextInput,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {observer} from 'mobx-react';
import {Loading, Header, Button, MyImage, Text} from '../../components';
import {constants} from '../../resources';
import {checkUserInfo, checkUsernameValid} from '../../services';
import Store from '../../store/Store';
import {regexCheck} from '../../lib';
import {StackActions} from '@react-navigation/native';
import {makeid} from '../../lib';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import database from '@react-native-firebase/database';
import storage from '@react-native-firebase/storage';
import {SIZES} from '../../resources/theme';
import {TouchableOpacity} from 'react-native-gesture-handler';

const {width} = Dimensions.get('window');

class EditProfile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      photo:
        typeof Store.user.photo === 'undefined'
          ? 'https://www.atlassian.com/dam/jcr:ba03a215-2f45-40f5-8540-b2015223c918/Max-R_Headshot%20(1).jpg'
          : Store.user.photo,
      name:
        typeof Store.user.name === 'undefined' ? 'No Name' : Store.user.name,
      biography:
        typeof Store.user.biography === 'undefined'
          ? 'No Biography'
          : Store.user.biography,
      username:
        typeof Store.user.username === 'undefined'
          ? 'No Username'
          : Store.user.username,
      refreshing: false,
      input: '',
      type: this.props.route.params.type,
    };
  }

  componentDidMount = async () => {
    this.unsubscribe = this.props.navigation.addListener('focus', (e) => {
      this.setState({
        name:
          typeof Store.user.name === 'undefined' ? 'No Name' : Store.user.name,
        biography:
          typeof Store.user.biography === 'undefined'
            ? 'No Biography'
            : Store.user.biography,
        username:
          typeof Store.user.username === 'undefined'
            ? 'No Username'
            : Store.user.username,
        photo:
          typeof Store.user.photo === 'undefined'
            ? 'https://www.atlassian.com/dam/jcr:ba03a215-2f45-40f5-8540-b2015223c918/Max-R_Headshot%20(1).jpg'
            : Store.user.photo,
      });
    });
    this.setState({loading: false});
  };

  componentWillUnmount = () => {
    this.unsubscribe();
  };

  goTo = (route, info = null) => {
    if (route === 'MyInfo') {
      const replaceActions = StackActions.push(route, {type: info});
      return this.props.navigation.dispatch(replaceActions);
    }
  };

  renderInput(label, value, type) {
    return (
      <TouchableOpacity
        onPress={() => this.goTo('MyInfo', type)}
        style={{
          display: 'flex',
          flexDirection: 'row',
          marginTop: SIZES.spacing * 5,
        }}>
        <Text
          text={label}
          style={{flexBasis: '30%', fontSize: 18, fontWeight: 'normal'}}
        />
        <View
          style={{
            flexBasis: '70%',
            borderBottomColor: constants.BAR_COLOR,
            borderBottomWidth: SIZES.separatorWidth,
            paddingBottom: SIZES.spacing * 5,
          }}>
          <Text
            numberOfLines={1}
            text={value}
            style={{
              fontSize: 18,
              fontWeight: 'normal',
            }}
          />
        </View>
      </TouchableOpacity>
    );
  }

  choosePhotoType = () => {
    Alert.alert('Choose', 'Where would you like to select the photo?', [
      {text: 'Gallery', onPress: () => this.pickImage()},
      {text: 'Remove Picture', onPress: () => this.updateUserInfo()},
      {text: 'Cancel', style: 'cancel'},
    ]);
  };

  pickImage = async () => {
    launchImageLibrary(
      {
        quality: 0.4,
        base64: true,
      },
      (result) => {
        if (!result.didCancel) {
          this.handleImagePicked(result.uri);
        }
      },
    );
  };

  takeImage = async () => {
    const result = await launchCamera({
      quality: 0.4,
      base64: true,
    });
    if (!result.didCancel) {
      this.handleImagePicked(result.uri);
    }
  };

  uploadImage = async (uri, onname) => {
    var ref = storage().ref().child(`users/${onname}.jpg`);
    await ref.putFile(uri);

    return await ref.getDownloadURL();
  };

  updateUserInfo = async () => {
    this.setState({loading: true});
    var updates = {};
    updates[`users/${Store.user.uid}/photo`] = constants.DEFAULT_PHOTO;
    try {
      await database().ref().update(updates);
      await checkUserInfo(Store.uid, true);
      this.setState({photo: constants.DEFAULT_PHOTO});
    } catch (error) {
      return Alert.alert('Oops', 'Something unexpected happens.', [
        {text: 'Okay'},
      ]);
    }
    this.setState({loading: false});
  };

  handleImagePicked = async (url) => {
    this.setState({loading: true});

    const onname = `${makeid(8)}-${makeid(4)}-${makeid(4)}-${makeid(
      4,
    )}-${makeid(12)}`;

    let data = await this.uploadImage(url, onname);

    const photoThumbURL = `${constants.USER_PHOTO_THUMB_URL}${onname}_300x300.jpg?alt=media`;

    var updates = {};
    updates[`users/${Store.user.uid}/photo`] = photoThumbURL;
    updates[`users/${Store.user.uid}/originalPhoto`] = data;

    try {
      await database().ref().update(updates);
      await checkUserInfo(Store.uid, true);
      this.setState({photo: data});
    } catch (error) {
      return Alert.alert('Oops', 'Something unexpected happens.', [
        {text: 'Okay'},
      ]);
    }
    this.setState({loading: false});
  };

  render() {
    const {
      loading,
      refreshing,
      type,
      input,
      photo,
      name,
      biography,
      username,
    } = this.state;

    return (
      <View
        style={{
          flex: 1,
          backgroundColor: constants.BACKGROUND_COLOR,
        }}>
        <Header
          title="Edit Profile"
          leftButtonPress={() =>
            this.props.navigation.dispatch(StackActions.pop())
          }
          leftButtonIcon="chevron-left"
        />
        {loading ? (
          <Loading
            loadingStyle={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            textStyle={{marginTop: 10, fontWeight: 'normal'}}
            text="Loading"
          />
        ) : (
          <View
            style={{
              display: 'flex',
              flex: 1,
              width: '80%',
              justifyContent: 'center',
              alignSelf: 'center',
            }}>
            <View
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: SIZES.spacing * 15,
              }}>
              <MyImage
                style={{
                  width: constants.PROFILE_PIC_SIZE,
                  height: constants.PROFILE_PIC_SIZE,
                  borderRadius: constants.PROFILE_PIC_SIZE / 2,
                }}
                photo={photo}
              />
              <TouchableOpacity onPress={() => this.choosePhotoType()}>
                <Text
                  text={'Change Profile Photo'}
                  style={{
                    fontWeight: 'bold',
                    marginTop: SIZES.spacing * 5,
                    //color: PlatformColor('systemBlue'),
                    color: '#0a84ff',
                  }}
                />
              </TouchableOpacity>
            </View>
            <View
              style={{
                borderBottomColor: constants.BAR_COLOR,
                borderTopColor: constants.BAR_COLOR,
                borderBottomWidth: SIZES.separatorWidth,
                borderTopWidth: SIZES.separatorWidth,
              }}>
              {this.renderInput('Name', name, 'name')}
              {this.renderInput('Username', username, 'username')}
              {this.renderInput('Bio', biography, 'biography')}
            </View>
          </View>
        )}
      </View>
    );
  }
}

export default observer(EditProfile);

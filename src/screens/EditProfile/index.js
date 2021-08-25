/* eslint-disable react/no-did-mount-set-state */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React, {Component} from 'react';
import {View, Dimensions, Alert} from 'react-native';
import {observer} from 'mobx-react';
import {Loading, Header, MyImage, Text} from '../../components';
import {constants} from '../../resources';
import {checkUserInfo} from '../../services';
import Store from '../../store/Store';
import {StackActions} from '@react-navigation/native';
import {makeid} from '../../lib';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import database from '@react-native-firebase/database';
import storage from '@react-native-firebase/storage';
import {COLORS, SIZES} from '../../resources/theme';
import {TouchableOpacity} from 'react-native-gesture-handler';
import * as Sentry from '@sentry/react-native';
import {Severity} from '@sentry/react-native';

class EditProfile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      photo:
        typeof Store.user.photo === 'undefined'
          ? constants.DEFAULT_PHOTO
          : Store.user.photo,
      name: typeof Store.user.name === 'undefined' ? '' : Store.user.name,
      biography:
        typeof Store.user.biography === 'undefined' ? '' : Store.user.biography,
      username:
        typeof Store.user.username === 'undefined' ? '' : Store.user.username,
      refreshing: false,
      input: '',
      type: this.props.route.params.type,
    };
  }

  componentDidMount = async () => {
    this.unsubscribe = this.props.navigation.addListener('focus', (e) => {
      this.setState({
        name: typeof Store.user.name === 'undefined' ? '' : Store.user.name,
        biography:
          typeof Store.user.biography === 'undefined'
            ? ''
            : Store.user.biography,
        username:
          typeof Store.user.username === 'undefined' ? '' : Store.user.username,
        photo:
          typeof Store.user.photo === 'undefined'
            ? constants.DEFAULT_PHOTO
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
    if (this.state.photo === constants.DEFAULT_PHOTO) {
      this.pickImage();
    } else {
      Alert.alert('Choose', 'Where would you like to select the photo?', [
        {text: 'Gallery', onPress: () => this.pickImage()},
        {text: 'Remove Picture', onPress: () => this.removeImage()},
        {text: 'Cancel', style: 'cancel'},
      ]);
    }
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
    var ref = storage()
      .refFromURL(Store.currentRegionBucket)
      .child(`users/${onname}.jpg`);
    await ref.putFile(uri);

    return await ref.getDownloadURL();
  };

  removeImage = async () => {
    this.setState({loading: true});
    const currentPhotoUrl = Store.user.photo;
    const currentOriginalPhotoUrl = Store.user.originalPhoto;
    let updates = {};
    updates[`users/${Store.user.uid}/photo`] = constants.DEFAULT_PHOTO;
    updates[`users/${Store.user.uid}/originalPhoto`] = null;

    try {
      await database().ref().update(updates);
      await checkUserInfo(Store.uid, true);
      this.setState({photo: constants.DEFAULT_PHOTO});
    } catch (error) {
      return Alert.alert('Oops', constants.ERROR_ALERT_MSG, [{text: 'Okay'}]);
    }
    this.setState({loading: false});

    try {
      // Group 1 = BUCKET NAME, Group 2 = PHOTO UID
      const photoRegex = currentPhotoUrl.match(
        /.*\/v0\/b\/(.*)\/o\/users.*%2F(.*)_300x300.*/s,
      );
      await storage()
        .refFromURL('gs://' + photoRegex[1])
        .child(`/users/thumbs/${photoRegex[2]}_300x300.jpg`)
        .delete();
      if (currentOriginalPhotoUrl) {
        const originalPhotoRegex = currentOriginalPhotoUrl.match(
          /.*\/v0\/b\/(.*)\/o\/users.*%2F(.*).jpg.*/s,
        );
        await storage()
          .refFromURL('gs://' + originalPhotoRegex[1])
          .child(`/users/${originalPhotoRegex[2]}.jpg`)
          .delete();
      }
    } catch (error) {
      Sentry.captureEvent({
        user: {
          id: Store.user.uid,
          username: Store.user.username,
          data: Store.user,
        },
        message: 'Delete Profile Image Error',
        tags: ['video', 'post', 'influencer', 'delete', 'assets'],
        level: __DEV__ ? Severity.Debug : Severity.Critical,
        exception: error,
        contexts: {
          photo_url: currentPhotoUrl || '__UNKNOWN__',
          original_photo_url: currentOriginalPhotoUrl || '__UNKNOWN__',
        },
        timestamp: new Date().getTime(),
        environment: __DEV__,
      });
    }
  };

  handleImagePicked = async (url) => {
    this.setState({loading: true});

    const onname = `${makeid(8)}-${makeid(4)}-${makeid(4)}-${makeid(
      4,
    )}-${makeid(12)}`;

    let data = await this.uploadImage(url, onname);

    const photoThumbURL = `${constants.USER_PHOTO_THUMB_URL(
      Store.currentRegionBucket.replace('gs://', ''),
    )}${onname}_300x300.jpg?alt=media`;

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
    const {loading, photo, name, biography, username} = this.state;

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
                    color: COLORS.primary,
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

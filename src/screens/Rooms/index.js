/* eslint-disable react/no-did-mount-set-state */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React, {Component} from 'react';
import {
  View,
  Dimensions,
  TouchableOpacity,
  RefreshControl,
  KeyboardAvoidingView,
  SafeAreaView,
  TextInput,
  Platform,
  FlatList,
  LogBox,
} from 'react-native';
import {observer} from 'mobx-react';
import {
  Loading,
  Header,
  Text,
  MyImage,
  SearchBar,
  Button,
  Divider,
  VerifiedIcon,
} from '../../components';
import {constants} from '../../resources';
import {searchUser, getTrendingsData} from '../../services';
import {isInfluencer, isAdmin} from '../../lib';
import {StackActions} from '@react-navigation/native';
import {SIZES} from '../../resources/theme';
import EditTitleModal from '../../components/ScreenComponents/AddContentComponents/EditTitleModal/EditTitleModal';
import Store from '../../store/Store';

const {width, height} = Dimensions.get('window');

LogBox.ignoreLogs([
  "Warning: Can't perform a React state update on an unmounted component",
]);

class Rooms extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      refreshing: false,
      searchArray: [],
      userArray: [],
      search: '',
      anon: false,
      anonData: null,
      nameInput: '',
      nameModalVisible: false,
    };
  }

  componentDidMount = async () => {
    const userArray = await this.getRoomsData();
    this.setState({loading: false, userArray});
  };

  onRefresh = async () => {
    if (this.state.search.length > 0) {
      await this.searchUser(this.state.search);
      return;
    }
    this.setState({refreshing: true});
    const userArray = await this.getRoomsData();
    this.setState({refreshing: false, userArray});
  };

  getRoomsData = async () => {
    return await getTrendingsData(Store.user.uid, !isAdmin(Store.user));
  };

  goTo = (route, info = null) => {
    if (route === 'Chat') {
      const replaceActions = StackActions.push(route, {
        user: info,
        anonymus: this.state.anonData,
      });
      return this.props.navigation.dispatch(replaceActions);
    }
  };

  searchUser = async (search) => {
    const searchArray = await searchUser(
      search,
      'influencer',
      null,
      !isAdmin(Store.user),
    );
    this.setState({searchArray, search});
  };

  renderSearchTerm = (item) => {
    return (
      <View
        key={item.uid}
        style={{
          width: width,
          alignItems: 'center',
        }}>
        <TouchableOpacity onPress={() => this.goTo('Chat', item)}>
          <View
            style={{
              width: width,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: SIZES.padding,
              marginBottom: SIZES.spacing * 3,
              paddingHorizontal: SIZES.padding * 2,
            }}>
            <MyImage
              style={{
                width: constants.PROFILE_PIC_SIZE * 0.6,
                height: constants.PROFILE_PIC_SIZE * 0.6,
                borderRadius: 30,
              }}
              photo={item.photo}
            />
            <View
              style={{
                width: width,
                paddingLeft: SIZES.padding,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
              <View
                style={{
                  width: width - constants.PROFILE_PIC_SIZE * 1.5,
                  flexDirection: 'row',
                }}>
                <Text
                  text={`${
                    Store.user.uid === item.uid ? 'My Room' : item.username
                  }`}
                  style={{fontSize: 16}}
                />
                {Store.user.uid !== item.uid && item.verified === true ? (
                  <VerifiedIcon />
                ) : null}
              </View>
            </View>
          </View>
        </TouchableOpacity>
        <Divider
          width={width}
          style={{
            marginLeft:
              SIZES.padding2 +
              constants.PROFILE_PIC_SIZE * 1.35 +
              SIZES.padding * 3,
          }}
        />
      </View>
    );
  };

  renderNameModal2 = () => {
    return (
      <EditTitleModal
        placeholder={'Your Nickname'}
        buttonText={'Confirm'}
        description={'This will be your anonymous nickname on chat.'}
        closeModal={() => {
          this.setState({
            nameModalVisible: false,
            anon: false,
            anonData: null,
            nameInput: '',
          });
        }}
        onChangeText={(name) =>
          this.setState({
            anonData: {nickname: name, anonymus: true},
            nameModalVisible: false,
          })
        }
      />
    );
  };

  renderNameModal = () => {
    return (
      <SafeAreaView
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width,
          height,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <TouchableOpacity
          onPress={() =>
            this.setState({
              nameModalVisible: false,
              anon: false,
              anonData: null,
              nameInput: '',
            })
          }
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width,
            height,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#000',
            opacity: 0.4,
          }}
        />
        <KeyboardAvoidingView behavior="padding">
          <View
            style={{
              width: width - 40,
              backgroundColor: constants.BAR_COLOR,
              paddingHorizontal: 10,
              paddingVertical: 40,
              alignItems: 'center',
              borderRadius: 16,
            }}>
            <Text
              text="What is your anonymus nickname?"
              style={{fontSize: 20}}
            />
            <TextInput
              placeholder="Your Nickname"
              style={{
                marginTop: 20,
                fontFamily:
                  Platform.OS === 'ios' ? 'Avenir' : 'sans-serif-condensed',
                margin: 10,
                width: width - 80,
                padding: 13,
                color: 'white',
                fontWeight: 'bold',
                fontSize: 14,
                borderRadius: 4,
                backgroundColor: '#424242',
              }}
              underlineColorAndroid="transparent"
              onChangeText={(textInput) =>
                this.setState({nameInput: textInput})
              }
              value={this.state.nameInput}
              maxLength={50}
              placeholderTextColor="gray"
            />
            <Button
              text="CONFIRM"
              buttonStyle={{
                backgroundColor: '#FFF',
                width: width - 80,
                borderRadius: 24,
                padding: 13,
                marginTop: 20,
              }}
              textStyle={{color: '#000', fontSize: 16, fontWeight: 'normal'}}
              onPress={() =>
                this.setState({
                  anonData: {nickname: this.state.nameInput, anonymus: true},
                  nameModalVisible: false,
                })
              }
            />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  };

  render() {
    const {
      loading,
      userArray,
      searchArray,
      search,
      nameModalVisible,
    } = this.state;

    const roomsList =
      searchArray.length === 0 && search.length === 0 ? userArray : searchArray;

    return (
      <View style={{flex: 1, backgroundColor: constants.BACKGROUND_COLOR}}>
        <Header title="Rooms" />
        <SearchBar
          searchUser={(input) => this.searchUser(input)}
          style={{paddingBottom: SIZES.padding}}
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
          <FlatList
            data={roomsList}
            keyExtractor={(item) => item.uid}
            refreshControl={
              <RefreshControl
                refreshing={this.state.refreshing}
                onRefresh={() => this.onRefresh()}
                tintColor="white"
              />
            }
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            ListHeaderComponent={
              (isInfluencer(Store.user) || isAdmin(Store.user)) &&
              this.state.search === ''
                ? this.renderSearchTerm(Store.user)
                : null
            }
            ListEmptyComponent={
              <Text
                text="Search Result Not Found"
                style={{
                  fontSize: 12,
                  color: 'gray',
                  marginTop: 10,
                  textAlign: 'center',
                }}
              />
            }
            renderItem={({item}) => this.renderSearchTerm(item)}
          />
        )}
        {nameModalVisible ? this.renderNameModal() : null}
      </View>
    );
  }
}

export default observer(Rooms);

/* <View
  style={{
    width: width,
    flexDirection: 'row',
    padding: 15,
    alignItems: 'center',
    justifyContent: 'flex-end',
  }}>
  <Text
    text="Anonymous Mode"
    style={{
      fontWeight: 'normal',
      color: COLORS.secondaryLabelColor,
      marginRight: 5,
    }}
  />
  <Switch
    trackColor={{false: COLORS.systemFill, true: COLORS.primary}}
    thumbColor={COLORS.secondary}
    ios_backgroundColor={COLORS.systemFill}
    onChange={() =>
      this.setState({
        anon: !this.state.anon,
        nameModalVisible: this.state.anon ? false : true,
        anonData: this.state.anon ? null : this.state.anonData,
        nameInput: this.state.anon ? '' : this.state.nameInput,
      })
    }
    value={anon}
  />
</View> */

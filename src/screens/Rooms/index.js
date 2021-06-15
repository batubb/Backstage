/* eslint-disable react/no-did-mount-set-state */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React, {Component} from 'react';
import {
  View,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Switch,
  KeyboardAvoidingView,
  SafeAreaView,
  TextInput,
  Platform,
} from 'react-native';
import {observer} from 'mobx-react';
import {Icon} from 'react-native-elements';
import {
  Loading,
  Header,
  Text,
  MyImage,
  SearchBar,
  Button,
  Divider,
} from '../../components';
import {constants} from '../../resources';
import {getDealsData, searchUser} from '../../services';
import {followerCount} from '../../lib';
import {StackActions} from '@react-navigation/native';
import {COLORS, SIZES} from '../../resources/theme';
import EditTitleModal from '../../components/ScreenComponents/AddContentComponents/EditTitleModal/EditTitleModal';

const {width, height} = Dimensions.get('window');

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
    const userArray = await getDealsData();
    this.setState({loading: false, userArray});
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
    if (search.length >= 3) {
      const searchArray = await searchUser(search, 'all', null);
      this.setState({searchArray, search});
    } else {
      this.setState({searchArray: [], search});
    }
  };

  changeSwitch = () => {};

  renderSearchTerms = (data) => {
    return data.map((item, index) => (
      <View
        key={item.uid}
        style={{
          width: width,
          alignItems: 'center',
        }}>
        <TouchableOpacity onPress={() => this.goTo('Chat', item)}>
          <View
            style={{
              width: width - 20,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 10,
              marginBottom: SIZES.spacing * 3,
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
                <Text text={`${item.username}`} style={{fontSize: 16}} />
              </View>
            </View>
          </View>
        </TouchableOpacity>
        <Divider width={'90%'} />
      </View>
    ));
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
      refreshing,
      userArray,
      searchArray,
      search,
      anon,
      nameModalVisible,
    } = this.state;

    return (
      <View style={{flex: 1, backgroundColor: constants.BACKGROUND_COLOR}}>
        <Header title="Rooms" />
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
          <ScrollView
            refreshControl={
              <RefreshControl refreshing={refreshing} tintColor="white" />
            }>
            <View style={{width: width, alignItems: 'center'}}>
              <SearchBar searchUser={(input) => this.searchUser(input)} />
              <View
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
              </View>
              {this.renderSearchTerms(
                searchArray.length === 0 && search.length === 0
                  ? userArray
                  : searchArray,
              )}
            </View>
          </ScrollView>
        )}
        {nameModalVisible ? this.renderNameModal() : null}
      </View>
    );
  }
}

export default observer(Rooms);

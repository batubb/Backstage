/* eslint-disable react/no-did-mount-set-state */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React, {Component} from 'react';
import {
  View,
  Dimensions,
  TextInput,
  Platform,
  Alert,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {observer} from 'mobx-react';
import {Loading, Header, Text} from '../../components';
import {constants} from '../../resources';
import {checkUserInfo} from '../../services';
import Store from '../../store/Store';
import {StackActions} from '@react-navigation/native';
import database from '@react-native-firebase/database';

const {width} = Dimensions.get('window');

class MyBanks extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      refreshing: false,
      account: '',
    };
  }

  componentDidMount = async () => {
    this.setState({
      loading: false,
      account:
        typeof Store.user.bankAccount === 'undefined'
          ? ''
          : Store.user.bankAccount,
    });
  };

  saveInfo = async () => {
    if (this.state.account === '') {
      return Alert.alert('Oops', 'You have to enter your bank account.', [
        {text: 'Okay'},
      ]);
    }

    this.setState({loading: true});

    var updates = {};
    updates[`users/${Store.user.uid}/bankAccount`] = this.state.account;

    try {
      await database().ref().update(updates);
      await checkUserInfo(Store.uid, true);
      this.props.navigation.dispatch(StackActions.popToTop());
    } catch (error) {
      return Alert.alert('Oops', constants.ERROR_ALERT_MSG, [{text: 'Okay'}]);
    }

    this.setState({loading: false});
  };

  render() {
    const {loading, refreshing, account} = this.state;

    return (
      <View style={{flex: 1, backgroundColor: constants.BACKGROUND_COLOR}}>
        <Header
          title="My Bank"
          leftButtonPress={() =>
            this.props.navigation.dispatch(StackActions.pop())
          }
          leftButtonIcon="chevron-left"
          rightButtonPress={() => this.saveInfo()}
          rightButtonIcon="check"
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
          <ScrollView
            refreshControl={
              <RefreshControl refreshing={refreshing} tintColor="white" />
            }>
            <TextInput
              placeholder="My Bank Account"
              style={{
                fontFamily:
                  Platform.OS === 'ios' ? 'Avenir' : 'sans-serif-condensed',
                margin: 10,
                width: width - 20,
                padding: 13,
                color: 'white',
                fontWeight: 'bold',
                fontSize: 14,
                borderRadius: 4,
                backgroundColor: '#424242',
              }}
              underlineColorAndroid="transparent"
              onChangeText={(textInput) => this.setState({account: textInput})}
              value={account}
              placeholderTextColor="gray"
            />
            <Text
              text="The name on your account must match the name of the owner of the bank account."
              style={{
                fontSize: 12,
                fontWeight: 'normal',
                color: 'lightgray',
                marginHorizontal: 15,
              }}
            />
          </ScrollView>
        )}
      </View>
    );
  }
}

export default observer(MyBanks);

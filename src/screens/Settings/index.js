/* eslint-disable react/no-did-mount-set-state */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React, {Component} from 'react';
import {
  View,
  Dimensions,
  ScrollView,
  Alert,
  RefreshControl,
  Linking,
} from 'react-native';
import {observer} from 'mobx-react';
import {StackActions} from '@react-navigation/native';
import {Loading, Header, Text, Label} from '../../components';
import {constants} from '../../resources';
import auth from '@react-native-firebase/auth';
import Store from '../../store/Store';
import { sendBirdDisconnect } from '../../services/connectSendbird';

const {width} = Dimensions.get('window');

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      refreshing: false,
    };
  }

  componentDidMount = async () => {
    this.setState({loading: false});
  };

  goTo = (route, info = null) => {
    if (
      route === 'Welcome' ||
      route === 'Notifications' ||
      route === 'PrivacyPolicy' ||
      route === 'EditBankAccount' ||
      route === 'Withdraw' ||
      route === 'Earnings' ||
      route === 'WithdrawalHistory'
    ) {
      const replaceActions = StackActions.push(route);
      return this.props.navigation.dispatch(replaceActions);
    } else if (route === 'MyInfo') {
      const replaceActions = StackActions.push(route, {type: info});
      return this.props.navigation.dispatch(replaceActions);
    }
  };

  signOutAndGoLogin = async () => {
    Alert.alert('Do you want to sign out?', '', [
      {
        text: 'Yes',
        onPress: () => {
          this.setState({loading: true});
          auth()
            .signOut()
            .then(async () => {
              await sendBirdDisconnect();
              this.goTo('Welcome');
            })
            .catch(() => {
              Alert.alert('Oops', constants.ERROR_ALERT_MSG, [{text: 'Okay'}]);
              this.setState({loading: false});
            });
        },
      },
      {text: 'No', style: 'cancel'},
    ]);
  };

  render() {
    const {loading, refreshing} = this.state;

    return (
      <View style={{flex: 1, backgroundColor: constants.BACKGROUND_COLOR}}>
        <Header
          title="Settings"
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
          <ScrollView
            refreshControl={
              <RefreshControl refreshing={refreshing} tintColor="white" />
            }>
            <Label
              text="Earnings"
              icon="currency-usd"
              onPressFunction={() => this.goTo('Earnings')}
              border
            />
            <Label
              text="Bank Information"
              icon="bank"
              onPressFunction={() => this.goTo('EditBankAccount')}
              border
            />
            <Label
              text="Withdrawal History"
              icon="history"
              onPressFunction={() => this.goTo('WithdrawalHistory')}
              border
            />
            <Label
              text="Notifications"
              icon="bell"
              onPressFunction={() => this.goTo('Notifications')}
              border
            />
            <Label
              text="Privacy & Terms"
              icon="file-document-outline"
              onPressFunction={() => {
                Linking.openURL(
                  'https://www.notion.so/Legal-974079130f2d44b38a45c41fc5207800',
                ).catch((err) => console.error('An error occurred', err));
              }}
              border
            />
            <Label
              text="Help"
              icon="help-circle-outline"
              onPressFunction={() => {
                Alert.alert(
                  'Help',
                  'Please reach out to us at emre@joinbackstage.co with any questions',
                );
              }}
              border
            />

            <Label
              text="Sign Out"
              icon="logout-variant"
              onPressFunction={() => this.signOutAndGoLogin()}
            />
          </ScrollView>
        )}
      </View>
    );
  }
}

export default observer(Home);

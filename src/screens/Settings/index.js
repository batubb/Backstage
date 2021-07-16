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
  ActionSheetIOS,
  Platform,
} from 'react-native';
import {observer} from 'mobx-react';
import {StackActions} from '@react-navigation/native';
import {Loading, Header, Label} from '../../components';
import {constants} from '../../resources';
import auth from '@react-native-firebase/auth';
import Store from '../../store/Store';
import {sendDataAnalytics} from '../../services';

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
    } else if (route === 'MyInfo' || route === 'Help') {
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

  shareProfileLink = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showShareActionSheetWithOptions(
        {
          message: constants.APP_WEBSITE + '/' + Store.user.username,
        },
        (error) =>
          sendDataAnalytics('share-profile-link', 'error', error, error.name),
        (success, method) =>
          method
            ? sendDataAnalytics(
                'share-profile-link',
                'success',
                {method},
                method,
              )
            : null,
      );
    }
  };

  showHelpOptions = () => {
    Alert.alert('Report a Problem', undefined, [
      {
        text: 'General Feedback',
        onPress: () => this.goTo('Help', 'General Feedback'),
      },
      {
        text: 'Ask a Question',
        onPress: () => this.goTo('Help', 'Ask a Question'),
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
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
              text="My Profile Link"
              icon="share-variant"
              onPressFunction={() => this.shareProfileLink()}
              border
            />
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
              onPressFunction={() => this.showHelpOptions()}
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

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
} from 'react-native';
import {observer} from 'mobx-react';
import {StackActions} from '@react-navigation/native';
import {Loading, Header, Text, Label} from '../../components';
import {constants} from '../../resources';
import auth from '@react-native-firebase/auth';
import Store from '../../store/Store';

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
      route === 'Login' ||
      route === 'Notifications' ||
      route === 'PrivacyPolicy' ||
      route === 'MyBanks'
    ) {
      const replaceActions = StackActions.push(route);
      return this.props.navigation.dispatch(replaceActions);
    } else if (route === 'MyInfo') {
      const replaceActions = StackActions.push(route, {type: info});
      return this.props.navigation.dispatch(replaceActions);
    }
  };

  signOutAndGoLogin = async () => {
    Alert.alert('Are you sure?', 'Do you want to sign out?', [
      {
        text: 'Yes',
        onPress: () => {
          this.setState({loading: true});
          auth()
            .signOut()
            .then(() => {
              this.goTo('Login');
            })
            .catch(() => {
              Alert.alert(
                'Oops',
                'Something went wrong. We are sorry for this',
                [{text: 'Okay'}],
              );
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
              text="Notifications"
              icon="bell"
              onPressFunction={() => this.goTo('Notifications')}
              border
            />
            <Label
              text="Payment Methods"
              icon="credit-card"
              onPressFunction={() => {}}
              border
            />
            <Label
              text="Creator Portal"
              icon="currency-usd"
              onPressFunction={() => {}}
              border
            />
            <Label
              text="Privacy Policy"
              icon="watermark"
              onPressFunction={() => {}}
              border
            />
            <Label
              text="Terms"
              icon="file-document-outline"
              onPressFunction={() => {}}
              border
            />
            <Label
              text="Help"
              icon="help-circle-outline"
              onPressFunction={() => {}}
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

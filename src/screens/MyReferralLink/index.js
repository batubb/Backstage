import React, {Component} from 'react';
import {View, ScrollView, RefreshControl} from 'react-native';
import {observer} from 'mobx-react';
import {Loading, Header, Text, Button, MyImage} from '../../components';
import {constants} from '../../resources';
import {shareItem} from '../../services';
import Store from '../../store/Store';
import {COLORS, SIZES} from '../../resources/theme';
import {StackActions} from '@react-navigation/native';
import database from '@react-native-firebase/database';
import Clipboard from '@react-native-clipboard/clipboard';

class MyReferralLink extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      refreshing: false,
      referralCode: Store.user.referralCode,
    };
  }

  componentDidMount = async () => {
    if (typeof this.state.referralCode === 'undefined') {
      const referralCode =
        Store.user.username +
        Math.random().toString(32).slice(8) +
        Date.now().toString(32).slice(8);
      await database()
        .ref('users')
        .child(Store.user.uid)
        .child('referralCode')
        .set(referralCode);
      Store.setUser({...Store.user, referralCode});
      this.setState({referralCode});
    }
    this.setState({loading: false});
  };

  shareReferralLink = async () => {
    await shareItem(
      constants.APP_WEBSITE + '/invite/' + this.state.referralCode,
      'share-my-referral-link',
    );
  };

  copyReferralCode = () => {
    Clipboard.setString(this.state.referralCode);
  };

  render() {
    const {loading, refreshing} = this.state;

    return (
      <View style={{flex: 1, backgroundColor: constants.BACKGROUND_COLOR}}>
        <Header
          title="My Referral Link"
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
            }
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: 'center',
            }}>
            <View
              style={{
                position: 'relative',
                backgroundColor: COLORS.systemFill,
                borderRadius: SIZES.radius,
                marginHorizontal: SIZES.padding,
                marginVertical: SIZES.padding * 2,
                padding: SIZES.padding * 4,
                overflow: 'hidden',
                alignItems: 'center',
              }}>
              <MyImage
                photo={Store.user.photo}
                style={{
                  width: constants.PROFILE_PIC_SIZE,
                  height: constants.PROFILE_PIC_SIZE,
                  borderRadius: 100,
                }}
              />
              <Text
                text="My Referral Code"
                style={{
                  paddingTop: SIZES.padding * 2,
                  textAlign: 'center',
                  fontSize: SIZES.h3,
                }}
              />
              <Text
                text={`${this.state.referralCode}`}
                style={{
                  textAlign: 'center',
                  marginTop: SIZES.padding,
                  fontSize: SIZES.h5,
                }}
              />
            </View>
            <Text
              text="You will be receiving half of our rate for the first year that your contact joins Backstage."
              style={{
                textAlign: 'center',
                marginTop: SIZES.padding,
                marginBottom: SIZES.padding * 4,
                fontSize: SIZES.body4,
                paddingHorizontal: SIZES.padding * 2,
                color: COLORS.secondaryLabelColor,
              }}
            />
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: SIZES.padding,
                marginBottom: SIZES.padding * 4,
              }}>
              <Button
                onPress={() => this.copyReferralCode()}
                text="Copy Code"
                secondary
                buttonStyle={{
                  paddingVertical: SIZES.padding2,
                  paddingHorizontal: SIZES.padding2 * 1.5,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: SIZES.padding * 0.5,
                }}
                textStyle={{
                  fontSize: SIZES.body3,
                }}
              />
              <Button
                onPress={() => this.shareReferralLink()}
                text="Share Link"
                primary
                buttonStyle={{
                  paddingVertical: SIZES.padding2,
                  paddingHorizontal: SIZES.padding2 * 1.5,
                  width: 125,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginLeft: SIZES.padding * 0.5,
                }}
                textStyle={{
                  fontSize: SIZES.body3,
                }}
              />
            </View>
          </ScrollView>
        )}
      </View>
    );
  }
}

export default observer(MyReferralLink);

import React, {Component} from 'react';
import {View, ScrollView, RefreshControl} from 'react-native';
import {observer} from 'mobx-react';
import {Loading, Header, Text, Button, MyImage} from '../../components';
import {constants} from '../../resources';
import {sendDataAnalytics, shareItem} from '../../services';
import {checkAndShowInfluencerModal} from '../../lib';
import Store from '../../store/Store';
import {COLORS, SIZES} from '../../resources/theme';
import {StackActions} from '@react-navigation/native';

class MyProfileLink extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      refreshing: false,
    };
  }

  componentDidMount = () => {
    if (checkAndShowInfluencerModal(this.props.navigation)) {
      return;
    }
    this.setState({loading: false});
  };

  shareProfileLink = async () => {
    await shareItem(
      constants.APP_WEBSITE + '/' + Store.user.username,
      'share-my-profile-link',
    );
  };

  render() {
    const {loading, refreshing} = this.state;

    return (
      <View style={{flex: 1, backgroundColor: constants.BACKGROUND_COLOR}}>
        <Header
          title="My Profile Link"
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
            <Text
              text={Store.user.name}
              style={{
                textAlign: 'left',
                marginTop: SIZES.padding * 6,
                paddingLeft: SIZES.padding * 2,
                fontSize: SIZES.h1,
              }}
            />
            <Text
              text={`@${Store.user.username}`}
              style={{
                textAlign: 'left',
                paddingLeft: SIZES.padding * 2,
                paddingTop: SIZES.padding,
                fontSize: SIZES.h2,
                color: COLORS.secondaryLabelColor,
              }}
            />
            <View
              style={{
                position: 'relative',
                backgroundColor: COLORS.systemFill,
                borderRadius: SIZES.radius,
                marginHorizontal: SIZES.padding,
                marginVertical: SIZES.padding * 4,
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
                text="My Profile Link"
                style={{
                  paddingTop: SIZES.padding * 2,
                  textAlign: 'center',
                  fontSize: SIZES.h3,
                }}
              />
              <Text
                text={`${constants.APP_WEBSITE}/${Store.user.username}`}
                style={{
                  textAlign: 'center',
                  marginTop: SIZES.padding,
                  fontSize: SIZES.h5,
                }}
              />
            </View>
            <View
              style={{
                alignItems: 'center',
                marginTop: SIZES.padding,
                marginBottom: SIZES.padding * 4,
              }}>
              <Button
                onPress={() => this.shareProfileLink()}
                text="Share"
                primary
                buttonStyle={{
                  padding: SIZES.padding * 1.5,
                  width: 150,
                  justifyContent: 'center',
                  alignItems: 'center',
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

export default observer(MyProfileLink);

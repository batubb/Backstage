import React, {Component} from 'react';
import {
  View,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {observer} from 'mobx-react';
import LinearGradient from 'react-native-linear-gradient';
import {Icon} from 'react-native-elements';
import {Loading, Header, Text, Button, Label, MyModal} from '../../components';
import {constants} from '../../resources';
import {getFollowingLiveData, getFollowingUserPosts} from '../../services';
import Store from '../../store/Store';
import {followerCount} from '../../lib';
import {COLORS, FONTS, SIZES} from '../../resources/theme';
import {StackActions} from '@react-navigation/native';
import {LineChart} from 'react-native-chart-kit';

const {width, height} = Dimensions.get('window');

class WithdrawalHistory extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      refreshing: false,
      selectedTab: 0,
    };
  }

  componentDidMount = async () => {
    this.setState({loading: false});
  };

  render() {
    const {loading, refreshing, selectedTab} = this.state;

    return (
      <View style={{flex: 1, backgroundColor: constants.BACKGROUND_COLOR}}>
        <Header
          title="Withdrawals"
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
            <View
              style={{
                alignItems: 'center',
                marginVertical: SIZES.padding * 3,
                marginHorizontal: SIZES.padding * 2,
                flex: 1,
                flexDirection: 'row',
              }}>
              <Button
                onPress={() => this.setState({selectedTab: 0})}
                text="Pending"
                buttonStyle={{
                  padding: SIZES.padding,
                  flex: 1,
                  marginRight: SIZES.padding * 0.5,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor:
                    selectedTab !== 0 ? COLORS.transparent : COLORS.white,
                }}
                textStyle={{
                  fontSize: SIZES.body3,
                  color:
                    selectedTab !== 0 ? COLORS.white : COLORS.black,
                }}
              />
              <Button
                onPress={() => this.setState({selectedTab: 1})}
                text="Completed"
                buttonStyle={{
                  padding: SIZES.padding,
                  flex: 1,
                  marginLeft: SIZES.padding * 0.5,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor:
                    selectedTab !== 1 ? COLORS.transparent : COLORS.white,
                }}
                textStyle={{
                  fontSize: SIZES.body3,
                  color:
                    selectedTab !== 1 ? COLORS.white : COLORS.black,
                }}
              />
            </View>
            <Label
              text="Withdraw"
              onPressFunction={() => {}}
              showRightIcon={false}
              secondaryText="20/05/2021 15:05"
              secondaryTextStyle={{
                paddingLeft: SIZES.padding,
                color: COLORS.secondaryLabelColor,
              }}
              showLeftIcon={false}
              customRightComponent={
                <Text
                  text={`$2`}
                  style={{
                    right: SIZES.padding,
                    textAlign: 'left',
                    color: COLORS.secondaryLabelColor,
                    fontSize: SIZES.h3,
                  }}
                />
              }
              border
              style={{
                left: SIZES.padding * 0.4,
                marginTop: SIZES.padding,
              }}
              touchableOpacityProps={{
                activeOpacity: 1,
              }}
            />
            <Label
              text="Withdraw"
              onPressFunction={() => {}}
              showRightIcon={false}
              showLeftIcon={false}
              secondaryText="20/05/2021 15:05"
              secondaryTextStyle={{
                paddingLeft: SIZES.padding,
                color: COLORS.secondaryLabelColor,
              }}
              customRightComponent={
                <Text
                  text={`$5`}
                  style={{
                    textAlign: 'left',
                    color: COLORS.secondaryLabelColor,
                    fontSize: SIZES.h3,
                  }}
                />
              }
              border
              style={{
                marginTop: SIZES.padding,
                paddingHorizontal: SIZES.padding * 1.2,
                paddingVertical: SIZES.padding * 2,
                borderRadius: SIZES.radius * 0.4,
                marginLeft: '2%',
                width: '95%',
              }}
              touchableOpacityProps={{
                activeOpacity: 1,
              }}
            />
            <Label
              text="Withdraw"
              onPressFunction={() => {}}
              showRightIcon={false}
              showLeftIcon={false}
              secondaryText="20/05/2021 15:05"
              secondaryTextStyle={{
                paddingLeft: SIZES.padding,
                color: COLORS.secondaryLabelColor,
              }}
              customRightComponent={
                <Text
                  text={`$2`}
                  style={{
                    right: SIZES.padding,
                    textAlign: 'left',
                    color: COLORS.secondaryLabelColor,
                    fontSize: SIZES.h3,
                  }}
                />
              }
              border
              style={{
                left: SIZES.padding * 0.4,
                marginTop: SIZES.padding,
              }}
              touchableOpacityProps={{
                activeOpacity: 1,
              }}
            />
            <Label
              text="Withdraw"
              onPressFunction={() => {}}
              showRightIcon={false}
              showLeftIcon={false}
              secondaryText="20/05/2021 15:05"
              secondaryTextStyle={{
                paddingLeft: SIZES.padding,
                color: COLORS.secondaryLabelColor,
              }}
              customRightComponent={
                <Text
                  text={`$5`}
                  style={{
                    textAlign: 'left',
                    color: COLORS.secondaryLabelColor,
                    fontSize: SIZES.h3,
                  }}
                />
              }
              border
              style={{
                marginTop: SIZES.padding,
                paddingHorizontal: SIZES.padding * 1.2,
                paddingVertical: SIZES.padding * 2,
                borderRadius: SIZES.radius * 0.4,
                marginLeft: '2%',
                width: '95%',
              }}
              touchableOpacityProps={{
                activeOpacity: 1,
              }}
            />
            <Label
              text="Withdraw"
              onPressFunction={() => {}}
              showRightIcon={false}
              showLeftIcon={false}
              secondaryText="20/05/2021 15:05"
              secondaryTextStyle={{
                paddingLeft: SIZES.padding,
                color: COLORS.secondaryLabelColor,
              }}
              customRightComponent={
                <Text
                  text={`$2`}
                  style={{
                    right: SIZES.padding,
                    textAlign: 'left',
                    color: COLORS.secondaryLabelColor,
                    fontSize: SIZES.h3,
                  }}
                />
              }
              border
              style={{
                left: SIZES.padding * 0.4,
                marginTop: SIZES.padding,
              }}
              touchableOpacityProps={{
                activeOpacity: 1,
              }}
            />
          </ScrollView>
        )}
      </View>
    );
  }
}

export default observer(WithdrawalHistory);

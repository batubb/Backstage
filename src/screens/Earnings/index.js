import React, {Component} from 'react';
import {
  View,
  Dimensions,
  ScrollView,
  RefreshControl,
  LogBox,
  Alert,
  Platform,
} from 'react-native';
import {observer} from 'mobx-react';
import {Loading, Header, Text, Button, Label} from '../../components';
import {constants} from '../../resources';
import Store from '../../store/Store';
import {checkAndShowInfluencerModal} from '../../lib';
import {checkUserInfo, getUserEarnings} from '../../services';
import {COLORS, SIZES} from '../../resources/theme';
import {StackActions} from '@react-navigation/native';
import {LineChart} from 'react-native-chart-kit';

LogBox.ignoreLogs(['"" is not', 'No stops in gradient']);

const {width} = Dimensions.get('window');

class Earnings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      refreshing: false,
      clickedPointData: {
        name: null,
        value: null,
      },
      numShowMonths: 5,
      data: [],
      totalEarnings: 0,
      withdrawableBalance: 0,
      referralEarnings: 0,
      subscriptionEarnings: 0,
    };

    this.months = constants.MONTHS;
    this.renderMonths = [];
  }

  componentDidMount = async () => {
    if (checkAndShowInfluencerModal(this.props.navigation)) {
      return;
    }
    const data = await this.getData();
    this.setState({loading: false, ...data});

    this.unsubscribe = this.props.navigation.addListener('focus', async (e) => {
      if (checkAndShowInfluencerModal(this.props.navigation)) {
        return;
      }
      this.setState({loading: true});
      const data = await this.getData();
      this.setState({loading: false, ...data});
    });
  };

  componentWillUnmount = () => {
    if (typeof this.unsubscribe !== 'undefined') {
      this.unsubscribe();
    }
  };

  onRefresh = async () => {
    if (checkAndShowInfluencerModal(this.props.navigation)) {
      return;
    }
    this.setState({refreshing: true});
    const data = await this.getData();
    this.setState({
      refreshing: false,
      ...data,
    });
  };

  getData = async () => {
    const updatedUser = await checkUserInfo(Store.user.uid, true);
    this.currentMonthIndex =
      new Date().getMonth() + 1 === 12 ? 0 : new Date().getMonth() + 1;

    this.calculateMonths();
    const data = Array(this.state.numShowMonths).fill(0);

    return await getUserEarnings(
      updatedUser,
      data,
      this.months,
      this.renderMonths,
    );
  };

  parseFloatToFixed = (value) => parseFloat(parseFloat(value).toFixed(2));

  goTo = (route, info = null) => {
    if (route === 'EditBankAccount') {
      const replaceActions = StackActions.push(route, info);
      return this.props.navigation.dispatch(replaceActions);
    } else if (route === 'WithdrawSummary') {
      if (this.state.withdrawableBalance < 5) {
        Alert.alert(
          'Oops',
          'To withdraw your money, your withdrawal balance must be over $5.',
        );
        return;
      }

      const replaceActions = StackActions.push(route, {
        withdrawableBalance: this.state.withdrawableBalance,
        referralEarnings: this.state.referralEarnings,
      });
      return this.props.navigation.dispatch(replaceActions);
    }
  };

  onWithdrawButtonPressed = async () => {
    if (typeof Store.user.bank === 'undefined') {
      this.goTo('EditBankAccount', {
        afterSuccessfulSave: () => this.goTo('WithdrawSummary'),
      });
    } else {
      this.goTo('WithdrawSummary');
    }
  };

  calculateMonths = () => {
    const {numShowMonths} = this.state;
    const currentMonthIndex = this.currentMonthIndex;

    if (currentMonthIndex - numShowMonths >= 0) {
      this.renderMonths = this.months
        .slice(currentMonthIndex - numShowMonths, currentMonthIndex)
        .map((item) => item.substr(0, 3));
    } else {
      const nextYearMonths = this.months.slice(0, currentMonthIndex + 1);
      const prevYearMonths = this.months.slice(
        this.months.length - numShowMonths + currentMonthIndex + 1,
        this.months.length,
      );

      this.renderMonths = [...prevYearMonths, ...nextYearMonths].map((item) =>
        item.substr(0, 3),
      );
    }
  };

  render() {
    const {
      loading,
      refreshing,
      clickedPointData,
      data,
      totalEarnings,
      withdrawableBalance,
      referralEarnings,
      subscriptionEarnings,
    } = this.state;

    return (
      <View style={{flex: 1, backgroundColor: constants.BACKGROUND_COLOR}}>
        <Header
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
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => this.onRefresh()}
                tintColor="white"
              />
            }>
            <Text
              text="Total Earnings"
              style={{
                textAlign: 'left',
                marginTop: SIZES.padding * 3,
                paddingLeft: SIZES.padding * 2,
                fontSize: SIZES.h1,
              }}
            />
            <Text
              text={`$${totalEarnings}`}
              style={{
                textAlign: 'left',
                paddingLeft: SIZES.padding * 2,
                paddingTop: SIZES.padding,
                fontSize: SIZES.h1,
                color: COLORS.secondaryLabelColor,
              }}
            />
            <View
              style={{
                position: 'relative',
                height: 320,
                backgroundColor: COLORS.systemFill,
                borderRadius: SIZES.radius,
                marginHorizontal: SIZES.padding,
                marginTop: SIZES.padding * 3,
                overflow: 'hidden',
              }}>
              <View
                style={{
                  position: 'absolute',
                  top: SIZES.padding,
                  left: 0,
                  flexDirection: 'column',
                  alignItems: 'center',
                  paddingTop: SIZES.padding,
                  paddingLeft: SIZES.padding * 6,
                }}>
                <Text
                  text={`${
                    clickedPointData.name ||
                    this.months[this.currentMonthIndex - 1]
                  }`}
                  style={{
                    textAlign: 'left',
                    alignSelf: 'flex-start',
                    fontSize: SIZES.h3,
                  }}
                />
                <Text
                  text={`${clickedPointData.value || new Date().getFullYear()}`}
                  style={{
                    textAlign: 'left',
                    color: COLORS.secondaryLabelColor,
                    alignSelf: 'flex-start',
                    fontSize: SIZES.h3,
                  }}
                />
              </View>
              <LineChart
                data={{
                  labels: this.renderMonths,
                  datasets: [
                    {
                      data,
                      color: (opacity = 1) => COLORS.primary,
                      strokeWidth: 2,
                    },
                  ],
                }}
                width={width + SIZES.padding * 5}
                height={260}
                withHorizontalLines={true}
                withVerticalLines={false}
                formatYLabel={(yValue) => `$${parseInt(yValue)}`}
                fromNumber={data[0]}
                onDataPointClick={(data) => {
                  if (data.index) {
                    this.setState({
                      clickedPointData: {
                        name: this.months.find(
                          (month) =>
                            month.slice(0, 3) === this.renderMonths[data.index],
                        ),
                        value: data.value ?? '0',
                      },
                    });
                  }
                }}
                chartConfig={{
                  backgroundGradientFromOpacity: 0,
                  backgroundGradientToOpacity: 0,
                  color: (opacity = 1) => COLORS.tertiaryLabelColor,
                  fillShadowGradient: Platform.OS === 'ios' ? '' : undefined,
                  labelColor: (opacity = 1) => COLORS.secondaryLabelColor,
                  propsForBackgroundLines: {
                    strokeDasharray:
                      Platform.OS === 'ios'
                        ? COLORS.secondaryLabelColor
                        : undefined,
                    strokeDashoffset: 15,
                  },
                  backgroundColor: COLORS.secondaryLabelColor,
                }}
                style={{
                  borderRadius: SIZES.radius,
                  marginTop: 75,
                  marginLeft: -(SIZES.padding * 1.6),
                }}
                bezier
              />
            </View>
            <Label
              text="Total Referral Earnings"
              onPressFunction={() => {}}
              showRightIcon={false}
              showLeftIcon={false}
              customRightComponent={
                <Text
                  text={`$${referralEarnings}`}
                  style={{
                    textAlign: 'left',
                    paddingLeft: SIZES.padding * 6,
                    color: COLORS.secondaryLabelColor,
                    fontSize: SIZES.h3,
                  }}
                />
              }
              style={{
                marginTop: SIZES.padding,
              }}
              touchableOpacityProps={{
                activeOpacity: 0.75,
              }}
            />
            <Label
              text="Total Subscription Earnings"
              onPressFunction={() => {}}
              showRightIcon={false}
              showLeftIcon={false}
              customRightComponent={
                <Text
                  text={`$${subscriptionEarnings}`}
                  style={{
                    textAlign: 'left',
                    paddingLeft: SIZES.padding * 6,
                    color: COLORS.secondaryLabelColor,
                    fontSize: SIZES.h3,
                  }}
                />
              }
              style={{
                marginTop: SIZES.padding,
              }}
              touchableOpacityProps={{
                activeOpacity: 0.75,
              }}
            />
            <Label
              text="Withdrawable Balance"
              onPressFunction={() => {}}
              showRightIcon={false}
              showLeftIcon={false}
              customRightComponent={
                <Text
                  text={`$${withdrawableBalance}`}
                  style={{
                    textAlign: 'left',
                    paddingLeft: SIZES.padding * 6,
                    color: COLORS.secondaryLabelColor,
                    fontSize: SIZES.h3,
                  }}
                />
              }
              style={{
                marginTop: SIZES.padding,
              }}
              touchableOpacityProps={{
                activeOpacity: 0.75,
              }}
            />
            <View
              style={{
                alignItems: 'center',
                marginVertical: SIZES.padding * 3,
              }}>
              <Button
                onPress={() => this.onWithdrawButtonPressed()}
                text="Withdraw"
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
                rightIconProps={{
                  name: 'bank',
                  color: '#FFF',
                  type: 'material-community',
                  size: 22,
                  style: {
                    paddingLeft: SIZES.spacing,
                  },
                }}
              />
            </View>
          </ScrollView>
        )}
      </View>
    );
  }
}

export default observer(Earnings);

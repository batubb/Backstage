import React, {Component} from 'react';
import {
  View,
  Dimensions,
  ScrollView,
  RefreshControl,
  LogBox,
} from 'react-native';
import {observer} from 'mobx-react';
import {Loading, Header, Text, Button, Label} from '../../components';
import {constants} from '../../resources';
import Store from '../../store/Store';
import {checkAndShowInfluencerModal} from '../../lib';
import {COLORS, SIZES} from '../../resources/theme';
import {StackActions} from '@react-navigation/native';
import {LineChart} from 'react-native-chart-kit';
import database from '@react-native-firebase/database';

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
    };

    this.months = constants.MONTHS;
    this.renderMonths = [];
  }

  componentDidMount = async () => {
    const {data, totalEarnings} = await this.getData();
    this.setState({loading: false, data, totalEarnings});
  };

  onRefresh = async () => {
    this.setState({refreshing: true});
    const {data, totalEarnings} = await this.getData();
    this.setState({refreshing: false, data, totalEarnings});
  };

  getData = async () => {
    if (checkAndShowInfluencerModal(this.props.navigation)) {
      return;
    }
    this.currentMonthIndex =
      new Date().getMonth() + 1 === 12 ? 0 : new Date().getMonth() + 1;

    this.calculateMonths();
    const data = Array(this.state.numShowMonths).fill(0);

    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    currentDate.setDate(1);
    currentDate.setMonth(currentDate.getMonth() - 4);

    const transactionsData = await database()
      .ref('transactions')
      .child(Store.user.uid)
      .once('value');

    let totalEarnings = 0;
    if (transactionsData.exists()) {
      const transactions = Object.values(
        Object.assign({}, transactionsData.val()),
      );

      totalEarnings = parseFloat(
        (Store.user.price * transactions.length).toFixed(2),
      );
      transactions.forEach((transaction) => {
        const purchaseDate = new Date(parseInt(transaction.purchaseDate));
        const purchaseMonthName = this.months[purchaseDate.getMonth()].substr(
          0,
          3,
        );
        const purchaseMonthIndex = this.renderMonths.findIndex(
          (m) => m === purchaseMonthName,
        );

        if (purchaseMonthIndex) {
          data[purchaseMonthIndex] += Store.user.price;
        }
      });
    }
    return {data, totalEarnings};
  };

  goTo = (route, info = null) => {
    if (route === 'EditBankAccount') {
      const replaceActions = StackActions.push(route, info);
      return this.props.navigation.dispatch(replaceActions);
    } else if (route === 'WithdrawSummary') {
      const replaceActions = StackActions.push(route);
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
                }}>
                <Text
                  text={
                    clickedPointData.name || this.months[this.currentMonthIndex-1]
                  }
                  style={{
                    textAlign: 'left',
                    paddingLeft: SIZES.padding * 6,
                    paddingTop: SIZES.padding,
                    fontSize: SIZES.h3,
                  }}
                />
                <Text
                  text={
                    clickedPointData.value !== null
                      ? `$${clickedPointData.value}`
                      : new Date().getFullYear()
                  }
                  style={{
                    textAlign: 'left',
                    paddingLeft: SIZES.padding * 6,
                    color: COLORS.secondaryLabelColor,
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
                  fillShadowGradient: '',
                  labelColor: (opacity = 1) => COLORS.secondaryLabelColor,
                  propsForBackgroundLines: {
                    strokeDasharray: COLORS.secondaryLabelColor,
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
              text="Withdrawable Balance"
              onPressFunction={() => {}}
              showRightIcon={false}
              showLeftIcon={false}
              customRightComponent={
                <Text
                  text={`$${data[data.length - 1]}`}
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
            />
            <View
              style={{
                alignItems: 'center',
                marginTop: SIZES.padding * 3,
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

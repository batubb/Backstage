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
import {Loading, Header, Text, Button, Label} from '../../components';
import {constants} from '../../resources';
import {getFollowingLiveData, getFollowingUserPosts} from '../../services';
import Store from '../../store/Store';
import {followerCount} from '../../lib';
import {COLORS, FONTS, SIZES} from '../../resources/theme';
import {StackActions} from '@react-navigation/native';
import {LineChart} from 'react-native-chart-kit';

const {width, height} = Dimensions.get('window');

class Withdraw extends Component {
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
    if (route === 'EditBankAccount') {
      const replaceActions = StackActions.push(route);
      return this.props.navigation.dispatch(replaceActions);
    } else if (route === 'WithdrawSummary') {
      const replaceActions = StackActions.push(route);
      return this.props.navigation.dispatch(replaceActions);
    }
  };

  render() {
    const {loading, refreshing} = this.state;

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
              <RefreshControl refreshing={refreshing} tintColor="white" />
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
              text="$ 1.284,10"
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
              <View style={{
                position: 'absolute',
                top: SIZES.padding,
                left: 0,
              }}>
                <Text
                  text="August"
                  style={{
                    textAlign: 'left',
                    paddingLeft: SIZES.padding * 6,
                    paddingTop: SIZES.padding,
                    fontSize: SIZES.h3,
                  }}
                />
                <Text
                  text="2021"
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
                  labels: [
                    'Jan',
                    'Febr',
                    'Mar',
                    'Apr',
                    'May',
                  ],
                  datasets: [
                    {
                      data: [50, 100, 150, 200, 250],
                      color: (opacity = 1) => COLORS.primary,
                      strokeWidth: 2,
                    },
                  ],
                }}
                width={width + SIZES.padding * 4}
                height={260}
                withHorizontalLines={true}
                withVerticalLines={false}
                fromZero={true}
                chartConfig={{
                  backgroundGradientFromOpacity: 0,
                  backgroundGradientToOpacity: 0,
                  color: (opacity = 1) => COLORS.tertiaryLabelColor,
                  fillShadowGradient: COLORS.systemFill,
                  labelColor: (opacity = 1) => COLORS.secondaryLabelColor,
                  propsForBackgroundLines: {
                    strokeDashoffset: 30,
                  },
                }}
                style={{
                  borderRadius: SIZES.radius,
                  marginTop: 75,
                  marginLeft: -SIZES.padding,
                }}
                bezier
              />
            </View>
            <Label
              text="Withdravable Balance"
              onPressFunction={() => {}}
              showRightIcon={false}
              showLeftIcon={false}
              customRightComponent={
                <Text
                  text="$ 52,99"
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
                onPress={() => this.goTo('WithdrawSummary')}
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

export default observer(Withdraw);

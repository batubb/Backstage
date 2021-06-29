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
import {Loading, Header, Text, Button} from '../../components';
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
              }}
            />
            <View
              style={{
                position: 'relative',
                height: 300,
                backgroundColor: COLORS.systemFill,
                borderRadius: SIZES.radius,
                marginHorizontal: SIZES.padding,
                marginTop: SIZES.padding * 3,
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
                    paddingLeft: SIZES.padding * 2,
                    paddingTop: SIZES.padding,
                    fontSize: SIZES.h3,
                  }}
                />
                <Text
                  text="2021"
                  style={{
                    textAlign: 'left',
                    paddingLeft: SIZES.padding * 2,
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
                      data: [20, 45, 28, 80, 99],
                      color: (opacity = 1) => COLORS.primary,
                      strokeWidth: 2,
                    },
                  ],
                }}
                width={width + SIZES.padding * 8}
                height={300}
                withHorizontalLabels={false}
                withInnerLines={false}
                withOuterLines={false}
                fromZero={true}
                chartConfig={{
                  backgroundGradientFromOpacity: 0,
                  backgroundGradientToOpacity: 0,
                  color: (opacity = 1) => COLORS.primary,
                  fillShadowGradient: 'transparent',
                }}
                style={{
                  borderRadius: SIZES.radius,
                  marginTop: 55,
                  marginLeft: -(SIZES.padding * 4),
                }}
                bezier
              />
            </View>
            <View
              style={{
                alignItems: 'center',
                marginTop: SIZES.padding * 8,
              }}>
              <Button
                onPress={() => this.goTo('EditBankAccount')}
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

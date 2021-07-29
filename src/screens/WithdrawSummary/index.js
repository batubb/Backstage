import React, {Component} from 'react';
import {View, Dimensions, ScrollView, RefreshControl} from 'react-native';
import {observer} from 'mobx-react';
import {Loading, Header, Text, Button, Label, MyModal} from '../../components';
import {constants} from '../../resources';
import Store from '../../store/Store';
import {COLORS, SIZES} from '../../resources/theme';
import {StackActions} from '@react-navigation/native';
import {withdraw} from '../../services';

class WithdrawSummary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      refreshing: false,
      showModal: false,
      withdrawableBalance: props.route.params.withdrawableBalance,
      referralEarnings: props.route.params.referralEarnings,
    };
  }

  componentDidMount = async () => {
    this.setState({loading: false});
  };

  onWithdrawApproved = async (amount) => {
    this.setState({loading: true});

    withdraw(amount, this.state.withdrawableBalance, () =>
      this.setState({showModal: true, loading: false}),
    );
  };

  parseFloatToFixed = (value) => parseFloat(parseFloat(value).toFixed(2));

  render() {
    const {
      loading,
      refreshing,
      showModal,
      withdrawableBalance,
      referralEarnings,
    } = this.state;

    const appleFees = this.parseFloatToFixed(withdrawableBalance * 0.15);
    const backstageFees = this.parseFloatToFixed(withdrawableBalance * 0.1);
    const userReceived = this.parseFloatToFixed(
      withdrawableBalance - appleFees - backstageFees + referralEarnings,
    );

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
            {showModal ? (
              <MyModal
                closeModal={() => {
                  this.setState({showModal: false});
                  this.props.navigation.dispatch(StackActions.pop());
                }}
                text="We have received your request. We will notify you when your money is on its way to your bank account."
                photo={constants.SUCCESS_ICON_URL}
              />
            ) : null}
            <Text
              text="Summary"
              style={{
                textAlign: 'left',
                marginTop: SIZES.padding * 6,
                marginBottom: SIZES.padding * 3,
                paddingLeft: SIZES.padding * 2,
                fontSize: SIZES.h1,
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
              text="Apple Fee (%15)"
              onPressFunction={() => {}}
              showRightIcon={false}
              showLeftIcon={false}
              customRightComponent={
                <Text
                  text={`- $${parseFloat(appleFees).toFixed(2)}`}
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
              text="Backstage Fee (%10)"
              onPressFunction={() => {}}
              showRightIcon={false}
              showLeftIcon={false}
              customRightComponent={
                <Text
                  text={`- $${parseFloat(backstageFees).toFixed(2)}`}
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
              text="You will receive"
              onPressFunction={() => {}}
              showRightIcon={false}
              showLeftIcon={false}
              customRightComponent={
                <Text
                  text={`$${parseFloat(userReceived).toFixed(2)}`}
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
                backgroundColor: COLORS.systemFill,
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
            {/* <Label
              text="Bank of America"
              icon="bank"
              onPressFunction={() => {}}
              showLeftIcon={true}
              customRightComponent={
                <Text
                  text="Edit"
                  style={{
                    textAlign: 'left',
                    paddingLeft: SIZES.padding * 6,
                    color: COLORS.secondaryLabelColor,
                    fontSize: SIZES.h5,
                  }}
                />
              }
              border={false}
              style={{
                paddingLeft: SIZES.padding * 2,
                marginTop: SIZES.padding,
              }}
              touchableOpacityProps={{
                activeOpacity: 0.8,
              }}
            />*/}
            {/* <Text
              text="We will send your money to Bank of America account."
              style={{
                textAlign: 'left',
                marginTop: SIZES.padding * 3,
                paddingLeft: SIZES.padding * 2,
                color: COLORS.secondaryLabelColor,
                fontSize: SIZES.body5,
              }}
            /> */}
            <View
              style={{
                alignItems: 'center',
                marginTop: SIZES.padding * 6,
                marginBottom: SIZES.padding * 4,
              }}>
              <Button
                onPress={() => this.onWithdrawApproved(userReceived)}
                text="Confirm"
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

export default observer(WithdrawSummary);

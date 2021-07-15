import React, {Component} from 'react';
import {View, ScrollView, RefreshControl, FlatList} from 'react-native';
import {observer} from 'mobx-react';
import {Loading, Header, Text, Button, Label} from '../../components';
import {constants} from '../../resources';
import {checkAndShowInfluencerModal} from '../../lib';
import {getUserWithdrawals} from '../../services';
import {COLORS, SIZES} from '../../resources/theme';
import {StackActions} from '@react-navigation/native';

class WithdrawalHistory extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      refreshing: false,
      selectedTab: 0,
      pendingWithdrawList: [],
      completedWithdrawList: [],
    };
  }

  componentDidMount = async () => {
    if (checkAndShowInfluencerModal(this.props.navigation)) {
      return;
    }
    const {
      pendingWithdrawList,
      completedWithdrawList,
    } = await getUserWithdrawals();

    this.setState({loading: false, pendingWithdrawList, completedWithdrawList});
  };

  onRefresh = async () => {
    this.setState({refreshing: true});

    const {
      pendingWithdrawList,
      completedWithdrawList,
    } = await getUserWithdrawals();

    this.setState({
      refreshing: false,
      pendingWithdrawList,
      completedWithdrawList,
    });
  };

  renderLine = (item) => (
    <Label
      text="Withdraw"
      onPressFunction={() => {}}
      showRightIcon={false}
      secondaryText={new Date(item.createTimestamp).toLocaleString()}
      secondaryTextStyle={{
        paddingLeft: SIZES.padding,
        color: COLORS.secondaryLabelColor,
      }}
      showLeftIcon={false}
      customRightComponent={
        <Text
          text={`$${item.amount.toFixed(2)}`}
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
  );

  render() {
    const {
      loading,
      refreshing,
      selectedTab,
      pendingWithdrawList,
      completedWithdrawList,
    } = this.state;

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
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => this.onRefresh()}
                tintColor="white"
              />
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
                  color: selectedTab !== 0 ? COLORS.white : COLORS.black,
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
                  color: selectedTab !== 1 ? COLORS.white : COLORS.black,
                }}
              />
            </View>
            <FlatList
              data={
                selectedTab === 0 ? pendingWithdrawList : completedWithdrawList
              }
              keyExtractor={(item) => item.uid}
              renderItem={({item}) => this.renderLine(item)}
              ListEmptyComponent={
                <Text
                  text={
                    selectedTab === 0
                      ? 'There is no pending withdrawal request'
                      : 'There is no completed withdrawal yet'
                  }
                  style={{
                    color: COLORS.gray,
                    textAlign: 'center',
                  }}
                />
              }
            />
          </ScrollView>
        )}
      </View>
    );
  }
}

export default observer(WithdrawalHistory);

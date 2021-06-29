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
import {TextInput} from 'react-native-gesture-handler';
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

const {width, height} = Dimensions.get('window');

class EditBankAccount extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      refreshing: false,
      accountHolder: '',
      swiftCode: '',
      ibanCode: '',
    };
  }

  componentDidMount = async () => {
    this.setState({loading: false});
  };

  renderInput = (label, value, onChangeText) => {
    return (
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          marginTop: SIZES.spacing * 15,
          marginHorizontal: SIZES.spacing * 6,
          borderRadius: 6,
          backgroundColor: COLORS.systemFill,
          paddingVertical: SIZES.spacing * 6,
          paddingHorizontal: SIZES.spacing * 3,
        }}>
        <TextInput
          placeholder={
            this.props.placeholder ? this.props.placeholder : `${label}`
          }
          underlineColorAndroid="transparent"
          onChangeText={(textInput) => onChangeText(textInput)}
          value={value}
          maxLength={30}
          style={{
            marginLeft: SIZES.spacing * 4,
            width: '100%',
            color: COLORS.primaryLabelColor,
          }}
          placeholderTextColor={COLORS.placeholderTextColor}
        />
      </View>
    );
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
              text="Add your bank account"
              style={{
                textAlign: 'left',
                marginTop: SIZES.padding * 3,
                paddingLeft: SIZES.padding * 2,
                fontSize: SIZES.h1,
              }}
            />
            <Text
              text="We will send your money to this bank account."
              style={{
                textAlign: 'left',
                paddingLeft: SIZES.padding * 2,
                paddingTop: SIZES.padding,
                fontSize: SIZES.h3,
                color: COLORS.gray,
              }}
            />
            {this.renderInput(
              'Account Holder Name',
              this.state.accountHolder,
              (accountHolder) => this.setState({accountHolder}),
            )}
            {this.renderInput('IBAN', this.state.iban, (iban) =>
              this.setState({iban}),
            )}
            {this.renderInput('Swift Code', this.state.swiftCode, (swiftCode) =>
              this.setState({swiftCode}),
            )}
            <View
              style={{
                alignItems: 'center',
                marginTop: SIZES.padding * 4,
              }}>
              <Button
                onPress={() =>
                  this.props.navigation.dispatch(StackActions.pop())
                }
                text="Save"
                primary
                buttonStyle={{
                  paddingVertical: SIZES.padding * 1.5,
                  paddingHorizontal: SIZES.padding * 6,
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

export default observer(EditBankAccount);

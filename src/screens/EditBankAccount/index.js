import React, {Component, createRef} from 'react';
import {
  View,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {TextInput} from 'react-native-gesture-handler';
import {observer} from 'mobx-react';
import LinearGradient from 'react-native-linear-gradient';
import {Icon} from 'react-native-elements';
import {Loading, Header, Text, Button, Label} from '../../components';
import {constants} from '../../resources';
import Store from '../../store/Store';
import {COLORS, FONTS, SIZES} from '../../resources/theme';
import {StackActions} from '@react-navigation/native';
import PhoneInput from 'react-native-phone-number-input';
import database from '@react-native-firebase/database';

const {width, height} = Dimensions.get('window');

class EditBankAccount extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      refreshing: false,
      isAdding: true,
      phoneFormatted: '',
      phoneExtracted: '',
      recipientFullName: '',
      recipientAddress: '',
      swiftCode: '',
      ibanCode: '',
    };
    this.phoneRef = createRef();
  }

  componentDidMount = async () => {
    if (typeof Store.user.bank === 'undefined') {
      this.setState({
        isAdding: true,
      });
    } else {
      this.setState({
        recipientFullName: Store.user.bank.recipientFullName ?? '',
        recipientAddress: Store.user.bank.recipientAddress ?? '',
        swiftCode: Store.user.bank.swift ?? '',
        ibanCode: Store.user.bank.iban ?? '',
        phoneFormatted: Store.user.bank.phoneNumber ?? '',
        phoneExtracted: Store.user.bank.phoneNumber ?? '',
        isAdding: false,
      });
    }
    this.setState({loading: false});
  };

  saveBankAccount = async () => {
    const {
      recipientFullName,
      recipientAddress,
      phoneFormatted,
      swiftCode,
      ibanCode,
    } = this.state;

    if (
      recipientAddress === '' ||
      recipientAddress === '' ||
      phoneFormatted === '' ||
      swiftCode === '' ||
      ibanCode === ''
    ) {
      return Alert.alert('Oops', 'All fields must be filled.', [
        {text: 'Okay'},
      ]);
    }
    this.setState({loading: true});

    var updates = {
      recipientFullName,
      recipientAddress,
      phoneNumber: phoneFormatted,
      swift: swiftCode,
      iban: ibanCode,
      lastUpdateTimestamp: new Date().getTime(),
    };

    try {
      await database().ref('users').child(Store.user.uid).child('bank').update(updates);
      await Store.setUser({...Store.user, bank: updates});
    } catch (error) {
      return Alert.alert('Oops', constants.ERROR_ALERT_MSG, [{text: 'Okay'}]);
    } finally {
      if (typeof this.props.route.params?.afterSuccessfulSave === 'function') {
        this.props.route.params?.afterSuccessfulSave();
      } else {
        this.props.navigation.dispatch(StackActions.pop());
      }
      this.setState({loading: false});
    }
  };

  renderInput = (
    label,
    value,
    onChangeText,
    marginTop = SIZES.spacing * 7.5,
  ) => {
    return (
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          marginTop,
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
    const {loading, refreshing, isAdding} = this.state;

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
              text={`${isAdding ? 'Add' : 'Edit'} your bank account`}
              style={{
                textAlign: 'left',
                marginTop: SIZES.padding,
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
            <Label
              text="Recipient Details"
              showLeftIcon={false}
              showRightIcon={false}
              style={{
                marginTop: SIZES.spacing * 6,
                marginBottom: SIZES.spacing * 3,
              }}
              onPressFunction={() => {}}
            />
            {this.renderInput(
              'Recipient Legal Full Name',
              this.state.recipientFullName,
              (recipientFullName) => this.setState({recipientFullName}),
              0,
            )}
            {this.renderInput(
              'Recipient Address',
              this.state.recipientAddress,
              (recipientAddress) => this.setState({recipientAddress}),
            )}
            <PhoneInput
              ref={this.phoneRef}
              defaultValue={this.state.phoneExtracted}
              codeTextStyle={{
                color: COLORS.primaryLabelColor,
              }}
              textInputStyle={{
                color: COLORS.primaryLabelColor,
              }}
              containerStyle={{
                borderRadius: constants.BORDER_RADIUS,
                width: '91%',
                marginHorizontal: SIZES.spacing * 6,
                marginTop: SIZES.spacing * 7.5,
                backgroundColor: COLORS.systemFill,
              }}
              textContainerStyle={{
                borderTopRightRadius: constants.BORDER_RADIUS,
                borderBottomRightRadius: constants.BORDER_RADIUS,
                backgroundColor: COLORS.systemFill,
              }}
              defaultCode="US"
              layout="first"
              onChangeText={(text) => {
                this.setState({phoneExtracted: text});
              }}
              onChangeFormattedText={(text) => {
                this.setState({phoneFormatted: text});
              }}
              withShadow
              autoFocus
            />
            <Label
              text="Bank Details"
              showLeftIcon={false}
              showRightIcon={false}
              style={{
                marginTop: SIZES.spacing * 6,
                marginBottom: SIZES.spacing * 3,
              }}
              onPressFunction={() => {}}
            />
            {this.renderInput(
              'IBAN',
              this.state.ibanCode,
              (ibanCode) => this.setState({ibanCode}),
              0,
            )}
            {this.renderInput('SWIFT Code', this.state.swiftCode, (swiftCode) =>
              this.setState({swiftCode}),
            )}
            <View
              style={{
                alignItems: 'center',
                marginTop: SIZES.padding * 4,
              }}>
              <Button
                onPress={() => this.saveBankAccount()}
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

/* eslint-disable radix */
/* eslint-disable react/no-did-mount-set-state */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React, {Component} from 'react';
import {
  View,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
  Platform,
} from 'react-native';
import {observer} from 'mobx-react';
import {Loading, Header, Text, MyImage, Button} from '../../components';
import {constants} from '../../resources';
import * as RNIap from 'react-native-iap';
import {
  subscribeInfluencer,
  checkUserInfo,
  createCustomerAndSubscription,
  createToken,
} from '../../services';
import Store from '../../store/Store';
import {followerCount} from '../../lib';
import {StackActions} from '@react-navigation/native';
import ProfileTop from '../../components/ScreenComponents/ProfileComponents/ProfileTop/ProfileTop';
import {DEFAULT_PAGE_WIDTH} from '../../resources/constants';

const {width} = Dimensions.get('window');

const items = Platform.select({
  ios: ['com.example.productId'],
  android: ['com.example.productId'],
});

class Subscribe extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      refreshing: false,
      influencer: this.props.route.params.influencer,
      posts:
        typeof this.props.route.params.posts === 'undefined'
          ? []
          : this.props.route.params.posts,
      showCard: false,
      cvc: '',
      cardNumber: '',
      expMonth: '',
      expYear: '',
      currency: 'usd',
    };
  }

  componentDidMount = async () => {
    const influencer = await checkUserInfo(this.state.influencer.uid);
    RNIap.prepare();
    RNIap.getProducts(items)
      .then((products) => {
        //handle success of fetch product list
        console.log(products);
      })
      .catch((error) => {
        console.log(error.message);
      });
    this.setState({loading: false, influencer});
  };

  subscribeInf = async (influencer = this.state.influencer) => {
    if (
      this.state.cardNumber === '' ||
      this.state.expMonth === '' ||
      this.state.expYear === '' ||
      this.state.cvc === ''
    ) {
      RNIap.buyProduct('com.example.productId')
        .then((purchase) => {
          this.setState({
            receipt: purchase.transactionReceipt,
          });
          // handle success of purchase product
        })
        .catch((error) => {
          console.log(error.message);
        });
      return Alert.alert('Oops', 'You have to enter all inputs.', [
        {text: 'Okay'},
      ]);
    }

    const year = new Date().getFullYear() - 2000;

    if (parseInt(this.state.expYear) === year) {
      if (parseInt(this.state.expMonth) - 1 < new Date().getMonth()) {
        return Alert.alert('Oops', "You card's expired date is invalid.", [
          {text: 'Okay'},
        ]);
      }
    } else if (parseInt(this.state.expYear) < year) {
      return Alert.alert('Oops', "You card's expired date is invalid.", [
        {text: 'Okay'},
      ]);
    }

    if (
      parseInt(this.state.expMonth) < 1 &&
      parseInt(this.state.expMonth) > 12
    ) {
      return Alert.alert('Oops', "You card's expired date is invalid.", [
        {text: 'Okay'},
      ]);
    }

    this.setState({loading: true});

    try {
      const params = {
        number: this.state.cardNumber,
        exp_month: parseInt(this.state.expMonth),
        exp_year: parseInt(this.state.expYear),
        cvc: this.state.cvc,
      };

      const token = await createToken(params);

      if (typeof token.id !== 'undefined') {
        const subs = await createCustomerAndSubscription(
          Store.user,
          this.state.influencer,
          token,
          constants.TIER_1,
        );

        if (subs) {
          const result = await subscribeInfluencer(
            Store.user,
            influencer,
            subs,
          );
          if (result) {
            return this.props.navigation.dispatch(StackActions.pop());
          }
        } else {
          this.setState({loading: false});
          return Alert.alert('Oops', constants.ERROR_ALERT_MSG, [
            {text: 'Okay'},
          ]);
        }
      } else {
        this.setState({loading: false});
        return Alert.alert('Oops', constants.ERROR_ALERT_MSG, [{text: 'Okay'}]);
      }
    } catch (error) {
      console.log(error);
      this.setState({loading: false});
    }
  };

  renderProfileTop = (user) => {
    const constWidth = width / 3;
    return (
      <View
        style={{
          width: width,
          flexDirection: 'row',
          padding: 15,
          alignItems: 'center',
        }}>
        <MyImage
          style={{
            width: constWidth,
            height: constWidth * (4 / 3),
            borderRadius: 8,
          }}
          photo={user.photo}
        />
        <View
          style={{
            marginLeft: 10,
            width: width - constWidth - 50,
            alignItems: 'center',
          }}>
          <Text text={user.name} style={{fontSize: 20}} />
          <Text
            text={
              typeof user.biography === 'undefined'
                ? 'No Biography'
                : user.biography
            }
            style={{fontSize: 12, color: 'gray'}}
          />
        </View>
      </View>
    );
  };

  renderDataBar = (user) => {
    return (
      <View
        style={{
          flexDirection: 'row',
          width: width,
          paddingVertical: 10,
          marginBottom: 10,
        }}>
        <View style={{alignItems: 'center', width: width / 2}}>
          <Text text={followerCount(user.follower)} style={{fontSize: 18}} />
          <Text text="Members" style={{fontSize: 16}} />
        </View>
        <View style={{alignItems: 'center', width: width / 2}}>
          <Text
            text={this.state.posts.length.toString()}
            style={{fontSize: 18}}
          />
          <Text text="Posts" style={{fontSize: 16}} />
        </View>
      </View>
    );
  };

  renderPayments = () => {
    return (
      <View
        style={{
          width: width,
          paddingHorizontal: 20,
          marginBottom: 10,
          alignItems: 'center',
        }}>
        <Text text="Membership Payment" style={{fontSize: 24}} />
        <Text
          text="As a member, you'll remain anonymus. Become a member The creator won't see your username."
          style={{
            fontSize: 16,
            color: 'gray',
            fontWeight: 'normal',
            marginTop: 10,
          }}
        />
        <Text
          text={`$ ${this.state.influencer.price.toFixed(2)}`}
          style={{fontSize: 32, marginTop: 10}}
        />
        <Text text="per month" style={{color: 'white', fontWeight: 'normal'}} />
        <Button
          text="JOIN"
          onPress={() => this.setState({showCard: true})}
          buttonStyle={{width: '100%', marginTop: 10}}
        />
      </View>
    );
  };

  // renderCard = () => {
  //   return (
  //     <View style={{width: width, padding: 10}}>
  //       <TextInputMask
  //         value={this.state.cardNumber}
  //         style={{
  //           fontFamily:
  //             Platform.OS === 'ios' ? 'Avenir' : 'sans-serif-condensed',
  //           color: '#FFF',
  //           fontSize: 16,
  //           fontWeight: 'bold',
  //           width: width - 20,
  //           padding: 10,
  //           backgroundColor: 'gray',
  //           borderRadius: 4,
  //           textAlign: 'center',
  //         }}
  //         onChangeText={(formatted, extracted) =>
  //           this.setState({cardNumber: extracted})
  //         }
  //         mask={'[0000] [0000] [0000] [0000]'}
  //         placeholder="Card Number"
  //         placeholderTextColor="lightgray"
  //         keyboardType="number-pad"
  //       />
  //       <View
  //         style={{
  //           width: width - 20,
  //           flexDirection: 'row',
  //           justifyContent: 'space-between',
  //           marginTop: 10,
  //         }}>
  //         <TextInputMask
  //           value={this.state.expMonth}
  //           style={{
  //             fontFamily:
  //               Platform.OS === 'ios' ? 'Avenir' : 'sans-serif-condensed',
  //             color: '#FFF',
  //             fontSize: 16,
  //             fontWeight: 'bold',
  //             width: (width - 20) / 5 - 5,
  //             padding: 10,
  //             backgroundColor: 'gray',
  //             borderRadius: 4,
  //             textAlign: 'center',
  //           }}
  //           onChangeText={(formatted, extracted) =>
  //             this.setState({expMonth: extracted})
  //           }
  //           mask={'[00]'}
  //           placeholder="Month"
  //           placeholderTextColor="lightgray"
  //           keyboardType="number-pad"
  //         />
  //         <TextInputMask
  //           value={this.state.expYear}
  //           style={{
  //             fontFamily:
  //               Platform.OS === 'ios' ? 'Avenir' : 'sans-serif-condensed',
  //             color: '#FFF',
  //             fontSize: 16,
  //             fontWeight: 'bold',
  //             width: (width - 20) / 5 - 5,
  //             padding: 10,
  //             backgroundColor: 'gray',
  //             borderRadius: 4,
  //             textAlign: 'center',
  //           }}
  //           onChangeText={(formatted, extracted) =>
  //             this.setState({expYear: extracted})
  //           }
  //           mask={'[00]'}
  //           placeholder="Year"
  //           placeholderTextColor="lightgray"
  //           keyboardType="number-pad"
  //         />
  //         <TextInputMask
  //           value={this.state.cvc}
  //           style={{
  //             fontFamily:
  //               Platform.OS === 'ios' ? 'Avenir' : 'sans-serif-condensed',
  //             color: '#FFF',
  //             fontSize: 16,
  //             fontWeight: 'bold',
  //             width: ((width - 20) * 3) / 5 - 5,
  //             padding: 10,
  //             backgroundColor: 'gray',
  //             borderRadius: 4,
  //             textAlign: 'center',
  //           }}
  //           onChangeText={(formatted, extracted) =>
  //             this.setState({cvc: extracted})
  //           }
  //           mask={'[000]'}
  //           placeholder="CVC"
  //           placeholderTextColor="lightgray"
  //           keyboardType="number-pad"
  //         />
  //       </View>
  //       <Text
  //         text="We do not record or store your card information anywhere. All transactions are made and protected by the Stripe payment system."
  //         style={{
  //           color: 'gray',
  //           fontWeight: 'normal',
  //           fontSize: 12,
  //           marginTop: 10,
  //           marginHorizontal: 5,
  //         }}
  //       />
  //       <Button
  //         buttonStyle={{
  //           width: '100%',
  //           alignSelf: 'center',
  //           marginTop: 10,
  //         }}
  //         text="Subscribe"
  //         onPress={() => this.subscribeInf()}
  //       />
  //     </View>
  //   );
  // };

  render() {
    const {loading, refreshing, influencer, showCard} = this.state;

    return (
      <View
        style={{
          flex: 1,
          backgroundColor: constants.BACKGROUND_COLOR,
        }}>
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
          <View style={{width: DEFAULT_PAGE_WIDTH, alignSelf: 'center'}}>
            {showCard ? null : (
              //this.renderCard()
              <>
                <ProfileTop
                  photo={influencer.photo}
                  name={influencer.name}
                  biography={influencer.biography}
                />
                {this.renderPayments()}
              </>
            )}
          </View>
        )}
      </View>
    );
  }
}

export default observer(Subscribe);

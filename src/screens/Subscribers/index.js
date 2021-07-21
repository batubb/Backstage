import React, {Component} from 'react';
import {
  View,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  KeyboardAvoidingView,
  SafeAreaView,
  TextInput,
  Platform,
  FlatList,
} from 'react-native';
import {observer} from 'mobx-react';
import {
  Loading,
  Header,
  Text,
  MyImage,
  SearchBar,
  Button,
  Divider,
  VerifiedIcon,
} from '../../components';
import {constants} from '../../resources';
import {getUserSubscribers} from '../../services';
import {StackActions} from '@react-navigation/native';
import {COLORS, SIZES} from '../../resources/theme';

const {width, height} = Dimensions.get('window');

class Subscribers extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      refreshing: false,
      userArray: [],
    };
  }

  componentDidMount = async () => {
    const userArray = await getUserSubscribers();
    this.setState({loading: false, userArray: userArray});
  };

  onRefresh = async () => {
    this.setState({refreshing: true});
    const userArray = await getUserSubscribers();
    this.setState({refreshing: false, userArray});
  };

  renderUsers = (item) => {
    return (
      <View
        style={{
          width: width,
          alignItems: 'center',
        }}>
        <View
          style={{
            width: width,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 10,
            marginBottom: SIZES.spacing * 3,
            paddingHorizontal: SIZES.padding * 2,
          }}>
          <MyImage
            style={{width: 55, height: 55, borderRadius: 30}}
            photo={item.user.photo}
          />
          <View
            style={{
              width: width,
              paddingLeft: SIZES.padding2,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <View style={{width: width - 150, flexDirection: 'row'}}>
              <Text text={`${item.user.username}`} style={{fontSize: 16}} />
              {item.user.verified === true ? <VerifiedIcon size={16} style={{paddingLeft: SIZES.spacing * 2}} />: null}
            </View>
          </View>
        </View>
        <Divider
          width={width}
          style={{marginLeft: SIZES.padding + 170, opacity: 0.2}}
        />
      </View>
    );
  };

  render() {
    const {loading, refreshing, userArray} = this.state;

    return (
      <View style={{flex: 1, backgroundColor: constants.BACKGROUND_COLOR}}>
        <Header
          title="Subscribers"
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
          <FlatList
            data={userArray}
            keyExtractor={(item) => item.uid}
            renderItem={({item}) => this.renderUsers(item)}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => this.onRefresh()}
                tintColor="white"
              />
            }
            ListEmptyComponent={() => {
              return (
                <View style={{width: width, alignItems: 'center', marginTop: SIZES.padding * 4}}>
                  <Text text="There are no subscribers" style={{color: 'gray'}} />
                </View>
              );
            }}
          />
        )}
      </View>
    );
  }
}

export default observer(Subscribers);

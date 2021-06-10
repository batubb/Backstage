/* eslint-disable react/no-did-mount-set-state */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React, {Component} from 'react';
import {
  View,
  Dimensions,
  FlatList,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {observer} from 'mobx-react';
import {Icon} from 'react-native-elements';
import LinearGradient from 'react-native-linear-gradient';
import {StackActions} from '@react-navigation/native';
import {Loading, Text, Header, MyImage, SearchBar} from '../../components';
import {constants} from '../../resources';
import {searchUser, getLeaderBoardData, getTrendingsData} from '../../services';
import {followerCount} from '../../lib';

const {width} = Dimensions.get('window');

class Search extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      refreshing: false,
      search: '',
      searchArray: [],
      type: 'trendings',
      dealsArray: [],
      trendingsArray: [],
      leaderBoardArray: [],
    };
  }

  componentDidMount = async () => {
    const trendingsArray = await getTrendingsData();
    const leaderBoardArray = await getLeaderBoardData();

    this.setState({loading: false, leaderBoardArray, trendingsArray});
  };

  onRefresh = async () => {
    this.setState({refreshing: true});

    const trendingsArray = await getTrendingsData();
    const leaderBoardArray = await getLeaderBoardData();

    this.setState({refreshing: false, leaderBoardArray, trendingsArray});
  };

  setType = async (type) => {
    this.setState({type: type});
  };

  searchUser = async (search) => {
    this.setState({search: search});

    if (search.length >= 3) {
      const searchArray = await searchUser(search);
      this.setState({searchArray});
    } else {
      this.setState({searchArray: []});
    }
  };

  goTo = (route, info) => {
    if (route === 'UserProfile') {
      const replaceActions = StackActions.push(route, {user: info});
      return this.props.navigation.dispatch(replaceActions);
    }
  };

  typeButton = (type, title, active = true) => {
    return (
      <TouchableOpacity
        onPress={() => (active ? this.setType(title.toLowerCase()) : null)}>
        <View
          style={{
            backgroundColor: type === title.toLowerCase() ? '#FFF' : null,
            width: width / 2 - 10,
            alignItems: 'center',
            borderRadius: 4,
            borderWidth: 0.5,
            borderColor: '#fff',
            paddingVertical: 5,
            marginHorizontal: 5,
            marginVertical: 10,
          }}>
          <Text
            text={title}
            style={{
              fontWeight: type === title.toLowerCase() ? 'bold' : 'normal',
              color: type === title.toLowerCase() ? '#000' : '#FFF',
            }}
          />
        </View>
      </TouchableOpacity>
    );
  };

  renderCards = (data) => {
    return (
      <FlatList
        data={data}
        keyExtractor={(item) => item.uid}
        numColumns={3}
        renderItem={({item}) => (
          <View style={{width: width / 3, alignItems: 'center', marginTop: 10}}>
            <TouchableOpacity onPress={() => this.goTo('UserProfile', item)}>
              <View
                style={{
                  borderRadius: 16,
                  width: width / 3 - 10,
                  height: 1.5 * (width / 3 - 10),
                  backgroundColor: '#4d4d4d',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <MyImage
                  style={{
                    width: width / 3 - 10,
                    height: 1.5 * (width / 3 - 10),
                    borderRadius: 16,
                  }}
                  photo={item.photo}
                />
                <LinearGradient
                  colors={[
                    'transparent',
                    'transparent',
                    constants.BACKGROUND_COLOR,
                  ]}
                  style={{
                    width: width / 3 - 10,
                    height: 1.5 * (width / 3 - 10),
                    borderRadius: 16,
                    position: 'absolute',
                  }}
                />
                <View
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    paddingVertical: 5,
                    paddingHorizontal: 10,
                    width: width / 3 - 10,
                    alignItems: 'flex-end',
                  }}>
                  <Text
                    text={
                      item.name.length >= 25
                        ? `${item.name.substring(0, 8)}...`
                        : item.name
                    }
                    style={{fontSize: 12}}
                  />
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}
      />
    );
  };

  renderLeaderBoard = (data) => {
    return (
      <FlatList
        data={data}
        keyExtractor={(item) => item.uid}
        renderItem={({item}) => (
          <View style={{width: width, alignItems: 'center', marginTop: 10}}>
            <TouchableOpacity onPress={() => this.goTo('UserProfile', item)}>
              <View
                style={{
                  width: width - 20,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                <Text text={item.index.toString()} style={{fontSize: 20}} />
                <MyImage
                  style={{width: 60, height: 60, borderRadius: 30}}
                  photo={item.photo}
                />
                <View
                  style={{
                    flexDirection: 'row',
                    width: width - 110,
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                  <View style={{width: width - 170}}>
                    <Text text={item.username} style={{fontSize: 16}} />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}
      />
    );
  };

  renderSearchTerms = (data) => {
    return (
      <FlatList
        data={data}
        keyExtractor={(item) => item.uid}
        renderItem={({item}) => (
          <View style={{width: width, alignItems: 'center'}}>
            <TouchableOpacity onPress={() => this.goTo('UserProfile', item)}>
              <View
                style={{
                  width: width - 20,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: 10,
                }}>
                <MyImage
                  style={{width: 60, height: 60, borderRadius: 30}}
                  photo={item.photo}
                />
                <View
                  style={{
                    flexDirection: 'row',
                    width: width - 90,
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                  <View style={{width: width - 150}}>
                    <Text text={item.name} style={{fontSize: 16}} />
                    <Text
                      text={`@${item.username}`}
                      style={{
                        fontSize: 14,
                        fontWeight: 'normal',
                        color: 'gray',
                      }}
                    />
                  </View>
                  {item.type === 'user' || item.type === 'influencer' ? (
                    <View style={{width: 60, alignItems: 'center'}}>
                      <Icon
                        name="chevron-right"
                        color="lightgray"
                        type="material-community"
                      />
                    </View>
                  ) : (
                    <View style={{width: 60}}>
                      <View
                        style={{
                          width: 60,
                          justifyContent: 'flex-end',
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}>
                        <Text
                          text={followerCount(item.follower)}
                          style={{
                            fontSize: 12,
                            fontWeight: 'normal',
                            color: 'lightgray',
                            marginRight: 5,
                          }}
                        />
                        <Icon
                          name="account-outline"
                          color="lightgray"
                          type="material-community"
                          size={12}
                        />
                      </View>
                      <View
                        style={{
                          width: 60,
                          justifyContent: 'flex-end',
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}>
                        <Text
                          text={followerCount(item.like)}
                          style={{
                            fontSize: 12,
                            fontWeight: 'normal',
                            color: 'lightgray',
                            marginRight: 5,
                          }}
                        />
                        <Icon
                          name="heart-outline"
                          color="lightgray"
                          type="material-community"
                          size={12}
                        />
                      </View>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}
      />
    );
  };

  render() {
    const {
      loading,
      refreshing,
      search,
      type,
      dealsArray,
      trendingsArray,
      leaderBoardArray,
      searchArray,
    } = this.state;

    return (
      <View style={{flex: 1, backgroundColor: constants.BACKGROUND_COLOR}}>
        <Header title="Search" />
        <SearchBar searchUser={(input) => this.searchUser(input)} />
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
        ) : search.length === 0 ? (
          <>
            <View
              style={{
                width: width,
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: 5,
              }}>
              {this.typeButton(type, 'Trendings')}
              {this.typeButton(type, 'Most Popular')}
            </View>
            <ScrollView
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={() => this.onRefresh()}
                  tintColor="white"
                />
              }>
              {type === 'trendings' ? this.renderCards(trendingsArray) : null}
              {type === 'most popular'
                ? this.renderLeaderBoard(leaderBoardArray)
                : null}
            </ScrollView>
          </>
        ) : (
          <View style={{width: width, alignItems: 'center'}}>
            {searchArray.length === 0 ? (
              <Text
                text="Search Result Not Found"
                style={{fontSize: 12, color: 'gray', marginTop: 10}}
              />
            ) : (
              this.renderSearchTerms(searchArray)
            )}
          </View>
        )}
      </View>
    );
  }
}

export default observer(Search);

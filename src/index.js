/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import {View, LogBox} from 'react-native';
import {Icon} from 'react-native-elements';
import {constants} from './resources';
import {STREAM_THEME} from './resources/theme';
import {OverlayProvider as ChatOverlayProvider} from 'stream-chat-react-native';
import CustomTabBarNavigator from './components/TabNavigatorComponents/CustomTabNavigator';

import Login from './screens/Login';
import Home from './screens/Home';
import Search from './screens/Search';
import CheckInfo from './screens/CheckInfo';
import Profile from './screens/Profile';
import Intro from './screens/Intro';
import UserProfile from './screens/UserProfile';
import WatchVideo from './screens/WatchVideo';
import WatchStory from './screens/WatchStory';
import TestPage from './screens/TestPage';
import Comments from './screens/Comments';
import Settings from './screens/Settings';
import Highlights from './screens/Highlights';
import Rooms from './screens/Rooms';
import MyInfo from './screens/MyInfo';
import Chat from './screens/Chat';
import ChatThread from './screens/ChatThread';
import AddContent from './screens/AddContent';
import PrivacyPolicy from './screens/PrivacyPolicy';
import Notifications from './screens/Notifications';
import Subscribe from './screens/Subscribe';
import MyBanks from './screens/MyBanks';
import EditProfile from './screens/EditProfile';
import Earnings from './screens/Earnings';
import EditBankAccount from './screens/EditBankAccount';
import WithdrawSummary from './screens/WithdrawSummary';
import WithdrawalHistory from './screens/WithdrawalHistory';
import Welcome from './screens/Welcome';
import {COLORS} from './resources/theme';
import {PlatformColor} from 'react-native';
import {getBottomSpace} from './lib/iPhoneXHelper';

LogBox.ignoreAllLogs();

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

class MyStack extends React.Component {
  render() {
    return (
      <NavigationContainer>
        <ChatOverlayProvider
          i18nInstance={constants.STREAM_I18N}
          value={{style: STREAM_THEME}}
          bottomInset={getBottomSpace()}>
          <Stack.Navigator headerMode="none" mode="card">
            <Stack.Screen
              name="Welcome"
              component={Welcome}
              options={{animationEnabled: false}}
            />
            <Stack.Screen
              name="Login"
              component={Login}
              options={{animationEnabled: false}}
            />
            <Stack.Screen name="Intro" component={Intro} />
            <Stack.Screen
              name="CheckInfo"
              component={CheckInfo}
              options={{animationEnabled: false}}
            />
            <Stack.Screen name="WatchVideo" component={WatchVideo} />
            <Stack.Screen name="Comments" component={Comments} />
            <Stack.Screen name="Chat" component={Chat} />
            <Stack.Screen name="ChatThread" component={ChatThread} />
            <Stack.Screen name="Subscribe" component={Subscribe} />
            <Stack.Screen
              name="TabBarMenu"
              component={TabBarMenu}
              options={{animationEnabled: false}}
            />
            <Stack.Screen name="UserProfile" component={UserProfile} />
          </Stack.Navigator>
        </ChatOverlayProvider>
      </NavigationContainer>
    );
  }
}

class HomeMenu extends React.Component {
  render() {
    return (
      <Stack.Navigator headerMode="none" mode="card">
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="UserProfile" component={UserProfile} />
        <Stack.Screen name="Rooms" component={Rooms} />
      </Stack.Navigator>
    );
  }
}

class SearchMenu extends React.Component {
  render() {
    return (
      <Stack.Navigator headerMode="none" mode="card">
        <Stack.Screen name="Search" component={Search} />
        <Stack.Screen name="UserProfile" component={UserProfile} />
        <Stack.Screen name="Rooms" component={Rooms} />
      </Stack.Navigator>
    );
  }
}

class RoomsMenu extends React.Component {
  render() {
    return (
      <Stack.Navigator headerMode="none" mode="card">
        <Stack.Screen name="Rooms" component={Rooms} />
        <Stack.Screen name="UserProfile" component={UserProfile} />
      </Stack.Navigator>
    );
  }
}

class ProfileMenu extends React.Component {
  render() {
    return (
      <Stack.Navigator headerMode="none" mode="card">
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen name="Settings" component={Settings} />
        <Stack.Screen name="Highlights" component={Highlights} />
        <Stack.Screen name="MyInfo" component={MyInfo} />
        <Stack.Screen name="Notifications" component={Notifications} />
        <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} />
        <Stack.Screen name="UserProfile" component={UserProfile} />
        <Stack.Screen name="Rooms" component={Rooms} />
        <Stack.Screen name="MyBanks" component={MyBanks} />
        <Stack.Screen name="EditProfile" component={EditProfile} />
        <Stack.Screen name="Earnings" component={Earnings} />
        <Stack.Screen name="EditBankAccount" component={EditBankAccount} />
        <Stack.Screen name="WithdrawSummary" component={WithdrawSummary} />
        <Stack.Screen name="WithdrawalHistory" component={WithdrawalHistory} />
      </Stack.Navigator>
    );
  }
}

class TabBarMenu extends React.Component {
  render() {
    return (
      <Stack.Navigator headerMode="none" mode="modal">
        <Stack.Screen
          name="TabBarBottom"
          component={TabBarBottom}
          options={{animationEnabled: false}}
        />
        <Stack.Screen name="AddContent" component={AddContent} />
        <Stack.Screen name="WatchStory" component={WatchStory} />
        <Stack.Screen name="TestPage" component={TestPage} />
      </Stack.Navigator>
    );
  }
}

class AddContentPlaceHolder extends React.Component {
  render() {
    return <View style={{flex: 1}} />;
  }
}

class TabBarBottom extends React.Component {
  render() {
    return (
      <Tab.Navigator
        lazy
        tabBar={(props) => (
          <CustomTabBarNavigator
            {...props}
            style={{
              height: 60 + getBottomSpace(),
              width: '100%',
              justifyContent: 'space-around',
              alignItems: 'center',
              backgroundColor: constants.BAR_COLOR,
              flexDirection: 'row',
            }}
            buttonStyle={{
              flex: 1,
              height: 60,
            }}
          />
        )}
        tabBarOptions={{
          tabBarPosition: 'bottom',
          swipeEnabled: false,
          showLabel: false,
          style: {
            backgroundColor: constants.BAR_COLOR,
            borderTopWidth: 0,
          },
          inactiveTintColor: COLORS.gray,
          activeTintColor: COLORS.primary,
        }}>
        <Tab.Screen
          name="HomeMenu"
          component={HomeMenu}
          options={{
            tabBarAccessibilityLabel: 'Feed',
            tabBarLabel: 'Feed',
            tabBarIcon: ({color, focused}) => (
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Icon
                  name="home"
                  type="ionicon"
                  size={focused ? 30 : 30}
                  color={color}
                />
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="SearchMenu"
          component={SearchMenu}
          options={{
            tabBarAccessibilityLabel: 'Search',
            tabBarLabel: 'Search',
            tabBarIcon: ({color, focused}) => (
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Icon
                  name="ios-search-sharp"
                  type="ionicon"
                  size={focused ? 30 : 30}
                  color={color}
                />
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="AddContent"
          component={AddContentPlaceHolder}
          options={{
            tabBarAccessibilityLabel: 'Create',
            tabBarLabel: 'Create',
            tabBarIcon: ({color, focused}) => (
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Icon
                  name="add-circle-outline"
                  type="ionicon"
                  size={focused ? 32 : 32}
                  color={color}
                />
              </View>
            ),
          }}
          listeners={() => ({
            tabPress: (event) => {
              event.preventDefault();
              this.props.navigation.navigate('AddContent');
            },
          })}
        />
        <Tab.Screen
          name="RoomsMenu"
          component={RoomsMenu}
          options={{
            tabBarAccessibilityLabel: 'RoomsMenu',
            tabBarLabel: 'Rooms',
            tabBarIcon: ({color, focused}) => (
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Icon
                  name="md-chatbox-ellipses-outline"
                  type="ionicon"
                  size={focused ? 30 : 30}
                  color={color}
                />
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="ProfileMenu"
          component={ProfileMenu}
          options={{
            tabBarAccessibilityLabel: 'Profile',
            tabBarLabel: 'Profile',
            tabBarIcon: ({color, focused}) => (
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Icon
                  name="md-person-circle-outline"
                  type="ionicon"
                  size={focused ? 32 : 32}
                  color={color}
                />
              </View>
            ),
          }}
        />
      </Tab.Navigator>
    );
  }
}

export default MyStack;

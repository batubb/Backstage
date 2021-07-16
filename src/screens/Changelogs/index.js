import React, {Component} from 'react';
import {View, ScrollView, RefreshControl, Dimensions} from 'react-native';
import {observer} from 'mobx-react';
import {Loading, Header, Text, Divider} from '../../components';
import {constants} from '../../resources';
import {COLORS, SIZES} from '../../resources/theme';
import {StackActions} from '@react-navigation/native';
import database from '@react-native-firebase/database';
import RenderHtml from 'react-native-render-html';
import {timeDifference} from '../../lib';

const {width} = Dimensions.get('window');

class Changelogs extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      refreshing: false,
      changelogs: [],
    };
  }

  componentDidMount = async () => {
    const changelogsData = await (
      await database().ref('changelogs').orderByChild('timestamp').once('value')
    ).val();
    const changelogs = Object.values(Object.assign({}, changelogsData));
    this.setState({loading: false, changelogs});
  };

  onRefresh = async () => {
    this.setState({refreshing: true});

    const changelogsData = await (
      await database().ref('changelogs').orderByChild('timestamp').once('value')
    ).val();
    const changelogs = Object.values(Object.assign({}, changelogsData));

    this.setState({
      refreshing: false,
      changelogs,
    });
  };

  render() {
    const {loading, refreshing, changelogs} = this.state;

    return (
      <View style={{flex: 1, backgroundColor: constants.BACKGROUND_COLOR}}>
        <Header
          title="Release Notes"
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
            }
            contentContainerStyle={{
              padding: SIZES.padding * 3,
            }}>
            <Text
              text={`👋🏼 Thank you so much for being a Backstage Beta Tester!\n`}
              style={{
                fontSize: SIZES.body3,
              }}
            />
            <Text
              text={
                `We are working hard to ship updates and make the app worldwide suitable. ` +
                `The list below is what we sent in every release of our portfolio.`
              }
              style={{
                fontSize: SIZES.body3,
                fontWeight: '500',
              }}
            />
            {changelogs.map((changelog) => (
              <View
                style={{paddingVertical: SIZES.padding * 2}}
                key={changelog.uid}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: COLORS.systemFill,
                    padding: SIZES.padding,
                    borderRadius: SIZES.radius * 0.25,
                  }}>
                  <Text
                    text={changelog.version}
                    style={{
                      fontSize: SIZES.h3,
                      color: COLORS.white,
                      paddingLeft: SIZES.spacing,
                    }}
                  />
                  <Text
                    text={timeDifference(changelog.timestamp)}
                    style={{
                      fontSize: SIZES.h5,
                      color: COLORS.gray,
                      paddingRight: SIZES.spacing,
                    }}
                  />
                </View>
                <RenderHtml
                  source={{html: changelog.notes}}
                  enableExperimentalMarginCollapsing={true}
                  contentWidth={width - SIZES.padding * 3}
                  defaultTextProps={{
                    style: {
                      fontSize: SIZES.body3,
                      fontWeight: '500',
                      color: COLORS.white,
                    },
                  }}
                />
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    );
  }
}

export default observer(Changelogs);

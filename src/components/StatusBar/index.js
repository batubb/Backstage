import React, {Component} from 'react';
import {SafeAreaView, StatusBar as RNStatusBar, View} from 'react-native';
import Store from '../../store/Store';
import Text from '../Text';
import {observer} from 'mobx-react';
import Orientation from 'react-native-orientation-locker';

class StatusBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLandspaceOrientation: false,
    };
  }
  componentDidMount() {
    Orientation.addDeviceOrientationListener(this._onOrientationDidChange);
  }

  componentWillUnmount() {
    Orientation.removeDeviceOrientationListener(this._onOrientationDidChange);
  }

  _onOrientationDidChange = () => {
    const {isLandspaceOrientation} = this.state;

    Orientation.getDeviceOrientation((currentOrientation) => {
      if (
        (currentOrientation === 'LANDSCAPE-LEFT' ||
          currentOrientation === 'LANDSCAPE-RIGHT') &&
        !isLandspaceOrientation
      ) {
        this.setState({isLandspaceOrientation: true});
      } else if (
        // do not include FACE-UP and FACE-DOWN
        (currentOrientation === 'PORTRAIT' ||
          currentOrientation === 'PORTRAIT-UPSIDEDOWN' ||
          currentOrientation === 'UNKNOWN') &&
        isLandspaceOrientation
      ) {
        this.setState({isLandspaceOrientation: false});
      }
    });
  };

  render() {
    if (!Store.statusBar.active) {
      return <></>;
    }
    return (
      <SafeAreaView
        style={{
          height: RNStatusBar.currentHeight,
          backgroundColor: Store.statusBar.color,
        }}>
        <RNStatusBar
          translucent={true}
          backgroundColor={Store.statusBar.color}
          animated={true}
          barStyle="light-content"
          showHideTransition="fade"
        />
        {this.state.isLandspaceOrientation ? (
          <View
            style={{
              height: 6,
              width: 0,
            }}
          />
        ) : Store.statusBar.text !== '' ? (
          <Text
            text={`${Store.statusBar.text}`}
            style={{
              textAlign: 'center',
              fontSize: 10,
              bottom: 7,
            }}
          />
        ) : null}
      </SafeAreaView>
    );
  }
}

export default observer(StatusBar);

import React from 'react';
import {
  TouchableWithoutFeedback,
  View,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';

export default class RippleFeedback extends React.PureComponent {
  constructor() {
    super();
    this.state = {};
    this.scaleValue = new Animated.Value(0);
    this.opacityRippleValue = new Animated.Value(0);
  }

  onLongPress = () => {
    this.props.onLongPress && this.props.onLongPress();
  };

  onPress = () => {
    this.props.onPress && this.props.onPress();
    Animated.parallel([
      Animated.timing(this.opacityRippleValue, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(this.scaleValue, {
        toValue: 1.2,
        duration: 250,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }),
    ]).start(({finished}) => {
      if (finished) {
        this.setDefaultAnimatedValues();
      }
    });
  };

  setDefaultAnimatedValues = () => {
    Animated.parallel([
      Animated.timing(this.opacityRippleValue, {
        toValue: 0,
        duration: 500,
        useNativeDriver: false,
      }),
      Animated.timing(this.scaleValue, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }),
    ]).start();
  };

  renderBackgroundLayer = () => {
    const RIPPLE_SIZE = 50;
    return (
      <View
        pointerEvents="none"
        style={[
          {
            ...StyleSheet.absoluteFillObject,
            flex: 1,
            flexGrow: 1,
            height: 50,
            top: -7.5,
          },
        ]}>
        <Animated.View
          pointerEvents="none"
          style={[
            {
              flex: 1,
              alignSelf: 'center',
              alignContent: 'center',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 100,
              width: 50,
              height: 50,
              transform: [{scale: this.scaleValue}],
              opacity: this.opacityRippleValue,
              backgroundColor: 'rgba(167, 104, 254, 0.26)',
            },
          ]}
        />
      </View>
    );
  };

  render() {
    return (
      <TouchableWithoutFeedback
        onLongPress={this.onLongPress}
        onPressOut={this.onPressOut}
        onPress={this.onPress}>
        <View pointerEvents="box-none">
          {this.props.children}
          {this.renderBackgroundLayer()}
        </View>
      </TouchableWithoutFeedback>
    );
  }
}

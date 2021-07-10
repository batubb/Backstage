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
    return (
      <Animated.View
        pointerEvents="none"
        style={[
          {
            ...StyleSheet.absoluteFillObject,
            position: 'absolute',
            top: -8,
            left: 17,
            width: 50,
            height: 50,
            borderRadius: 100,
            transform: [{scale: this.scaleValue}],
            opacity: this.opacityRippleValue,
            backgroundColor: 'rgba(167, 104, 254, 0.26)',
          },
        ]}
      />
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

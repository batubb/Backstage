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
    this.state = {
      scaleValue: new Animated.Value(0),
      opacityRippleValue: new Animated.Value(0.5),
      opacityBackgroundValue: new Animated.Value(0),
    };
  }

  onLongPress = () => {
    Animated.timing(this.state.opacityBackgroundValue, {
      toValue: this.state.maxOpacity / 2,
      duration: 700,
      useNativeDriver: false,
    }).start(() => {
      this.props.onLongPress && this.props.onLongPress();
    });
  };

  onPress = () => {
    Animated.parallel([
      Animated.timing(this.state.opacityRippleValue, {
        toValue: 0,
        duration: 125 + this.state.diameter,
        useNativeDriver: true,
      }),
      Animated.timing(this.state.scaleValue, {
        toValue: 1,
        duration: 125 + this.state.diameter,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(() => {
      this.setDefaultAnimatedValues();
      this.props.onPress && this.props.onPress();
    });
  };

  onPressIn = (event) => {
    this.setState({
      pressX: event.nativeEvent.locationX,
      pressY: event.nativeEvent.locationY,
    });
  };

  onPressOut = () => {
    Animated.parallel([
      Animated.timing(this.state.opacityBackgroundValue, {
        toValue: 0,
        duration: 500 + this.state.diameter,
        useNativeDriver: false,
      }),
      Animated.timing(this.state.opacityRippleValue, {
        toValue: 0,
        duration: 125 + this.state.diameter,
        useNativeDriver: false,
      }),
      Animated.timing(this.state.scaleValue, {
        toValue: 1,
        duration: 125 + this.state.diameter,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }),
    ]).start(this.setDefaultAnimatedValues);
  };

  setDefaultAnimatedValues = () => {
    this.state.scaleValue?.setValue(0);
    this.state.opacityRippleValue?.setValue(this.state.maxOpacity ?? 0);
  };

  renderRippleLayer = () => {
    const {
      pressX = 0,
      pressY = 0,
      diameter = 0,
      scaleValue = 0,
      opacityRippleValue = 0,
    } = this.state;

    return (
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: 'absolute',
            top: (pressY || 0) - diameter / 2,
            left: (pressX || 0) - diameter / 2,
            width: diameter,
            height: diameter,
            borderRadius: diameter / 2,
            transform: [{scale: scaleValue}],
            opacity: opacityRippleValue,
          },
        ]}
      />
    );
  };

  renderBackgroundLayer = () => {
    return (
      <Animated.View
        pointerEvents="none"
        style={[
          {
            ...StyleSheet.absoluteFillObject,
            opacity: this.state.opacityBackgroundValue,
          },
        ]}
      />
    );
  };

  render() {
    return (
      <TouchableWithoutFeedback
        onLayout={() => {}}
        onPressIn={this.onPressIn}
        onLongPress={this.onLongPress}
        onPressOut={this.onPressOut}
        onPress={this.onPress}>
        <View style={{flex: 1}} pointerEvents="box-none">
          {this.props.children}
          {this.renderBackgroundLayer()}
          {this.renderRippleLayer()}
        </View>
      </TouchableWithoutFeedback>
    );
  }
}

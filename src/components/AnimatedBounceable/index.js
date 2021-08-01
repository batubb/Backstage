import React from 'react';
import {
  Easing,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';
import PropTypes from 'prop-types';

export default class AnimatedBounceable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      animatedValue: new Animated.Value(1),
    };
  }

  animate = () => {
    this.state.animatedValue.setValue(this.props.effect);
    Animated.spring(this.state.animatedValue, {
      toValue: 1,
      friction: this.props.friction,
      useNativeDriver: this.props.useNativeDriver,
    }).start();
  };

  onPress = () => {
    this.animate();

    if (this.props.onPress) {
      this.props.onPress();
    }
  };

  render() {
    return (
      <TouchableWithoutFeedback
        {...this.props}
        onPress={this.onPress.bind(this, Easing.bounce)}>
        <Animated.View
          style={[this.props.style, {transform: [{scale: this.state.animatedValue}]}]}>
          {this.props.children}
        </Animated.View>
      </TouchableWithoutFeedback>
    );
  }
}

AnimatedBounceable.propTypes = {
  onPress: PropTypes.func.isRequired,
  friction: PropTypes.number,
  effect: PropTypes.number,
  useNativeDriver: PropTypes.bool,
  children: PropTypes.node,
  style: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.arrayOf(PropTypes.object),
  ]),
};

AnimatedBounceable.defaultProps = {
  effect: 0.9,
  friction: 3,
  useNativeDriver: true,
};
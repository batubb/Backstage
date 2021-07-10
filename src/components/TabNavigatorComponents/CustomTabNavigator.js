import React from 'react';
import {View} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import RippleFeedback from './RippleFeedback';

export default function CustomTabBarNavigator({
  state,
  descriptors,
  navigation,
  style,
  buttonStyle,
  rippleProps,
  ...props
}) {
  const focusedOptions = descriptors[state.routes[state.index].key].options;

  if (focusedOptions.tabBarVisible === false) {
    return null;
  }

  return (
    <View style={style}>
      {state.routes.map((route, index) => {
        const {options} = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <View
            key={index}
            style={buttonStyle}
            accessibilityRole="button"
            accessibilityState={isFocused ? {selected: true} : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}>
            <RippleFeedback
              onPress={onPress}
              onLongPress={onLongPress}>
              {options.tabBarIcon({
                focused: isFocused,
                color: isFocused
                  ? props.activeTintColor
                  : props.inactiveTintColor,
              })}
            </RippleFeedback>
          </View>
        );
      })}
    </View>
  );
}

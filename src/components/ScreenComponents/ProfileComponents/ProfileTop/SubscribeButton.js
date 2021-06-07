/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import Store from '../../../../store/Store';
import moment from 'moment';
import {Button} from '../../../../components';
import constants from '../../../../resources/constants';

export default function SubscribeButton(props) {
  return props.user.uid !== Store.user.uid ? (
    <Button
      buttonStyle={[
        {
          backgroundColor: constants.BLUE,
          padding: 10,
        },
        props.style,
      ]}
      textStyle={[{color: 'black'}, props.textStyle]}
      text={
        props.text
          ? props.text
          : !props.subscribtion.cancel
          ? props.subscribtion.subscribtion
            ? 'Unsubscribe'
            : 'Subscribe'
          : `Active until ${moment(props.subscribtion.endTimestamp).format(
              'L',
            )}`
      }
      onPress={props.onSubscribePress}
    />
  ) : null;
}

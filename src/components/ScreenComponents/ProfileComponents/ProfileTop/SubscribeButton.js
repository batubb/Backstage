/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import Store from '../../../../store/Store';
import moment from 'moment';
import {Button} from '../../../../components';

export default function SubscribeButton(props) {
  return props.user.uid !== Store.user.uid ? (
    <Button
      buttonStyle={{
        width: '100%',
        backgroundColor: '#FFF',
        padding: 10,
        marginTop: 10,
        borderRadius: 24,
      }}
      textStyle={{fontSize: 12, color: 'black'}}
      text={
        !props.subscribtion.cancel
          ? props.subscribtion.subscribtion
            ? 'Unsubscribe'
            : `Subscribe / ${props.user.price.toFixed(2)} $`
          : `Last date is ${moment(props.subscribtion.endTimestamp).format(
              'L',
            )}.`
      }
      onPress={props.onSubscribePress}
    />
  ) : null;
}

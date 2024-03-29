/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import Store from '../../../../store/Store';
import moment from 'moment';
import {Button} from '../../../../components';
import constants from '../../../../resources/constants';

export default function SubscribeButton(props) {
  return (
    <Button
      text={
        !props.subscribtion.cancel
          ? props.subscribtion.subscribtion
            ? 'Subscribed'
            : 'Subscribe'
          : `Ends on ${moment(props.subscribtion.endTimestamp).format(
              'MMMM DD',
            )}`
      }
      secondary={
        (!props.subscribtion.cancel && props.subscribtion.subscribtion) ||
        props.subscribtion.cancel
      }
      onPress={props.onSubscribePress}
      disabled={props.subscribtion.cancel}
    />
  );
}

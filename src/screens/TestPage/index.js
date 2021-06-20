/* eslint-disable react-native/no-inline-styles */
import React, {Component} from 'react';
import {observer} from 'mobx-react';
import {View} from 'react-native';
import {Text, Button} from '../../components';
import {StackActions} from '@react-navigation/native';

class TestPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      label: 'hello',
    };
  }

  render() {
    console.log('in render');
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: 'blue',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Text text={this.state.label} style={{marginBottom: 50}} />
        <Button
          buttonStyle={{marginBottom: 50}}
          text={'set Text'}
          onPress={() => {
            this.setState({label: 'damn'});
            console.log('just change state');
          }}
        />
        <Button
          text={'back'}
          onPress={() => this.props.navigation.dispatch(StackActions.pop())}
        />
      </View>
    );
  }
}

export default observer(TestPage);

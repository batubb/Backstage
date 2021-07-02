/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React, { Component } from 'react';
import { View, ActivityIndicator, Image } from 'react-native';
import PropTypes from 'prop-types';

export default class MyImage extends Component {
    state = {
        loading: true,
    }

    render() {
        const { photo, style, gradientComponent } = this.props;
        const { loading } = this.state;

        return (
            <View style={[{ backgroundColor: '#4d4d4d', alignItems: 'center', justifyContent: 'center' }, style]}>
                {loading ? <ActivityIndicator size="small" color="white" /> : null}
                <Image
                    style={[{ position: 'absolute' }, style]}
                    source={{ uri: photo }}
                    onLoadStart={() => this.setState({ loading: true })}
                    onLoadEnd={() => this.setState({ loading: false })}
                />
                {gradientComponent}
            </View>
        );
    }
}

MyImage.propTypes = {
    photo: PropTypes.string.isRequired,
    style: PropTypes.object,
    loading: PropTypes.bool
};

MyImage.defaultProps = {
    style: {},
};

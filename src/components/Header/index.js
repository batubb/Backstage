/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React from 'react';
import { Platform, Dimensions, StyleSheet } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Icon, Header } from 'react-native-elements';
import PropTypes from 'prop-types';
import { constants } from '../../resources';
import Text from '../Text';

const { width } = Dimensions.get('window');

export default class HeaderComponent extends React.Component {
    render() {
        const { borderColor, backgroundColor, rightButtonIcon, placement, leftButtonIcon, title, rightButtonPress, leftButtonPress } = this.props;

        return (
            <Header
                statusBarProps={{ barStyle: 'light-content', backgroundColor: backgroundColor }}
                leftComponent={
                    leftButtonPress ?
                        <TouchableOpacity style={styles.leftIcon} onPress={() => leftButtonPress()}>
                            <Icon name={leftButtonIcon} color="#FFF" type="material-community" />
                        </TouchableOpacity>
                        :
                        null
                }
                centerComponent={
                    <Text
                        text={title.length >= 22 ? `${title.substring(0, 22)}...` : title}
                        style={{ fontSize: 18 }}
                    />
                }
                rightComponent={
                    rightButtonPress ?
                        <TouchableOpacity style={styles.rightIcon} onPress={() => rightButtonPress()}>
                            <Icon name={rightButtonIcon} color="#FFF" type="material-community" />
                        </TouchableOpacity>
                        :
                        null
                }
                placement={placement}
                containerStyle={{ borderBottomWidth: borderColor === '' ? 0 : StyleSheet.hairlineWidth, backgroundColor: backgroundColor, borderColor: borderColor }}
            />
        );
    }
}

HeaderComponent.propTypes = {
    leftButtonIcon: PropTypes.string,
    rightButtonIcon: PropTypes.string,
    title: PropTypes.string,
    leftButtonPress: PropTypes.func,
    rightButtonPress: PropTypes.func,
    backgroundColor: PropTypes.string,
    borderColor: PropTypes.string,
    placement: PropTypes.string,
};

HeaderComponent.defaultProps = {
    leftButtonIcon: 'star',
    rightButtonIcon: 'star',
    title: '',
    leftButtonPress: null,
    rightButtonPress: null,
    backgroundColor: constants.BACKGROUND_COLOR,
    borderColor: '',
    placement: 'center',
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: '#fdde02',
        width: width,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    leftIcon: {
        paddingHorizontal: 15,
    },
    rightIcon: {
        paddingHorizontal: 15,
    },
    title: {
        fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif-condensed',
        fontSize: 20,
        color: '#FFF',
        fontWeight: 'bold',
    },
});

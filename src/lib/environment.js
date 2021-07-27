import { Platform } from 'react-native';
import RNTestFlight from 'react-native-test-flight';

export default function environment() {
    if (Platform.OS === 'ios') {
        if (RNTestFlight.isTestFlight) {
            return 'Sandbox';
        } else {
            return 'AppStore';
        }
    }
    return 'GooglePlay';
}
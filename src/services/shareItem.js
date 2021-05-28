/* eslint-disable prettier/prettier */
import Share from 'react-native-share';

export default async function shareItem(text = null) {
    const shareOptions = {
        message: text,
    };

    try {
        await Share.open(shareOptions);
        return true;
    } catch (error) {
        return false;
    }
}

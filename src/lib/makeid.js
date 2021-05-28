/* eslint-disable prettier/prettier */

export default function makeid(length = 6, type = 'normal') {

    if (type === 'uuid') {
        return `${makeid(8)}-${makeid(4)}-${makeid(4)}-${makeid(4)}-${makeid(12)}`;
    } else if (type === 'normal') {
        let text = '';

        const possible =
            'abcdefghijklmnopqrstuvwxyz0123456789';

        for (let i = 0; i < length; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        return text;
    }
}

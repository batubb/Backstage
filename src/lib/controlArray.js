/* eslint-disable prettier/prettier */
export default function controlArrays(userArray, user) {
    for (let i = 0; i < userArray.length; i++) {
        const element = userArray[i];

        if (user.uid === element.uid) {
            return false;
        }
    }

    return true;
}
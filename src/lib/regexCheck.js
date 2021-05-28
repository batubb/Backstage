/* eslint-disable prettier/prettier */
export default function regexCheck(string) {
    if (string.match(/[^A-Za-z0-9]+/g)) {
        return true;
    } else {
        return false;
    }
}
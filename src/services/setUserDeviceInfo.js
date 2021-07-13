import database from '@react-native-firebase/database';

export default async function setUserDeviceInfo(
  Store,
  {
    hasNotificationPermission,
    isEmailSubscribed,
    isPushDisabled,
    isSMSSubscribed,
    isSubscribed,
    notificationPermissionStatus,
    userId,
  },
) {
  if (!Store.devices.some((deviceId) => deviceId === userId)) {
    const userRef = await database()
      .ref('users')
      .child(Store.uid)
      .child('devices');

    const userDevices = await (await userRef.once('value')).val() ?? [];
    const devices = [...userDevices, userId];

    userRef.set(devices);
    Store.setDevices(devices);
  }
}

/* eslint-disable prettier/prettier */
import axios from 'axios';
import Store from '../store/Store';

export default async function getFollowingUserPosts(
  uid,
  followList,
  userType = Store.user.type,
) {
  var data = JSON.stringify({followList, userType});

  var config = {
    method: 'post',
    url:
      'https://us-central1-backstage-ceb27.cloudfunctions.net/api/getFollowingUserPosts',
    headers: {
      'Content-Type': 'application/json',
    },
    data: data,
  };

  try {
    const result = await axios(config);
    return result.data;
  } catch (error) {
    console.log(error);
    return false;
  }
}

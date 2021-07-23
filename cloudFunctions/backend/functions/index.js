/* eslint-disable prettier/prettier */
/* eslint-disable promise/catch-or-return */
const functions = require('firebase-functions');
const config = require('./config');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const app = express();
const stripe = require('stripe')(config.STRIPE_PUBLIC_KEY);
const axios = require('axios');
const OneSignal = require('onesignal-node');

app.use(cors({origin: true}));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
admin.initializeApp();

const runtimeOpts = {
  timeoutSeconds: 120,
  memory: '2GB',
};

Array.prototype.sortBy = function (keys) {
  return this.sort(function sort(i1, i2, sKeys = keys) {
    const compareKey = sKeys[0].key ? sKeys[0].key : sKeys[0];
    const order = sKeys[0].order || 'ASC'; // ASC || DESC
    let compareValue = i1[compareKey]
      .toString()
      .localeCompare(i2[compareKey].toString());
    compareValue =
      order.toUpperCase() === 'DESC' ? compareValue * -1 : compareValue;
    const checkNextKey = compareValue === 0 && sKeys.length !== 1;
    return checkNextKey ? sort(i1, i2, sKeys.slice(1)) : compareValue;
  });
};

app.post('/createCustomerAndSubscription', (request, response) => {
  const body = request.body;

  if (request.method !== 'POST') {
    return response.status(400).send(
      JSON.stringify({
        code: config.CODE_701,
        message: config.CODE_701_MESSAGE,
      }),
    );
  }

  if (
    typeof body.user === 'undefined' ||
    typeof body.influencer === 'undefined' ||
    typeof body.token === 'undefined' ||
    typeof body.planId === 'undefined'
  ) {
    return response.status(400).send(
      JSON.stringify({
        code: config.CODE_703,
        message: config.CODE_703_MESSAGE,
      }),
    );
  }

  start();

  async function start() {
    try {
      const customer = await stripe.customers.create({
        source: body.token,
        name: body.user.name,
        phone: body.user.phone,
        description: `${body.user.name} subscribe to ${body.influencer.name}`,
      });

      const subs = await stripe.subscriptions.create({
        customer: customer.id,
        items: [
          {
            plan: body.planId,
          },
        ],
      });

      return response.status(200).send(JSON.stringify(subs));
    } catch (error) {
      console.log(error);
      return response.status(400).send(
        JSON.stringify({
          code: config.CODE_702,
          message: config.CODE_702_MESSAGE,
        }),
      );
    }
  }
});

app.post('/readSubscription', (request, response) => {
  const body = request.body;

  if (request.method !== 'POST') {
    return response.status(400).send(
      JSON.stringify({
        code: config.CODE_701,
        message: config.CODE_701_MESSAGE,
      }),
    );
  }

  if (body.subId === 'undefined') {
    return response.status(400).send(
      JSON.stringify({
        code: config.CODE_703,
        message: config.CODE_703_MESSAGE,
      }),
    );
  }

  start();

  async function start() {
    try {
      const subs = await stripe.subscriptions.retrieve(body.subId);
      return response.status(200).send(JSON.stringify(subs));
    } catch (error) {
      console.log(error);
      return response.status(400).send(
        JSON.stringify({
          code: config.CODE_702,
          message: config.CODE_702_MESSAGE,
        }),
      );
    }
  }
});

app.post('/createToken', (request, response) => {
  const body = request.body;

  if (request.method !== 'POST') {
    return response.status(400).send(
      JSON.stringify({
        code: config.CODE_701,
        message: config.CODE_701_MESSAGE,
      }),
    );
  }

  if (body.subId === 'undefined') {
    return response.status(400).send(
      JSON.stringify({
        code: config.CODE_703,
        message: config.CODE_703_MESSAGE,
      }),
    );
  }

  start();

  async function start() {
    try {
      const token = await stripe.tokens.create({card: body.card});
      return response.status(200).send(JSON.stringify(token));
    } catch (error) {
      console.log(error);
      return response.status(400).send(
        JSON.stringify({
          code: config.CODE_702,
          message: config.CODE_702_MESSAGE,
        }),
      );
    }
  }
});

app.post('/cancelSubsription', (request, response) => {
  const body = request.body;

  if (request.method !== 'POST') {
    return response.status(400).send(
      JSON.stringify({
        code: config.CODE_701,
        message: config.CODE_701_MESSAGE,
      }),
    );
  }

  if (body.subId === 'undefined') {
    return response.status(400).send(
      JSON.stringify({
        code: config.CODE_703,
        message: config.CODE_703_MESSAGE,
      }),
    );
  }

  start();

  async function start() {
    try {
      const subs = await stripe.subscriptions.del(body.subId);
      return response.status(200).send(JSON.stringify(subs));
    } catch (error) {
      console.log(error);
      return response.status(400).send(
        JSON.stringify({
          code: config.CODE_702,
          message: config.CODE_702_MESSAGE,
        }),
      );
    }
  }
});

app.post('/getFollowingUserPosts', (request, response) => {
  const body = request.body;

  if (request.method !== 'POST') {
    return response.status(400).send(
      JSON.stringify({
        code: config.CODE_701,
        message: config.CODE_701_MESSAGE,
      }),
    );
  }

  if (body.followList === 'undefined') {
    return response.status(400).send(
      JSON.stringify({
        code: config.CODE_703,
        message: config.CODE_703_MESSAGE,
      }),
    );
  }

  const followList = body.followList;

  start();

  async function start() {
    try {
      const followListKeys = Object.keys(followList);

      var userPostsArray = [];

      for (let i = 0; i < followListKeys.length; i++) {
        const k = followListKeys[i];
        const element = followList[k];
        if (element.endTimestamp < new Date().getTime()) {
          continue;
        }
        const postsValue = await admin
          .database()
          .ref('posts')
          .child(element.uid)
          .once('value');
        const userValue = await admin
          .database()
          .ref('users')
          .child(element.uid)
          .once('value');
        var postsArray = [];

        postsValue.forEach((post) => {
          if (post.val()) {
            if (post.val().active) {
              postsArray.push(post.val());
            }
          }
        });

        postsArray.sort(function (a, b) {
          return b.timestamp - a.timestamp;
        });
        postsArray = postsArray.slice(0, 5);

        if (postsArray.length !== 0 && userValue.val()) {
          userPostsArray.push({
            posts: postsArray,
            ...userValue.val(),
            active: element.active,
            expired: element.expired,
          });
        }
      }

      const admins = await admin
        .database()
        .ref('users')
        .orderByChild('type')
        .equalTo('admin')
        .once('value');

      for (const adminUser of Object.values(Object.assign({}, admins.val()))) {
        if (adminUser) {
          const adminPostsValue = await admin
            .database()
            .ref('posts')
            .child(adminUser.uid)
            .once('value');

          var postsArray = [];

          adminPostsValue.forEach((post) => {
            if (post.val()) {
              if (post.val().active) {
                postsArray.push(post.val());
              }
            }
          });

          postsArray.sort(function (a, b) {
            return b.timestamp - a.timestamp;
          });
          postsArray = postsArray.slice(0, 5);

          if (postsArray.length !== 0) {
            userPostsArray.push({
              posts: postsArray,
              ...adminUser,
              active: true,
              expired: false,
            });
          }
        }
      }

      userPostsArray.sort(function (a, b) {
        return b.lastActivity - a.lastActivity;
      });

      return response.status(200).send(JSON.stringify(userPostsArray));
    } catch (error) {
      console.log(error);
      return response.status(400).send(
        JSON.stringify({
          code: config.CODE_702,
          message: config.CODE_702_MESSAGE,
        }),
      );
    }
  }
});

app.post('/getFollowingUserStories', (request, response) => {
  const body = request.body;

  if (request.method !== 'POST') {
    return response.status(400).send(
      JSON.stringify({
        code: config.CODE_701,
        message: config.CODE_701_MESSAGE,
      }),
    );
  }

  if (body.followList === 'undefined') {
    return response.status(400).send(
      JSON.stringify({
        code: config.CODE_703,
        message: config.CODE_703_MESSAGE,
      }),
    );
  }

  if (body.uid === 'undefined') {
    return response.status(400).send(
      JSON.stringify({
        code: config.CODE_703,
        message: config.CODE_703_MESSAGE,
      }),
    );
  }

  const followList = body.followList;
  const uid = body.uid;

  start();

  async function start() {
    try {
      /// **** FOLLOWING USER STORIES - BEGIN
      const followListKeys = Object.keys(followList);

      var userStoriesArray = [];

      for (let i = 0; i < followListKeys.length; i++) {
        const k = followListKeys[i];
        const element = followList[k];
        const storiesValue = await admin
          .database()
          .ref('stories')
          .child(element.uid)
          .once('value');
        const userValue = await admin
          .database()
          .ref('users')
          .child(element.uid)
          .once('value');
        var storiesArray = [];
        var myStoriesArray = [];

        for (const post of Object.values(
          Object.assign({}, storiesValue.val()),
        )) {
          if (post) {
            if (new Date().getTime() - post.timestamp < 24 * 60 * 60 * 1000) {
              const userValue = await admin
                .database()
                .ref('users')
                .child(post.user.uid)
                .once('value');

              if (userValue.val()) {
                storiesArray.push({
                  ...post,
                  user: userValue.val(),
                });
              }
            }
          }
        }

        storiesArray.sort(function (a, b) {
          return a.timestamp - b.timestamp;
        });

        if (storiesArray.length !== 0 && userValue.val()) {
          userStoriesArray.push({
            stories: storiesArray,
            ...userValue.val(),
            active: element.active,
            expired: element.expired,
            priority: 2, // 1 = admin, 2 = user
          });
        }
      }
      /// **** FOLLOWING USER STORIES - END
      /// **** MY STORIES - BEGIN
      const storiesValue = await admin
        .database()
        .ref('stories')
        .child(uid)
        .once('value');
      var myStoriesArray = [];

      for (const post of Object.values(Object.assign({}, storiesValue.val()))) {
        if (post) {
          if (new Date().getTime() - post.timestamp < 24 * 60 * 60 * 1000) {
            const userValue = await admin
              .database()
              .ref('users')
              .child(post.user.uid)
              .once('value');

            if (userValue.val()) {
              myStoriesArray.push({
                ...post,
                user: userValue.val(),
              });
            }
          }
        }
      }

      myStoriesArray.sort(function (a, b) {
        return a.timestamp - b.timestamp;
      });

      if (typeof myStoriesArray === 'undefined') {
        myStoriesArray = [];
      }
      /// **** MY STORIES - END
      /// **** ADMIN STORIES - BEGIN
      const admins = await admin
        .database()
        .ref('users')
        .orderByChild('type')
        .equalTo('admin')
        .once('value');

      for (const adminUser of Object.values(Object.assign({}, admins.val()))) {
        if (adminUser) {
          if (adminUser.uid !== uid) {
            const adminStoriesData = await admin
              .database()
              .ref('stories')
              .child(adminUser.uid)
              .once('value');

            var adminStoriesValue = [];

            for (const adminStory of Object.values(
              Object.assign({}, adminStoriesData.val()),
            )) {
              if (adminStory) {
                if (
                  new Date().getTime() - adminStory.timestamp <
                  24 * 60 * 60 * 1000
                ) {
                  adminStoriesValue.push({
                    ...adminStory,
                    user: adminUser,
                  });
                }
              }
            }

            adminStoriesValue.sort(function (a, b) {
              return a.timestamp - b.timestamp;
            });

            if (adminStoriesValue.length !== 0) {
              userStoriesArray.push({
                stories: adminStoriesValue,
                ...adminUser,
                active: true,
                expired: false,
                priority: 1, // 1 = admin, 2 = user
              });
            }
          }
        }
      }
      /// **** ADMIN STORIES - END

      userStoriesArray.sortBy([
        {key: 'priority', order: 'asc'},
        {key: 'lastActivity', order: 'desc'},
      ]);

      return response
        .status(200)
        .send(
          JSON.stringify({userStoriesArray, myStoriesArray}),
        );
    } catch (error) {
      console.log(error);
      return response.status(400).send(
        JSON.stringify({
          code: config.CODE_702,
          message: config.CODE_702_MESSAGE,
        }),
      );
    }
  }
});

app.post('/getUserSubscribers', (request, response) => {
  const body = request.body;

  if (request.method !== 'POST') {
    return response.status(400).send(
      JSON.stringify({
        code: config.CODE_701,
        message: config.CODE_701_MESSAGE,
      }),
    );
  }

  if (body.uid === 'undefined') {
    return response.status(400).send(
      JSON.stringify({
        code: config.CODE_703,
        message: config.CODE_703_MESSAGE,
      }),
    );
  }

  const uid = body.uid;

  start();

  async function start() {
    try {
      const subscribersData = await admin
        .database()
        .ref('follows')
        .child(uid)
        .once('value');
      const subscribersList = Object.keys(
        Object.assign({}, subscribersData.val()),
      );
      var subscribersArray = [];

      if (subscribersList.length > 0) {
        for (let i = 0; i < subscribersList.length; i++) {
          const followerUID = subscribersList[i];

          const element = await (
            await admin
              .database()
              .ref('followList')
              .child(followerUID)
              .child(uid)
              .once('value')
          ).val();

          if (element) {
            if (
              element.active === true &&
              element.expired === false &&
              element.endTimestamp > new Date().getTime()
            ) {
              const userValue = await admin
                .database()
                .ref('users')
                .child(element.followerUID)
                .once('value');

              if (userValue.val()) {
                subscribersArray.push({
                  ...element,
                  user: userValue.val(),
                });
              }
            }
          }
        }

        subscribersArray.sort(function (a, b) {
          return b.lastActivity - a.lastActivity;
        });
      }

      return response.status(200).send(JSON.stringify(subscribersArray));
    } catch (error) {
      console.log(error);
      return response.status(400).send(
        JSON.stringify({
          code: config.CODE_702,
          message: config.CODE_702_MESSAGE,
        }),
      );
    }
  }
});

app.post('/getFollowingLiveData', (request, response) => {
  const body = request.body;

  if (request.method !== 'POST') {
    return response.status(400).send(
      JSON.stringify({
        code: config.CODE_701,
        message: config.CODE_701_MESSAGE,
      }),
    );
  }

  if (body.followList === 'undefined') {
    return response.status(400).send(
      JSON.stringify({
        code: config.CODE_703,
        message: config.CODE_703_MESSAGE,
      }),
    );
  }

  const followList = body.followList;

  start();

  async function start() {
    try {
      const liveValue = await admin.database().ref('live').once('value');
      var liveArray = [];
      var liveValueArray = [];

      if (liveValue.val()) {
        const keys = Object.keys(liveValue.val());

        for (let i = 0; i < keys.length; i++) {
          const k = keys[i];
          const currentLiveData = liveValue.val()[k];

          if (currentLiveData.user.type === 'admin') {
            liveArray.push({
              ...currentLiveData,
              active: true,
              expired: false,
            });
          } else {
            liveValueArray.push(currentLiveData);
          }
        }

        for (let i = 0; i < followList.length; i++) {
          const element = followList[i];

          if (element.endTimestamp < new Date().getTime()) {
            continue;
          }

          for (let j = 0; j < liveValueArray.length; j++) {
            const data = liveValueArray[j];

            if (
              element.uid === data.user.uid &&
              new Date().getTime() > data.timestamp + 5000
            ) {
              liveArray.push({
                ...data,
                active: element.active,
                expired: element.expired,
              });
            }
          }
        }
      }

      return response.status(200).send(JSON.stringify(liveArray));
    } catch (error) {
      console.log(error);
      return response.status(400).send(
        JSON.stringify({
          code: config.CODE_702,
          message: config.CODE_702_MESSAGE,
        }),
      );
    }
  }
});

app.get('/livestreamControl', (request, response) => {
  if (request.method !== 'GET') {
    return response.status(400).send(
      JSON.stringify({
        code: config.CODE_701,
        message: config.CODE_701_MESSAGE,
      }),
    );
  }

  start();

  async function start() {
    for (let i = 0; i < 5; i++) {
      await controlLive();
      await sleep(10);
    }

    return response
      .status(200)
      .send(JSON.stringify({code: 200, message: 'Done.'}));
  }

  function sleep(ms = 1) {
    return new Promise((resolve) => setTimeout(resolve, ms * 1000));
  }

  async function controlLive() {
    const mux_instance = axios.create({
      baseURL: config.MUX_BASE_URL,
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        mp4_support: 'standard',
      },
      auth: {
        username: config.MUX_USERNAME,
        password: config.MUX_PASSWORD,
      },
    });

    const liveVal = await admin.database().ref('live').once('value');

    if (!liveVal.val()) {
      return true;
    }

    const liveValKeys = Object.keys(liveVal.val());

    for (let i = 0; i < liveValKeys.length; i++) {
      try {
        const k = liveValKeys[i];
        const element = liveVal.val()[k];

        if (typeof element.liveId !== 'undefined') {
          const livestreamResponse = await mux_instance.get(
            '/video/v1/live-streams/' + element.liveId,
          );
          const status = livestreamResponse.data.data.status;

          if (
            status !== 'active' &&
            new Date().getTime() - element.timestamp > config.MUX_DELAY
          ) {
            await admin.database().ref('live').child(element.uid).set(null);
            await admin
              .database()
              .ref('posts')
              .child(element.user.uid)
              .child(element.uid)
              .child('active')
              .set(true);
          }
        } else {
          await admin.database().ref('live').child(element.uid).set(null);
        }
      } catch (error) {
        console.log(error);
        admin.database().ref('live').child(element.uid).set(null);
      }
    }

    return true;
  }
});

app.post('/sendNotificationToUserDevices', (request, response) => {
  const body = request.body;

  if (request.method !== 'POST') {
    return response
      .status(400)
      .send(
        JSON.stringify({
          code: config.CODE_701,
          message: config.CODE_701_MESSAGE,
        }),
      );
  }

  if (body.userUIDs === 'undefined') {
    return response
      .status(400)
      .send(
        JSON.stringify({
          code: config.CODE_703,
          message: config.CODE_703_MESSAGE,
        }),
      );
  }

  if (body.type === 'undefined') {
    return response
      .status(400)
      .send(
        JSON.stringify({
          code: config.CODE_703,
          message: config.CODE_703_MESSAGE,
        }),
      );
  }

  const userUIDList = body.userUIDs;
  const notificationType = body.type === 'video' ? 'new-post' : body.type;
  const replaceContents = body.replaceContents;
  const url =
    typeof body.url !== 'undefined'
      ? body.url.replace('/video/', '/new-post/')
      : 'backstage://';

  start();

  async function start() {
    try {
      const notificationTemplate = await (
        await admin
          .database()
          .ref('notificationTemplates')
          .child(notificationType)
          .once('value')
      ).val();

      if (!notificationTemplate) {
        return response
          .status(400)
          .send(
            JSON.stringify({
              code: config.CODE_702,
              message: config.CODE_702_MESSAGE,
            }),
          );
      }

      var allDevices = [];

      for (let i = 0; i < userUIDList.length; i++) {
        const userUID = userUIDList[i];
        const userData = await admin
          .database()
          .ref('users')
          .child(userUID)
          .once('value');

        if (userData.val()) {
          if (userData.val().devices) {
            userData.val().devices.map((device) => {
              if (device) {
                allDevices.push(device);
              }
            });
          }
        }
      }

      const client = new OneSignal.Client(
        '9a94991e-d65d-4782-b126-e6c7e3e500c2',
        'OGEyMGZjOTEtYTZiZi00MDczLTlkMzktYjNmNmVkMjEzZWE3',
      );

      var notification = {
        contents: notificationTemplate.contents,
        headings: notificationTemplate.headings,
        app_url: url,
        include_player_ids: allDevices,
      };

      if (replaceContents) {
        for (let i = 0; i < replaceContents.length; i++) {
          const item = replaceContents[i];

          if (item) {
            Object.entries(notification.contents).map((value) => {
              if (value[1].includes(item.key)) {
                notification.contents[value[0]] = value[1].replace(
                  item.key,
                  item.value,
                );
              }
            });
            Object.entries(notification.headings).map((value) => {
              if (value[1].includes(item.key)) {
                notification.headings[value[0]] = value[1].replace(
                  item.key,
                  item.value,
                );
              }
            });
          }
        }
      }

      try {
        const clientResponse = await client.createNotification(notification);

        return response.status(200).send(JSON.stringify({successful: true}));
      } catch (e) {
        console.log(e);
        return response
          .status(400)
          .send(
            JSON.stringify({
              code: config.CODE_702,
              message: config.CODE_702_MESSAGE,
            }),
          );
      }
    } catch (error) {
      console.log(error);
      return response
        .status(400)
        .send(
          JSON.stringify({
            code: config.CODE_702,
            message: config.CODE_702_MESSAGE,
          }),
        );
    }
  }
});

exports.api = functions.runWith(runtimeOpts).https.onRequest(app);

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

app.use(cors({origin: true}));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
admin.initializeApp();

const runtimeOpts = {
  timeoutSeconds: 120,
  memory: '2GB',
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
      const followListKeys = Object.keys(followList);

      var userStoriesArray = [];

      for (let i = 0; i < followListKeys.length; i++) {
        const k = followListKeys[i];
        const element = followList[k];
        if (element.endTimestamp < new Date().getTime()) {
          continue;
        }
        const postsValue = await admin
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

        postsValue.forEach((post) => {
          if (post.val()) {
            if (
              new Date().getTime() - post.val().timestamp <
              24 * 60 * 60 * 1000
            ) {
              storiesArray.push(post.val());
            }
          }
        });

        storiesArray.sort(function (a, b) {
          return a.timestamp - b.timestamp;
        });

        if (storiesArray.length !== 0 && userValue.val()) {
          userStoriesArray.push({
            stories: storiesArray,
            ...userValue.val(),
            active: element.active,
            expired: element.expired,
          });
        }
      }

      const postsValue = await admin
        .database()
        .ref('stories')
        .child(uid)
        .once('value');
      var myStoriesArray = [];

      postsValue.forEach((post) => {
        if (post.val()) {
          if (
            new Date().getTime() - post.val().timestamp <
            24 * 60 * 60 * 1000
          ) {
            myStoriesArray.push(post.val());
          }
        }
      });

      myStoriesArray.sort(function (a, b) {
        return a.timestamp - b.timestamp;
      });

      userStoriesArray.sort(function (a, b) {
        return b.lastActivity - a.lastActivity;
      });

      if (typeof myStoriesArray === 'undefined') {
        myStoriesArray = [];
      }

      return response
        .status(200)
        .send(JSON.stringify({userStoriesArray, myStoriesArray}));
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
          liveValueArray.push(liveValue.val()[k]);
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

exports.api = functions.runWith(runtimeOpts).https.onRequest(app);

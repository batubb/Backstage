/* eslint-disable prettier/prettier */
const constants = {
    APP_NAME: 'Backstage',
    APP_VERSION: '1.0.0',


    MUX_USERNAME: '36bbe382-6820-4a76-b0be-f7e3a6e46564',
    MUX_PASSWORD: '5yq6+WeOBEfgiFapSIQhl8/6qurYypyUER9irR6DMGwIP1JPdh4kkG3tan+LaokI1BtvLnOpAyD',
    MUX_BASE_URL: 'https://api.mux.com',

    BACKGROUND_COLOR: '#0a0b09',
    BAR_COLOR: '#272727',
    BLUE: '#00ACED',
    RED: '#FF5733',

    DEFAULT_PHOTO: 'http://newgatehotel.com/wp-content/plugins/all-in-one-seo-pack/images/default-user-image.png',
    USER_PHOTO_THUMB_URL: 'https://firebasestorage.googleapis.com/v0/b/backstage-ceb27.appspot.com/o/users%2Fthumbs%2F',
    VIDEO_THUMB_URL: 'https://firebasestorage.googleapis.com/v0/b/backstage-ceb27.appspot.com/o/thumbnails%2Fthumbs%2F',

    DEALS_LIMIT: 5,

    TIER_1: 'price_1ImhznKwkzsqkh9m3eAmW9kG',
    TIERS: [
        {
            name: 'Tier 1',
            stripe: 'price_1IzPrSIZEMbfwJ3oNJrFHSM7',
            price: 1.99,
        },
        {
            name: 'Tier 2',
            stripe: 'price_1IzPrLIZEMbfwJ3o7e3RGk6W',
            price: 4.99,
        },
        {
            name: 'Tier 3',
            stripe: 'price_1IzPrPIZEMbfwJ3ov4Furhpj',
            price: 9.99,
        },
    ],
};

module.exports = constants;

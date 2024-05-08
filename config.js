require('dotenv').config();

const config = {
    twitter: {
        username: process.env.TWITTER_USERNAME, // dummy x account username
        password: process.env.TWITTER_PASSWORD, // dummy x account password
    },
    targetAccounts: [
        {"twitterAccount":"bnbchain","coinName":"BNB"},
        {"twitterAccount":"BlackCardCoin","coinName":"BCCOIN"},
        {"twitterAccount":"FinanceChainge","coinName":"XCHNG"},
        {"twitterAccount":"WhiteBit","coinName":"WBT"},
        {"twitterAccount":"SaucerSwapLabs","coinName":"SAUCE"},
    ],
};

module.exports = config;
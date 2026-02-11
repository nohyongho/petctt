const randomString = require('randomstring');

module.exports = {
    verificationLink: {
        host: process.env.NODE_ENV == 'production' ? "https://merchant.coupontalk.info" : "http://51.75.251.104:3002",
        key: randomString.generate(8),
        expiry: 1 * 24 * 60 * 60, // Link will expire after 24 hours
        mailSubject: 'Coupon TalkTalk verification email'
    }
};
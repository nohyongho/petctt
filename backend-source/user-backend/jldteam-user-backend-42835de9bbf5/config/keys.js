const randomString = require('randomstring');

module.exports = {
    sendGrid: {
        apiKey: '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'
    },
    verificationLink: {
        // host: 'http://127.0.0.1:3000',
        host: process.env.NODE_ENV == 'production' ? "https://user.coupontalk.info" : 'http://51.75.251.104:3080',
        key: randomString.generate(8),
        expiry: 1 * 24 * 60 * 60, // Link will expire after 24 hours
        mailSubject: 'Coupon TalkTalk verification email'
    },
    awsConfigs: {
        accessKeyId: 'AKIARJHRNHHLSZE5U23U',
        secretAccessKey: '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',
        region: 'ap-southeast-1'
    },
    awsConfigsProd: {
        accessKeyId: 'AKIAVFG2AEMURH7AUEVX',
        secretAccessKey: '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',
        region: 'ap-northeast-2'
    }
};
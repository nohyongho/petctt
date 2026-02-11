var express = require('express');
var router = express.Router();
const RewardsController = require('../controllers/RewardsController');
const authGaurd = require('../middleware/authGaurd');

const keys = require('../config/keys');
const commonConstants = require('../constants/commonConstants').commonConstants;
var path = require('path');

const response = require('../helper/response');

const aws = require('aws-sdk');
aws.config.update((process.env.NODE_ENV == 'production') ? keys.awsConfigsProd : keys.awsConfigs);

const s3 = new aws.S3();

const multerS3 = require('multer-s3');

const multer = require('multer');

var s3Storage = multerS3({
    s3: s3,
    bucket: commonConstants.S3_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
        var userId = req.user.data.user_id;
        var filePath = null;
        if (file.fieldname == "typeImage")
            filePath = "ads/" + userId + "/image/"
        else if (file.fieldname == "typeVideo")
            filePath = "ads/" + userId + "/video/";
        else if (file.fieldname == "typeQrAd")
            filePath = "ads/" + userId + "/qr_ad/";
        var fileNameWithPath = filePath + "user_" + userId + "_" + Date.now() + path.extname(file.originalname);
        cb(null, fileNameWithPath);
    },
    acl: 'public-read',
});

var upload = multer({
    limits: {
        fileSize: (1024 * 1024) * 40
    }, // 1024 Bytes = 1KB, File size restricted to 40MB
    storage: s3Storage,
    fileFilter: (req, file, cb) => {
        if (req.body.isExternalLink == "true" || req.body.isExternalLink == "1")
            return cb(new Error('files are at external link, no need to upload'), false);

        if (file.fieldname == "typeImage") {
            if (file.mimetype == "image/jpeg" || file.mimetype == "image/png" || file.mimetype == "image/jpg")
                cb(null, true);
            else
                return cb(new Error('Only .png, .jpg, .jpeg format allowed for Image Ad!'), false);
        } else if (file.fieldname == "typeVideo" || file.fieldname == "typeQrAd") {
            if (file.mimetype == "video/mp4")
                cb(null, true);
            else
                return cb(new Error('Only .mp4 format allowed for Video or QR Ad!'), false);
        } else {
            return cb(new Error('Invalid ad file uploaded.'), false);
        }

    }
}).fields([{
    name: 'typeImage',
    maxCount: 1
}, {
    name: 'typeVideo',
    maxCount: 1
}, {
    name: 'typeQrAd',
    maxCount: 1
}]);

router.get('/', function (req, res, next) {
    res.send('Try another route');
});

router.post('/getAds', authGaurd.authenticatePrivate, function (req, res) {
    RewardsController().getAds(req, res);
});

router.post('/seenAd', authGaurd.authenticatePrivate, function (req, res) {
    RewardsController().seenAd(req, res);
});

router.post('/seeQrAd', authGaurd.authenticatePrivate, function (req, res) {
    RewardsController().seeQrAd(req, res);
});

router.post('/getMyAds', authGaurd.authenticatePrivate, function (req, res) {
    RewardsController().getMyAds(req, res);
});

router.post('/changeAdStatus', authGaurd.authenticatePrivate, function (req, res) {
    RewardsController().changeAdStatus(req, res);
});

router.post('/getAdById', authGaurd.authenticatePrivate, function (req, res) {
    RewardsController().getAdById(req, res);
});

router.post('/createAd', authGaurd.authenticatePrivate, function (req, res, next) {
    upload(req, res, (err) => {

        if (req.body.isExternalLink == "true" || req.body.isExternalLink == "1") {
            console.log("deleting files because external link provided. TAK");
            deleteAdFromS3Bucket(req);
            return next();
        }
        var filesLength = Object.keys(req.files).length;

        if (err instanceof multer.MulterError) {
            deleteAdFromS3Bucket(req);
            return response.error(res, err.message);
        } else if (err) {
            deleteAdFromS3Bucket(req);
            return response.error(res, err.message);
        } else if (filesLength === 0 && (req.body.isExternalLink == "false" || req.body.isExternalLink == "0")) {
            return response.error(res, "No file uploaded. ECA0974");
        } else if (filesLength > 1) {
            deleteAdFromS3Bucket(req);
            return response.error(res, "Only one file is allowed per ad creation. ECA078545");
        }

        return next();

    })
}, function (req, res, next) {
    RewardsController().createAd(req, res);
});

router.post('/deleteAd', authGaurd.authenticatePrivate, function (req, res) {
    RewardsController().deleteAd(req, res);
});

router.post('/pauseAd', authGaurd.authenticatePrivate, function (req, res) {
    RewardsController().pauseAd(req, res);
});

router.post('/editAd', authGaurd.authenticatePrivate, function (req, res) {
    RewardsController().editAd(req, res);
});

router.get('/adsPerViewAmount', authGaurd.authenticatePrivate, function (req, res) {
    RewardsController().adsPerViewAmount(req, res);
});

module.exports = router;

async function deleteAdFromS3Bucket(req) {
    if (!req.files)
        return
    if (req.files.typeImage) {
        s3.deleteObject({
            Bucket: commonConstants.S3_BUCKET_NAME,
            Key: req.files.typeImage[0].key
        }, function (err, data) {})
    }

    if (req.files.typeVideo) {
        s3.deleteObject({
            Bucket: commonConstants.S3_BUCKET_NAME,
            Key: req.files.typeVideo[0].key
        }, function (err, data) {})
    }
    if (req.files.typeQrAd) {
        s3.deleteObject({
            Bucket: commonConstants.S3_BUCKET_NAME,
            Key: req.files.typeQrAd[0].key
        }, function (err, data) {})
    }
}
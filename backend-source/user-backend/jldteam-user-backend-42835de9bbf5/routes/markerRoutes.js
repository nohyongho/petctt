var express = require('express');
var router = express.Router();
const MarkerController = require('../controllers/MarkerController');
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
        if (file.fieldname == "markerImg")
            filePath = "markers/" + userId + "/image/"
        else if (file.fieldname == "markerRef")
            filePath = "markers/" + userId + "/image_ref/";
        var fileNameWithPath = filePath + "user_" + userId + "_" + Date.now() + path.extname(file.originalname);
        cb(null, fileNameWithPath);
    },
    acl: 'public-read',
});

var upload = multer({
    limits: {
        fileSize: (1024 * 1024) * 20
    }, // 1024 Bytes = 1KB, File size restricted to 20MB
    storage: s3Storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg") {
            cb(null, true);
        } else {
            return cb(new Error('Only .png, .jpg format allowed!'), false);
        }
    }
}).fields([{
    name: 'markerImg',
    maxCount: 1
}, {
    name: 'markerRef',
    maxCount: 1
}]);

router.get('/', function (req, res, next) {
    res.send('Try another route');
});

router.post('/createMarker', authGaurd.authenticatePrivate, (req, res, next) => {
    upload(req, res, (err) => {
        if (req.body.markerType != 'LINK')
            if (!req.files.markerImg) {
                if (req.files.markerRef) {
                    s3.deleteObject({
                        Bucket: commonConstants.S3_BUCKET_NAME,
                        Key: req.files.markerRef[0].key
                    }, function (err, data) {})
                }
                return response.error(res, "Please upload marker image");
            } else if (!req.files.markerRef) {
            if (req.files.markerImg) {
                s3.deleteObject({
                    Bucket: commonConstants.S3_BUCKET_NAME,
                    Key: req.files.markerImg[0].key
                }, function (err, data) {})
            }
            return response.error(res, "Please upload marker reference");
        }

        if (err instanceof multer.MulterError)
            return response.error(res, err.message);
        else if (err)
            return response.error(res, err.message);
        return next();
    })
}, function (req, res, next) {
    MarkerController().createMarker(req, res);
});

router.post('/getMarkers', authGaurd.authenticatePrivate, function (req, res, next) {
    MarkerController().getMarkers(req, res);
});

module.exports = router;
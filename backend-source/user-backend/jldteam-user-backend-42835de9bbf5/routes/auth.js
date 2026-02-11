var express = require('express');
var router = express.Router();
const AuthController = require('../controllers/AuthController');
const authGaurd = require('../middleware/authGaurd');

const keys = require('../config/keys');
const commonConstants = require('../constants/commonConstants').commonConstants;
var path = require('path');
const response = require('../helper/response');


const multerS3 = require('multer-s3');
const multer = require('multer');
const aws = require('aws-sdk');
aws.config.update((process.env.NODE_ENV == 'production') ? keys.awsConfigsProd : keys.awsConfigs);
const s3 = new aws.S3();



var s3Storage = multerS3({
  s3: s3,
  bucket: commonConstants.S3_BUCKET_NAME,
  contentType: multerS3.AUTO_CONTENT_TYPE,
  key: function (req, file, cb) {
    var userId = req.user.data.user_id;
    var filePath = "user_data/" + userId + "/profile_pic/";
    var fileNameWithPath = filePath + "user_" + userId + "_" + Date.now() + path.extname(file.originalname);
    cb(null, fileNameWithPath);
  },
  acl: 'public-read',
});

var upload = multer({
  limits: {
    fileSize: (1024 * 1024) * 10
  }, // 1024 Bytes = 1KB, File size restricted to 10MB
  storage: s3Storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype == "image/jpeg" || file.mimetype == "image/png" || file.mimetype == "image/jpg")
      cb(null, true);
    else
      return cb(new Error('Only .png, .jpg, .jpeg format allowed for profile pic'), false);
  }
}).single("profilePic");

router.get('/', function (req, res, next) {
  res.send('Invalid Path');
});


router.post('/register', function (req, res, next) {
  AuthController().register(req, res);
});
/**user login */
router.post('/login', function (req, res, next) {
  AuthController().login(req, res);
});
/**Outlet Users login */
router.post('/outletUserLogin', function (req, res, next) {
  AuthController().outletUserLogin(req, res);
});
router.post('/resetPassword', authGaurd.authenticatePrivate, function (req, res, next) {
  AuthController().resetPassword(req, res);
});

router.post('/updateProfile', authGaurd.authenticatePrivate, function (req, res, next) {
  AuthController().updateProfile(req, res);
});
/**uploading new user profile image */
router.post('/updateImage', authGaurd.authenticatePrivate, function (req, res, next) {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError)
      return response.error(res, err.message);
    else if (err)
      return response.error(res, err.message);
    return next();
  })
}, function (req, res, next) {
  AuthController().updateImage(req, res);
});

router.get('/verifyEmail/:code', function (req, res, next) {
  AuthController().verifyEmail(req, res);
});
router.get('/refreshToken', function (req, res, next) {
  AuthController().refreshToken(req, res);
});
router.get('/logout', authGaurd.authenticatePrivate, function (req, res, next) {
  AuthController().logout(req, res);
});
/**Sending verification code on email */
router.post('/sendCode', function (req, res, next) {
  AuthController().sendCode(req, res);
})
/**#verify and reset new password */
router.post('/verifyAndResetPassword', function (req, res, next) {
  AuthController().verifyAndResetPassword(req, res);
})


module.exports = router;
var express = require('express');
var router = express.Router();
const AuthController = require('../controllers/AuthController');
const authGaurd = require('../middleware/authGaurd');

/** Library */
const multer = require('multer');
const path = require('path');


/** File upload module */
const storage = multer.diskStorage({
    destination: (req, file, cb) => {


        cb(null, path.join(__dirname, '../public/models/images/brands/'));
    },
    filename: (req, file, cb) => {
        const fileName = file.originalname.split('.');
        const type = fileName[1];
        cb(null, `brand-${Date.now()}.${type}`);
    }
});


const upload = multer({
    fileFilter: (req, file, cb) => {

        const mimetype = String(file.mimetype).trim();

        if (mimetype === 'image/png' || mimetype === 'image/jpg' || mimetype === 'image/jpeg') {
            cb(null, true);

        } else {
            req.fileValidationError = 'goes wrong on the mimetype';
            return cb(null, false, new Error('goes wrong on the mimetype'));
        }

    },
    storage: storage
});





var aws = require('aws-sdk')


var multerS3 = require('multer-s3')

var app = express()


aws.config.update({
    accessKeyId: `${process.env.S3_BUCKET_ACCESS_KEY}`,
    secretAccessKey: `${process.env.S3_BUCKET_SECRET_KEY}`,
    region: `${process.env.S3_BUCKET_REGION}`


});
// ACCESS_KEY=
// SECRET_KEY=BLerBznjOgrwFxjp30awSag+6RqppddCp1zp7f3B
// REGION=ap-southeast-1



var s3 = new aws.S3();


var uploads = multer({
    storage: multerS3({
        s3: s3,
        bucket: `${process.env.S3_BUCKET_NAME}`,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        acl: 'public-read',
        metadata: function(req, file, cb) {




            cb(null, { fieldName: file.fieldname });

        },
        fileFilter: function(req, file, cb) {





            if (file.mimetype !== 'image/png' || file.mimetype !== 'image/gif' || file.mimetype !== 'image/jpeg') {
                req.fileValidationError = 'goes wrong on the mimetype';
                // return cb(new Error('Only jpg,jpeg and png are allowed'))
                return cb(null, false, new Error('goes wrong on the mimetype'));


            } else {
                cb(null, { fieldName: file.fieldname });
            }



        },



        key: function(req, file, cb) {

            const body = JSON.parse(req.body.createBrand);

            var user_id = body.user_id

            //   console.log(user_id + '--- userid on brand creation-----------')

            const fileName = file.originalname.split('.');
            const type = fileName[1];

            var filepath = 'merchant-data/' + user_id + '/brand/brand-' + Date.now().toString() + '.' + type;

            req.filepath = filepath

            //console.log(filepath + '--- file path on brand creation-----------')

            //  var filepath='/coupons/'+Date.now().toString();

            cb(null, filepath)
        }
    })
})















var updateuploads = multer({
    storage: multerS3({
        s3: s3,
        bucket: `${process.env.S3_BUCKET_NAME}`,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        acl: 'public-read',
        metadata: function(req, file, cb) {

            req.fileexist = false

            if (file) {
                req.fileexist = true

            }


            cb(null, { fieldName: file.fieldname });

        },
        fileFilter: function(req, file, cb) {





            if (file.mimetype !== 'image/png' || file.mimetype !== 'image/gif' || file.mimetype !== 'image/jpeg') {
                req.fileValidationError = 'goes wrong on the mimetype';
                // return cb(new Error('Only jpg,jpeg and png are allowed'))
                return cb(null, false, new Error('goes wrong on the mimetype'));


            } else {
                cb(null, { fieldName: file.fieldname });
            }



        },



        key: function(req, file, cb) {
            const { user } = req;

            var user_id = user.data.user_id




            const fileName = file.originalname.split('.');
            const type = fileName[1];

            var filepath = 'merchant-data/' + user_id + '/brand/brand-' + Date.now().toString() + '.' + type;

            req.filepath = filepath

            //  var filepath='/coupons/'+Date.now().toString();

            cb(null, filepath)
        }
    })
})



router.get('/', function(req, res, next) {
    res.send('Invalid Path');
});


router.post('/register', function(req, res, next) {
    AuthController().register(req, res);
});
// router.post('/createbrand',upload.single('brand_logo'), function (req, res, next) {
//   AuthController().brandcreation(req, res);
// });
router.post('/createbrand', uploads.single('brand_logo'), function(req, res, next) {
    AuthController().brandcreation(req, res);
});

router.post('/updatebrand', authGaurd.authenticatePrivate, updateuploads.single('brand_logo'), function(req, res, next) {
    AuthController().brandupdate(req, res);
});


router.post('/login', function(req, res, next) {
    AuthController().login(req, res);
});

router.post('/loadprofile', authGaurd.authenticatePrivate, function(req, res, next) {
    AuthController().loadprofile(req, res);
});

router.post('/resetPassword', authGaurd.authenticatePrivate, function(req, res, next) {
    AuthController().resetPassword(req, res);
});

router.post('/updateProfile', authGaurd.authenticatePrivate, upload.single('file'), function(req, res, next) {
    AuthController().updateProfile(req, res);
});

router.get('/verifyEmail/:code', function(req, res, next) {
    AuthController().verifyEmail(req, res);
});

router.post('/createOutletUser', authGaurd.authenticatePrivate, function(req, res, next) {
    AuthController().createOutletUser(req, res);
});
/**Sending verification code on email */
router.post('/forgotpassSendCode', function(req, res, next) {
    AuthController().sendCodeforgotpassword(req, res);
});


/**change password Sending verification code on email */
router.post('/changepassSendCode', authGaurd.authenticatePrivate, function(req, res, next) {
    AuthController().sendCodechangepassword(req, res);
});

/**#verify and reset new password  change password*/
router.post('/changepassResetPassword', authGaurd.authenticatePrivate, function(req, res, next) {
    AuthController().verifyAndResetchangePassword(req, res);
});


/**#verify and reset new password forgot password */
router.post('/verifyAndResetPassword', function(req, res, next) {
    AuthController().verifyAndResetforgotPassword(req, res);
});

router.get('/logout', authGaurd.authenticatePrivate, function(req, res, next) {
    AuthController().logout(req, res);
});
module.exports = router;
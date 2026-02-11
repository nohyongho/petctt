var express = require('express');
var router = express.Router();
const CouponController = require('../controllers/CouponController');
const authGaurd = require('../middleware/authGaurd');



/** Library */
const multer = require('multer');
const path = require('path');

/** File upload module */
const storage = multer.diskStorage({
    destination: (req, file, cb) => {


        cb(null, path.join(__dirname, '../public/models/images/coupons/'));
    },
    filename: (req, file, cb) => {
        const fileName = file.originalname.split('.');
        const type = fileName[1];
        cb(null, `coupon-${Date.now()}.${type}`);
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


// aws.config.update({
//     accessKeyId: 'AKIAVFG2AEMURH7AUEVX',
//     secretAccessKey: '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',
//     region: 'ap-northeast-2'


// });



// aws.config.update({
//     accessKeyId: process.env.S3_BUCKET_ACCESS_KEY,
//     secretAccessKey: process.env.S3_BUCKET_SECRET_KEY,
//     region: process.env.S3_BUCKET_REGION


// });



var s3 = new aws.S3();






var uploads = multer({
    storage: multerS3({
        s3: s3,
        bucket: `${process.env.S3_BUCKET_NAME}`,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        acl: 'public-read',
        metadata: function(req, file, cb) {



            // console.log(`${process.env.ACCESS_KEY}`)
            // console.log(process.env.S3_BUCKET_NAME)

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


            const fileName = file.originalname.split('.');
            const type = fileName[1];

            var filepath = 'merchant-data/' + user.data.user_id + '/coupons/coupon-' + Date.now().toString() + '.' + type;

            req.filepath = filepath

            //  var filepath='/coupons/'+Date.now().toString();

            cb(null, filepath)
        }
    })
})






















router.get('/', function(req, res, next) {
    res.send('Invalid Path');
});

router.post('/getCoupons', authGaurd.authenticatePrivate, function(req, res, next) {
    CouponController().getCoupons(req, res);
});

router.post('/collectCoupon', authGaurd.authenticatePrivate, function(req, res, next) {
    CouponController().collectCoupon(req, res);
});

router.post('/getCollectedCouponHistory', authGaurd.authenticatePrivate, function(req, res, next) {
    CouponController().getCollectedCouponHistory(req, res);
});

router.get('/getCategories', function(req, res, next) {
    CouponController().getCategories(req, res);
});


router.get('/getBrandByCategoryId/:categoryId', function(req, res, next) {
    CouponController().getBrandByCategoryId(req, res);
});


router.post('/allCouponList', authGaurd.authenticatePrivate, function(req, res, next) {
    CouponController().allCouponList(req, res);
});
router.post('/CouponHistory', authGaurd.authenticatePrivate, function(req, res, next) {
    CouponController().CouponHistory(req, res);
});



router.post('/createCoupon', authGaurd.authenticatePrivate, uploads.single('coupon_image'), function(req, res, next) {
    CouponController().createCoupon(req, res);
});

router.post('/updateCoupon', authGaurd.authenticatePrivate, uploads.single('coupon_image'), function(req, res, next) {
    CouponController().updateCoupon(req, res);
});


router.post('/deleteCoupon', authGaurd.authenticatePrivate, function(req, res, next) {
    CouponController().deletecoupon(req, res);
});

router.post('/redeemCoupon', authGaurd.authenticatePrivate, function(req, res, next) {
    CouponController().redeemCoupon(req, res);
});



router.get('/getCouponDetail/:id', authGaurd.authenticatePrivate, function(req, res, next) {
    CouponController().getCouponDetail(req, res);
});

router.get('/activeCouponSummary', authGaurd.authenticatePrivate, function(req, res, next) {
    CouponController().activeCouponSummary(req, res);
});


router.post('/s3uploadimage', authGaurd.authenticatePrivate, uploads.single('testimage'), function(req, res, next) {

    CouponController().tests3image(req, res);
    //   return res.send({
    //     status: false,
    //     statusCode: 409,

    // });

});

module.exports = router;
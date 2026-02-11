var express = require('express');
var router = express.Router();
const ProductsController = require('../controllers/ProductsController');
const authGaurd = require('../middleware/authGaurd');
//const response = require('../helper/response');

/** Library */
const multer = require('multer');
const path = require('path');

/** File upload module */
const storage = multer.diskStorage({
    destination: (req, file, cb) => {


        cb(null, path.join(__dirname, '../public/models/images/products/'));
    },
    filename: (req, file, cb) => {
        const fileName = file.originalname.split('.');
        const type = fileName[1];
        cb(null, `product-${Date.now()}.${type}`);
    }
});


const upload = multer({
    fileFilter: (req, file, cb) => {

        const mimetype = String(file.mimetype).trim();

        if (mimetype === 'image/png' || mimetype === 'image/jpg' || mimetype === 'image/jpeg') {
            cb(null, true);

        } else {
            // return response.error( "Only PNG, JPG and JPEG images are allowed");
            req.fileValidationError = ' wrong on the mimetype';
            req.wrongfile = true;
            return cb(null, false);
            // return cb( new Error('goes wrong on the mimetype'));
        }

    },
    storage: storage
});



var aws = require('aws-sdk')


var multerS3 = require('multer-s3')

var app = express()


// aws.config.update({
//   accessKeyId: `${process.env.ACCESS_KEY}`,
//    secretAccessKey: `${process.env.SECRET_KEY}`,
//    region: `${process.env.REGION}`


// });


// aws.config.update({
//     accessKeyId: 'AKIARJHRNHHLSZE5U23U',
//     secretAccessKey: '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',
//     region: 'ap-southeast-1'


// });

aws.config.update({
    accessKeyId: `${process.env.S3_BUCKET_ACCESS_KEY}`,
    secretAccessKey: `${process.env.S3_BUCKET_SECRET_KEY}`,
    region: `${process.env.S3_BUCKET_REGION}`


});


var s3 = new aws.S3();





var uploads = multer({
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

            // console.log(file.mimetype)
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

            var filepath = 'merchant-data/' + user.data.user_id + '/products/product-' + Date.now().toString() + '.' + type;

            req.filepath = filepath

            //  var filepath='/coupons/'+Date.now().toString();

            cb(null, filepath)
        }
    })
})


















/* Create Merchant's Product. */
router.post('/createProduct', authGaurd.authenticatePrivate, uploads.single('image'), function(req, res, next) {
    //req.setHeader("Content-Type", "application/x-www-form-urlencoded");

    ProductsController().createProduct(req, res);
});



/* Update Merchant's Product. */
router.post('/updateProduct', authGaurd.authenticatePrivate, uploads.single('image'), function(req, res, next) {
    //req.setHeader("Content-Type", "application/x-www-form-urlencoded");


    ProductsController().updateproduct(req, res);
});

/* GET Merchant's product listing. */
router.post('/merchantProductList', authGaurd.authenticatePrivate, function(req, res, next) {
    ProductsController().merchantProductList(req, res);
});
/* GET Merchant's product listing. */
router.post('/outletProductList', authGaurd.authenticatePrivate, function(req, res, next) {
    ProductsController().outletProductList(req, res);
});


/* Delete Merchant's Product. */
router.post('/deleteProduct', authGaurd.authenticatePrivate, function(req, res, next) {
    //req.setHeader("Content-Type", "application/x-www-form-urlencoded");


    ProductsController().deleteproduct(req, res);
});







module.exports = router;
var express = require('express');
var router = express.Router();
const OutletController = require('../controllers/OutletController');
const authGaurd = require('../middleware/authGaurd');



/** Library */
const multer = require('multer');
const path = require('path');


var aws = require('aws-sdk')


var multerS3 = require('multer-s3')

var app = express()

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

            var filepath = 'merchant-data/' + user.data.user_id + '/outlets/outlet-' + Date.now().toString() + '.' + type;

            req.filepath = filepath

            //  var filepath='/coupons/'+Date.now().toString();

            cb(null, filepath)
        }
    })
})





/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('Try another route');
});

/* GET users listing. */
router.post('/allOutletList', authGaurd.authenticatePrivate, function(req, res, next) {
    OutletController().allOutletList(req, res);
});

/* Create Outlet */
router.post('/createOutlet', authGaurd.authenticatePrivate, uploads.single('image'), function(req, res, next) {

    OutletController().createOutlet(req, res);
});


/* Update Outlet */
router.post('/updateOutlet', authGaurd.authenticatePrivate, uploads.single('image'), function(req, res, next) {

    OutletController().updateoutlet(req, res);
});


/* delte Outlet */
router.post('/delteOutlet', authGaurd.authenticatePrivate, function(req, res, next) {

    OutletController().deleteoutlet(req, res);
});




module.exports = router;
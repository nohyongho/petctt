var express = require('express');
var router = express.Router();
const CommonController = require('../controllers/CommonController');
const authGaurd = require('../middleware/authGaurd');


/** Library */
const multer = require('multer');
const path = require('path');

/** File upload module */
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {


//         cb(null, path.join(__dirname, '../public/models/images/categories/'));
//     },
//     filename: (req, file, cb) => {
//         const fileName = file.originalname.split('.');
//         const type = fileName[1];
//         cb(null, `cat-${Date.now()}.${type}`);
//     }
// });


// const upload = multer({
//     fileFilter: (req, file, cb) => {

//         const mimetype = String(file.mimetype).trim();

//         if (mimetype === 'image/png' || mimetype === 'image/jpg' || mimetype === 'image/jpeg') {
//             cb(null, true);

//         } else {
//             req.fileValidationError = 'goes wrong on the mimetype';
//             return cb(null, false, new Error('goes wrong on the mimetype'));
//         }

//     },
//     storage: storage
// });


var aws = require('aws-sdk')
var multerS3 = require('multer-s3')
var app = express()


/* S3 bucket upload  */
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
        metadata: function(req, files, cb) {

            req.fileexist = false


            // if (files) {
            //     req.fileexist = true

            // }
            // console.log(req.files)

            cb(null, { fieldName: files.fieldname });
        },
        fileFilter: function(req, file, cb) {

            var allowedMimes = ['image/jpeg', 'image/pjpeg', 'image/png', 'image/gif', 'image/jpg'];

            if (_.includes(allowedMimes, file.mimetype)) {
                // allow supported image files
                cb(null, true);
            } else {
                // throw error for invalid files
                cb(new Error('Invalid file type. Only jpg, png and gif image files are allowed.'));
            }
        },
        key: function(req, files, cb) {
            const { user } = req;



            // req.fileimage = false
            // req.filevideo = false



            if (files.fieldname == "image") {
                req.fileimage = true

                const fileName = files.originalname.split('.');
                const type = fileName[1];
                var filepath = 'ads/' + user.data.user_id + '/ad-' + Date.now().toString() + '.' + type;
                req.imagefilepath = filepath



            }
            if (files.fieldname == "video") {
                req.filevideo = true
                const fileName = files.originalname.split('.');
                const type = fileName[1];
                var filepath = 'ads/' + user.data.user_id + '/ad-' + Date.now().toString() + '.' + type;

                req.videofilepath = filepath


            }


            //  var filepath='/coupons/'+Date.now().toString();
            cb(null, filepath)
        }
    })
})

var cpUpload = uploads.fields([{ name: 'video', maxCount: 1 }, { name: 'image', maxCount: 1 }])
    //var s3 = new aws.S3();
var uploadsubcat = multer({
    storage: multerS3({
        s3: s3,
        bucket: `${process.env.S3_BUCKET_NAME}`,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        acl: 'public-read',
        metadata: function(req, files, cb) {

            req.fileexist = false


            // if (files) {
            //     req.fileexist = true

            // }
            // console.log(req.files)

            cb(null, { fieldName: files.fieldname });
        },
        fileFilter: function(req, file, cb) {

            var allowedMimes = ['image/jpeg', 'image/pjpeg', 'image/png', 'image/gif', 'image/jpg'];

            if (_.includes(allowedMimes, file.mimetype)) {
                // allow supported image files
                cb(null, true);
            } else {
                // throw error for invalid files
                cb(new Error('Invalid file type. Only jpg, png and gif image files are allowed.'));
            }
        },
        key: function(req, files, cb) {
            const { user } = req;



            // req.fileimage = false
            // req.filevideo = false



            req.fileimage = true

            const fileName = files.originalname.split('.');
            const type = fileName[1];
            var filepath = 'categories/subcat-' + Date.now().toString() + '.' + type;
            req.imagefilepath = filepath






            //  var filepath='/coupons/'+Date.now().toString();
            cb(null, filepath)
        }
    })
})


/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('Try another route');
});

router.post('/createad', authGaurd.authenticatePrivate, cpUpload, function(req, res, next) {
    CommonController().createads(req, res);
});

/** Edit ad  */

router.post('/editad', authGaurd.authenticatePrivate, cpUpload, function(req, res, next) {
    CommonController().editads(req, res);
});
/* Pause ad */
router.post('/pauseAd', authGaurd.authenticatePrivate, function(req, res, next) {
    CommonController().pauseAd(req, res);
});


/* Delete ad */
router.post('/deletead', authGaurd.authenticatePrivate, function(req, res, next) {
    //req.setHeader("Content-Type", "application/x-www-form-urlencoded");


    CommonController().deletead(req, res);
});


/** GET config price list  */
router.get('/adpricelist', authGaurd.authenticatePrivate, function(req, res, next) {
    CommonController().priceperviewList(req, res);
});


/** GET ads list  */
router.get('/adsList', authGaurd.authenticatePrivate, function(req, res, next) {
    CommonController().adsList(req, res);
});

router.post('/generatecryptoaddress', function(req, res, next) {
    CommonController().generatecryptoaddress(req, res);
});

router.post('/createSubCategory', authGaurd.authenticatePrivate, uploadsubcat.single('subcat_image'), function(req, res, next) {
    CommonController().createSubCategory(req, res);
});

router.get('/getCountryList', function(req, res, next) {
    CommonController().getCountryList(req, res);
});

/** GET states list  */
router.get('/statesList/:countryId', authGaurd.authenticatePrivate, function(req, res, next) {
    CommonController().statesList(req, res);
});

/**Get cities List */
// router.get('/citiesList/:stateId', authGaurd.authenticatePrivate, function (req, res, next) {
//     CommonController().citiesList(req, res);
// });
router.get('/citiesList/:countryId', authGaurd.authenticatePrivate, function(req, res, next) {
    CommonController().citiesList(req, res);
});

/* GET users listing. */
router.get('/allOnDashboard', authGaurd.authenticatePrivate, function(req, res, next) {
    CommonController().allOnDashboard(req, res);
});

/* GET users listing. */
router.get('/collectedCouponsCountry', authGaurd.authenticatePrivate, function(req, res, next) {
    CommonController().collectedCouponsCountry(req, res);
});

/* GET users listing. */
router.get('/countryStateCities', authGaurd.authenticatePrivate, function(req, res, next) {
    CommonController().countryStateCities(req, res);
});

/* GET users brand listing. */
router.get('/getMyBrand', authGaurd.authenticatePrivate, function(req, res, next) {
    CommonController().getMyBrand(req, res);
});

/* GET getCategories listing. */
router.get('/getCategories', function(req, res, next) {
    CommonController().getCategories(req, res);
});

/* GET getsubCategories listing. */
router.post('/getsubCategories', authGaurd.authenticatePrivate, function(req, res, next) {
    CommonController().getsubCategories(req, res);
});

/* GET getsubCategories listing for products creation against a brand id */
router.get('/getsubCategoriesProduct', authGaurd.authenticatePrivate, function(req, res, next) {
    CommonController().getsubCategoriesProduct(req, res);
});


/* GET Product types */
router.get('/getProductTypes', function(req, res, next) {
    CommonController().getProductTypes(req, res);
});



/* GET getCurrencies listing. */
router.get('/getCurrencies', authGaurd.authenticatePrivate, function(req, res, next) {
    CommonController().getCurrencies(req, res);
});


/* GET getOutlets listing. */
router.get('/getOutlets', authGaurd.authenticatePrivate, function(req, res, next) {
    CommonController().getOutlets(req, res);
});

/* GET visitorsCountryMap listing. */
router.get('/visitorsCountryMap', authGaurd.authenticatePrivate, function(req, res, next) {
    CommonController().visitorsCountryMap(req, res);
});

/* GET pieChartCouponStatus listing. */
router.get('/pieChartCouponStatus', authGaurd.authenticatePrivate, function(req, res, next) {
    CommonController().pieChartCouponStatus(req, res);
});

/* GET pieChartCouponCategory listing. */
router.get('/pieChartCouponCategory', authGaurd.authenticatePrivate, function(req, res, next) {
    CommonController().pieChartCouponCategory(req, res);
});

/* GET categoriesByBrandId listing. */
router.get('/categoriesByBrandId/:brandId', authGaurd.authenticatePrivate, function(req, res, next) {

    CommonController().categoriesByBrandId(req, res);
});

/* GET categoriesByBrandIdUser listing. */
router.get('/categoriesByBrandIdUser', authGaurd.authenticatePrivate, function(req, res, next) {
    CommonController().categoriesByBrandIdUser(req, res);
});



/* GET accountsDetail listing. */
router.get('/accountsDetail', authGaurd.authenticatePrivate, function(req, res, next) {
    CommonController().accountsDetail(req, res);
});
/* GET adminDashboardSummary listing. */
router.get('/adminDashboardSummary', function(req, res, next) {
    CommonController().adminDashboardSummary(req, res);
});

/* GET redeemedCouponDetail listing. */
router.post('/redeemedCouponDetail', authGaurd.authenticatePrivate, function(req, res, next) {
    CommonController().redeemedCouponDetail(req, res);
});

router.post('/sendsupportemail', function(req, res, next) {
    CommonController().supportemail(req, res);
});






module.exports = router;
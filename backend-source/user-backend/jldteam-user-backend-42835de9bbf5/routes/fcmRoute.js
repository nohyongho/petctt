var express = require('express');
var router = express.Router();
const FcmController = require('../controllers/FcmController');
const authGaurd = require('../middleware/authGaurd')


/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('Try another route');
});
/**change user password route */
router.post('/updateFcm', function (req, res, next) {
  FcmController().updateFcm(req, res);
});

router.post('/updateFcmLoggedIn', authGaurd.authenticatePrivate, function (req, res) {
  FcmController().updateFcmLoggedIn(req, res);
});

module.exports = router;
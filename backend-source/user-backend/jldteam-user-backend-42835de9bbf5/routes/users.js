var express = require('express');
var router = express.Router();
const UserController = require('../controllers/UserController');
const authGaurd = require('../middleware/authGaurd')


/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('Try another route');
});
/**change user password route */
router.post('/changePassword', authGaurd.authenticatePrivate, function (req, res, next) {
  UserController().changePassword(req, res);
});

router.post('/getContacts', function (req, res) {
  UserController().getContacts(req, res);
});

module.exports = router;

var express = require('express');
var router = express.Router();
const UserController = require('../controllers/UserController');
const authGaurd = require('../middleware/authGaurd');


router.get('/', function(req, res, next) {
    res.send('Try another route');
});


router.post('/allUsersList', authGaurd.authenticatePrivate, function(req, res) {
    UserController().allUsersList(req, res);
})

router.post('/searchUsers', authGaurd.authenticatePrivate, function(req, res) {
    UserController().searchUsers(req, res);
})

router.post('/filterUsers', authGaurd.authenticatePrivate, function(req, res) {
    UserController().filterUsers(req, res);
});

router.get('/userDetail/:id', authGaurd.authenticatePrivate, function(req, res) {

    UserController().userDetail(req, res);
})

router.post('/updateUserStatus', authGaurd.authenticatePrivate, function(req, res) {
    UserController().updateUserStatus(req, res);
})

router.post('/outletUsersList', authGaurd.authenticatePrivate, function(req, res) {
    UserController().outletUsersList(req, res);
})

module.exports = router;
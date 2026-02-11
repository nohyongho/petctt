const express = require('express');
const router = express.Router();

const CampaignController = require('../controllers/CampaignController');
const authGaurd = require('../middleware/authGaurd');



/**createCampaign route with authentication */
router.post ('/createCampaign', authGaurd.authenticatePrivate, function (req, res) {
    CampaignController().createCampaign(req,res);
})
router.get ('/getCategories', function (req,res) {
    CampaignController().getCategories(req,res);
})
router.post('/allCampaignList', authGaurd.authenticatePrivate, function (req,res) {
    CampaignController().allCampaignList(req,res);
})

router.post('/test', function (req,res) {
    CampaignController().test(req,res);
})

module.exports = router;
/** Model */
const Campaign = require('../models/Campaign');
const Categories = require('../models/CouponCategory');
/** Helpers */
const response = require('../helper/response');
const constant = require('../constants/ConstantMessages');
const validate = require('../helper/validators/CampaignValidator');
const AWS = require('aws-sdk')
const imageUploderService = require('../services/imageUpload.service');

const CampaignController = () => {
    /**Creating new Campaign and upload ampaign on AWS S3 Bucket */
    const createCampaign = async(req, res) => {
            try {
                let body = req.body;
                let bodyResposnse = validate.createCampaign(req.body);
                if (bodyResposnse.status === false) {
                    return response.error(res, bodyResposnse.msg);
                }
                let image = req.body.image;
                /** uploading profile image */
                let base64Image = buf = new Buffer(image.replace(/^data:image\/\w+;base64,/, ""), 'base64');
                const type = image.split(';')[0].split('/')[1];
                AWS.config.update({
                    accessKeyId: `${process.env.ACCESS_KEY}`,
                    secretAccessKey: `${process.env.SECRET_KEY}`,
                    region: `${process.env.REGION}`
                });
                /**Creating new object and intializing Params */
                let s3 = new AWS.S3({ params: { Bucket: 'coupontalktalk/api/campaigns' } });
                let params = {
                    Key: `${Date.now()}`,
                    Body: base64Image,
                    ACL: 'public-read',
                    ContentEncoding: 'base64',
                    ContentType: 'image/' + type,
                };
                /**This Function for uploading Image on S3 Bucket */
                s3.upload(params, body, async function(err, data) {
                    if (err) {
                        return response.error(res, err.message)
                    } else {
                        let createResponse = await Campaign.create({
                            name: body.name,
                            start_date: body.startDate,
                            end_date: body.endDate,
                            status: body.status,
                            description: body.description,
                            image: data.Location,
                            brand_id: body.brandId,
                            country_id: body.countryId
                        });
                        if (createResponse) {
                            return response.successMsg(res, constant.SUCCESS);
                        } else {
                            return response.error(res, constant.SERVER_ERROR)
                        }
                    }
                });


            } catch (error) {

                return response.error(res, error.message);
            }
        }
        /** getting all categories list for campaign  */
    const getCategories = async(req, res) => {
            try {
                let categoryList = await Categories.findAll({ attributes: ['id', 'category_name'] });
                return response.success(res, constant.SUCCESS, categoryList)
            } catch (error) {
                return response.error(res, error.message)
            }
        }
        /**All Campaign list on the basis of different types like ( all, started, stopped, expired, paused, pending ) */
    const allCampaignList = async(req, res) => {
        try {
            const { type, status, orderBy, order, limit, offSet } = req.body;
            const bodyResposnse = validate.campaignList(req.body);
            if (bodyResposnse.status === false) {
                return response.error(res, bodyResposnse.msg);
            }
            let campaigns;
            /**all Campaigns list */
            if (type === 'all') {
                campaigns = await Campaign.findAndCountAll({
                    order: [
                        [orderBy, order]
                    ],
                    limit: parseInt(limit),
                    offset: parseInt(offSet),
                });
            }
            /**all started, stopped, paused, expired or Pending campaign list  */
            else if (type === 'other') {
                campaigns = await Campaign.findAndCountAll({
                    where: { status: status },
                    order: [
                        [orderBy, order]
                    ],
                    limit: parseInt(limit),
                    offset: parseInt(offSet),
                });
            }

            let totalCampaigns = campaigns.count;
            campaigns = campaigns.rows
            return response.success(res, constant.SUCCESS, { totalCampaigns, campaigns })

        } catch (error) {

            return response.error(res, error.message)
        }

    }
    const test = async(req, res) => {
        const responseData = await imageUploderService.upload(req.body.image, 'brand-images')


    }
    return {
        createCampaign,
        getCategories,
        allCampaignList,
        test
    };
};

module.exports = CampaignController;
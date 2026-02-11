/** Model */
const User = require('../models/User');
const Markers = require('../models/ARM_Markers');


/** Helpers */
const response = require('../helper/response');
const JOI = require('joi');
const sequelize = require('../config/database');
const Sequelize = require('sequelize');
const Utility = require('../helper/Utility');
const keys = require('../config/keys');
const commonConstants = require('../constants/commonConstants').commonConstants;
const aws = require('aws-sdk');
aws.config.update((process.env.NODE_ENV == 'production') ? keys.awsConfigsProd : keys.awsConfigs);
const s3 = new aws.S3();

const MarkerController = () => {

    const createMarker = async (req, res) => {

        try {
            const user = req.user;
            const body = req.body;

            const JoiResponse = JOI.validate(body, {
                catId: JOI.number().integer().min(1).optional(),
                title: JOI.string().min(1).max(100).required(),
                detail: JOI.string().min(1).max(200).allow('').optional(),
                link: JOI.string().uri().trim().allow('').optional(),
                markerType: JOI.string().valid('IMAGE', 'VIDEO', 'LINK'),
            });

            body.userId = user.data.user_id;

            if (JoiResponse.error) {
                return response.error(res, JoiResponse.error.details[0].message);
            }

            if (req.body.markerType != 'LINK') {
                body.markerImgUrl = req.files.markerImg[0].key;
                body.markerRefUrl = req.files.markerRef[0].key;
            }

            body.validTill = new Date().setDate(new Date().getDate() + 7);

            var marker = await Markers.create(body);
            if (!marker) {
                deleteMarkersFromS3Bucket(req);
                return response.error(res, "Error in creating marker, please try later. Error ECM0045");
            }
            return response.successOther(res, "Success", marker.markerId);

        } catch (error) {
            console.error('Error::', error);
            deleteMarkersFromS3Bucket(req);
            return response.error(res, error.message);
        }

    };

    const getMarkers = async (req, res) => {
        try {
            const user = req.user;
            const body = req.body;

            const JoiResponse = JOI.validate(body, {});

            if (JoiResponse.error) {
                return response.error(res, JoiResponse.error.details[0].message);
            }
            body.userId = user.data.user_id;

            Markers.findAll({
                    where: {
                        userId: body.userId
                    },
                    attributes: {
                        exclude: ["createdAt", "updatedAt"]
                    }
                }).then((markersList) => response.success(res, "", markersList))
                .catch((err) => {
                    console.log('Error:::', err);
                    return response.error(res, "Error occurred, please try after some time!")
                })

        } catch (error) {
            console.error('Error::', error);
            return response.error(res, error.message);
        }
    }

    return {
        createMarker,
        getMarkers
    };
};

module.exports = MarkerController;

/* 
/ deleting files from s3 bucket in case error occured
/ in calling createMarker api . TAK
/
*/
async function deleteMarkersFromS3Bucket(req) {
    if (req.body.markerType != 'LINK')
        if (!req.files.markerImg) {
            if (req.files.markerRef) {
                s3.deleteObject({
                    Bucket: commonConstants.S3_BUCKET_NAME,
                    Key: req.files.markerRef[0].key
                }, function (err, data) {})
            }
        } else if (!req.files.markerRef) {
        if (req.files.markerImg) {
            s3.deleteObject({
                Bucket: commonConstants.S3_BUCKET_NAME,
                Key: req.files.markerImg[0].key
            }, function (err, data) {})
        }
    }
}
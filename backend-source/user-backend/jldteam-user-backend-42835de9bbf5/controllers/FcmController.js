// models
const Fcm = require('../models/Fcm');
//const User = require('../models/User');
const JOI = require('joi');
const response = require('../helper/response');




const FcmController = () => {

    const updateFcm = async (req, res) => {

        const JoiResponse = JOI.validate(req.body, {
            userFCM: JOI.string().min(3).max(255).required(),
            platform: JOI.string().valid('android', 'ios').required(),
        });

        if (JoiResponse.error) {
            return res.send({
                status: false,
                msg: JoiResponse.error.details[0].message
            });
        }
        const fcmToken = req.body.userFCM;
        const platform = req.body.platform;
        Fcm.create({
            fcm_token: fcmToken,
            platform: platform
        });

        return res.send({
            status: true,
            statusCode: '000',
            msg: 'User FCM saved.',
        });
    }

    const updateFcmLoggedIn = async (req, res) => {
        try {
            const user = req.user;
            const body = req.body;


            const JoiResponse = JOI.validate(body, {
                userFCM: JOI.string().min(3).max(255).required(),
                platform: JOI.string().valid('android', 'ios').required(),
            });

            if (JoiResponse.error) {
                return response.error(res, JoiResponse.error.details[0].message);
            }

            const userId = user.data.user_id;
            const fcmToken = req.body.userFCM;
            const platform = req.body.platform;
            const fcm = await Fcm.findOne({
                where: {
                    user_id: userId,
                    platform: platform
                }
            });

            if (fcm) {
                if (fcm.fcm_token != null && fcm.fcm_token != fcmToken)
                    fcm.update({
                        fcm_token: fcmToken
                    });
            } else
                Fcm.create({
                    user_id: userId,
                    fcm_token: fcmToken,
                    platform: platform
                });

            return response.success(res, "User FCM saved.")

        } catch (error) {
            console.log('Error:::', error);
            return response.error(res, error.message);
        }
    }

    return {
        updateFcm,
        updateFcmLoggedIn,
    }

}

module.exports = FcmController;
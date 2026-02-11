const keys = require('../config/keys');
const AWS = require('aws-sdk');
AWS.config.update((process.env.NODE_ENV == 'production') ? keys.awsConfigsProd : keys.awsConfigs);

const response = require('../helper/response');
const commonConstants = require('../constants/commonConstants').commonConstants;


module.exports = {
    upload: (image, bucketFolder) => {
        try {
            /** uploading profile image */
            let base64Image = buf = new Buffer(image.replace(/^data:image\/\w+;base64,/, ""), 'base64');
            const type = image.split(';')[0].split('/')[1];
            /**Creating new object and intializing Params */
            let s3 = new AWS.S3({
                params: {
                    Bucket: commonConstants.S3_BUCKET_NAME + '/' + bucketFolder
                }
            });
            let params = {
                Key: `${Date.now()}`,
                Body: base64Image,
                ACL: 'public-read',
                ContentEncoding: 'base64',
                ContentType: 'image/' + type,
            };
            /**This Function for uploading Image on S3 Bucket */
            let responseData = s3.upload(params, function (err, data) {
                if (err) {
                    return response.error(res, err.message);
                } else {
                    return data.Location;
                }
            });
            console.log('Testing is here ;:::', responseData.singlePart.httpRequest.endpoint.host);
            console.log('Testing is here next ;:::', responseData.singlePart.params.Key);
            return `/` + responseData.singlePart.params.Key;

        } catch (error) {
            console.log('Error:', error)
        }
    }
}
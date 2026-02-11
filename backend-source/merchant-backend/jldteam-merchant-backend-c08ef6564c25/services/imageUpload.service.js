const AWS = require('aws-sdk');
const response = require('../helper/response');

module.exports = {
    upload: (image, bucketFolder) => {
        try {
            /** uploading profile image */
            let base64Image = buf = new Buffer(image.replace(/^data:image\/\w+;base64,/, ""), 'base64');
            const type = image.split(';')[0].split('/')[1];
            console.log('Test1:::',process.env.ACCESS_KEY)
            console.log('Test2:::',process.env.SECRET_KEY)
            console.log('Test3:::',process.env.REGION)
            AWS.config.update({
                accessKeyId: `${process.env.ACCESS_KEY}`
                , secretAccessKey: `${process.env.SECRET_KEY}`
                , region: `${process.env.REGION}`
            });
            /**Creating new object and intializing Params */
            let s3 = new AWS.S3({ params: { Bucket: `coupontalktalk/api/${bucketFolder}` } });
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
            return `/`+ responseData.singlePart.params.Key;

        } catch (error) {
            console.log('Error:',error)
        }
    }
}
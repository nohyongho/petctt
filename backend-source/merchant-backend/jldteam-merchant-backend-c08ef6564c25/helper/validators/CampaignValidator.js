const JOI = require('joi');
const validator = require('../JoiValidationResponse');


module.exports = {
   createCampaign: (body) => {
       const response = validator(body, {
           name: JOI.string().min(3).max(100).required(),
           startDate: JOI.string().required(),
           endDate: JOI.string().required(),
           status: JOI.string().required(),
           description: JOI.string().required(),
           image: JOI.string().required(),
           brandId: JOI.number().required(),
           countryId: JOI.number().required()
        })
        return response;
   },
   campaignList: (body) => {
       const response = validator(body, {
           type: JOI.string().required(),
           status:JOI.string().optional().allow(''),
           limit: JOI.number().required(),
           offSet: JOI.number().required(),
           orderBy: JOI.string().required(),
           order: JOI.string().required(),
       });
       return response;
   } 
};
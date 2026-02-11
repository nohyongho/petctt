const JOI = require('joi');
const validator = require('../JoiValidationResponse');


module.exports = {
    createOutlet: (body) => {
        const response = validator(body, {
            outlet_name: JOI.string().min(3).max(100).required(),
            postal_code: JOI.number().required(),
            address: JOI.string().required(),
            phone_number: JOI.string().required(),
            brand_id: JOI.number().required(),
            country_id: JOI.number().required(),
          //  stateId: JOI.number().required(),
          city_id: JOI.number().required(),
          //  area: JOI.number().required(),
            latitude: JOI.number().required(),
            longitude: JOI.number().required(),
           // altitude: JOI.number().required(),
            //timeTable: JOI.array().required(),
            user_id: JOI.number().required(),

        });
        return response;
    },
    outletList: (body) => {
        const response = validator(body, {
            limit: JOI.number().required(),
            page: JOI.number().required(),
        });
        return response;
    }
};
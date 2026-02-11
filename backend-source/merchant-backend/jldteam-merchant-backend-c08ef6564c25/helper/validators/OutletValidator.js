const JOI = require('joi');
const validator = require('../JoiValidationResponse');


module.exports = {
    createOutletvalidate: (body) => {
        const response = validator(body, {
            outlet_name: JOI.string().min(3).max(100).required(),
            postal_code: JOI.string().required(),
            address: JOI.string().required(),
            phone_number: JOI.string().required(),
            brand_id: JOI.number().required(),
            // country_id: JOI.number().required(),
            //  stateId: JOI.number().required(),
            city_id: JOI.number().required(),
            //  area: JOI.number().required(),
            latitude: JOI.number().required(),
            longitude: JOI.number().required(),
            // altitude: JOI.number().required(),
            //timeTable: JOI.array().required(),
            // user_id: JOI.number().required(),
            state_name: JOI.string().optional(),

            street_name: JOI.string().optional(),
            city_name: JOI.string().optional(),

            country_code: JOI.string().required(),
            nearby_couponrange: JOI.string().required(),
            is_countrywide: JOI.optional(),
            opendays: JOI.string().required(),
            timings: JOI.string().required(),





        });
        return response;
    },


    updateoutlet: (body) => {
        const response = validator(body, {
            outlet_id: JOI.number().required(),
            outlet_name: JOI.string().min(3).max(100).required(),
            postal_code: JOI.string().required(),
            address: JOI.string().required(),
            phone_number: JOI.string().required(),
            brand_id: JOI.number().required(),
            // country_id: JOI.number().required(),
            //  stateId: JOI.number().required(),
            city_id: JOI.number().required(),
            //  area: JOI.number().required(),
            latitude: JOI.number().required(),
            longitude: JOI.number().required(),
            // altitude: JOI.number().required(),
            //timeTable: JOI.array().required(),
            // user_id: JOI.number().required(),
            state_name: JOI.string().optional(),

            street_name: JOI.string().optional(),
            city_name: JOI.string().optional(),

            country_code: JOI.string().optional(),
            nearby_couponrange: JOI.string().required(),
            is_countrywide: JOI.optional(),



        });
        return response;
    },



    deleteoutlet: (body) => {
        const response = validator(body, {
            outlet_id: JOI.number().required(),

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
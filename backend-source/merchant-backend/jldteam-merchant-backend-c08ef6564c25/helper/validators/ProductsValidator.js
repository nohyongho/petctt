const JOI = require('joi');
const validator = require('../JoiValidationResponse');


module.exports = {






    createProduct: (body) => {
        const response = validator(body, {
            product_name: JOI.string().min(3).allow(''),
            categories_id: JOI.number().required(),
            // user_id: JOI.number().required(),
            brand_id: JOI.number().required(),
            outlet_id: JOI.number().required(),
            price: JOI.number().required(),
            product_desc: JOI.string().optional().allow(''),
            type_product: JOI.string().optional().allow(''),

        });
        return response;
    },



    updateproduct: (body) => {
        const response = validator(body, {
            product_id: JOI.number().required(),
            product_name: JOI.string().min(3).allow(''),
            category_id: JOI.number().required(),
            // user_id: JOI.number().required(),
            // brand_id: JOI.number().required(),
            outlet_id: JOI.number().required(),
            price: JOI.number().required(),
            product_desc: JOI.string().optional().allow(''),
            type_product: JOI.string().optional().allow(''),

        });
        return response;
    },


    deleteproduct: (body) => {
        const response = validator(body, {
            product_id: JOI.number().required(),

        });
        return response;
    },



    merchantProductList: (body) => {
        const response = validator(body, {
            limit: JOI.number().required(),
            page: JOI.number().required(),
        });
        return response;
    },


    outletProductList: (body) => {

        const response = validator(body, {
            outlet_id: JOI.number().required(),
            limit: JOI.number().required(),
            page: JOI.number().required(),
        });
        return response;


    }






};
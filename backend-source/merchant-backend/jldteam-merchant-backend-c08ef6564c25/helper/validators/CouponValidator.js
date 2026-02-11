const JOI = require('joi');
const validator = require('../JoiValidationResponse');


module.exports = {


    couponsList: (body) => {
        const response = validator(body, {
            limit: JOI.number().required(),
            page: JOI.number().required(),
            outletid: JOI.number().optional(),
            //  type: JOI.string().required(),
            //  status: JOI.string().optional().allow('')
        });
        return response;
    },

    CouponHistory: (body) => {
        const response = validator(body, {
            limit: JOI.number().required(),
            page: JOI.number().required(),
            outlet_id: JOI.number().optional(),
            type: JOI.string().required(),
            //  brand_id: JOI.string().required(),
            //  status: JOI.string().optional().allow('')
        });
        return response;
    },



    redeemedCoupons: (body) => {
        const response = validator(body, {
            limit: JOI.number().required(),
            page: JOI.number().required(),
        });
        return response;
    },
    getCouponsBody: (body) => {
        const response = validator(body, {
            current_lat: JOI.number().required(),
            current_long: JOI.number().required(),
        });
        return response;
    },
    categoriesByBrandId: (body) => {
        const response = validator(body, {
            //   brand_id: JOI.number().required(),

        });
        return response;
    },
    getsubCategoriesProduct: (body) => {
        const response = validator(body, {
            //    brand_id: JOI.number().required(),

        });
        return response;
    },







    collectCouponBody: (body) => {
        const response = validator(body, {
            collected_coupon: JOI.object().keys({
                coupon_id: JOI.number().required(),
                coupon_name: JOI.string().required(),
                coupon_type: JOI.string().required(),
                coupon_image: JOI.string().optional().allow(null),
                brand_id: JOI.number().required(),
                brand_name: JOI.string().required(),
                category_id: JOI.number().required(),
                outlet_id: JOI.number().required(),
                outlet_name: JOI.string().required(),
                coupon_code_id: JOI.number().required(),
                coupon_code: JOI.string().required(),
                hash: JOI.string().required(),
                longitude: JOI.number().required(),
                latitude: JOI.number().required()
            }),
        });
        return response;
    },
    createCouponBody: (body) => {
        const response = validator(body, {
            coupon_name: JOI.string().max(100).required(),
            description: JOI.string().required(),
            total_coupons: JOI.number().required(),

            currency_id: JOI.number().optional(),
            code: JOI.string().allow('').optional(),
            // image: JOI.string().required(),
            brand_id: JOI.number().required(),
            outlet_id: JOI.number().required(),
            percent_off: JOI.number().required(),
            amount: JOI.number().required(),

            radius: JOI.string().required(),
            // type: JOI.string().required(),
            valid_from: JOI.string().required(),
            valid_till: JOI.string().required(),
            per_user: JOI.number().required(),

            outlet_id: JOI.number().required(),
            categories_id: JOI.number().required(),
            maxDiscount: JOI.number().allow('').optional(),
            max_discount: JOI.number().required(),
            type_position: JOI.string().required(),
            design_position: JOI.string().required(),
            location_position: JOI.string().required(),
            is_countrywide: JOI.string().optional().allow(''),





        });
        return response;
    },







    updatecouponBody: (body) => {
        const response = validator(body, {

            coupon_id: JOI.number().required(),
            coupon_name: JOI.string().max(100).required(),
            description: JOI.string().required(),
            total_coupons: JOI.number().required(),

            //coupon_code: JOI.string().required(),

            outlet_id: JOI.number().required(),
            percent_off: JOI.number().required(),
            amount: JOI.number().required(),
            radius: JOI.string().required(),
            // type: JOI.string().required(),
            valid_from: JOI.string().required(),
            valid_till: JOI.string().required(),
            per_user: JOI.number().required(),

            outlet_id: JOI.number().required(),
            category_id: JOI.number().required(),

            max_discount: JOI.number().required(),
            type_position: JOI.string().required(),
            design_position: JOI.string().required(),
            location_position: JOI.string().required(),
            is_countrywide: JOI.string().optional().allow(''),





        });
        return response;
    },





    redeemCoupon: (body) => {
        const response = validator(body, {


            collectedcoupon_id: JOI.number().required(),
            coupon_code: JOI.string().required(),
        });
        return response;
    },



    deletecoupon: (body) => {
        const response = validator(body, {

            coupon_id: JOI.number().required(),




        });
        return response;
    }


};
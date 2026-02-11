const JOI = require('joi');
const validator = require('../../validator');


module.exports = {

    get_coupons_body: (body) => {
        const response = validator(body, {
            type: JOI.string().required(),
            current_lat: JOI.number().required(),
            current_long: JOI.number().required(),
            outletId: JOI.number().allow().optional(),
        });
        return response;
    },
    redeem_body: (body) => {
        const response = validator(body, {
            couponCode: JOI.string().required(),
        });
        return response;
    },
    redeemptionQR_body: (body) => {
        const response = validator(body, {
            couponCode: JOI.string().required(),
            couponId: JOI.number().required(),
            couponHash: JOI.string().optional(),
        });
        return response;
    },
    get_coupons_test_body: (body) => {
        const response = validator(body, {
            current_lat: JOI.number().required(),
            current_long: JOI.number().required(),
            altitude: JOI.number().required(),
        });
        return response;
    },
    getCouponsByOutlet: (body) => {
        const response = validator(body, {
            outletId: JOI.number().required(),
        });
        return response;
    },
    getCouponsByBrand: (body) => {
        const response = validator(body, {
            currentLat: JOI.number().required(),
            currentLong: JOI.number().required(),
            brandId: JOI.number().required(),
        });
        return response;
    },
    collect_coupon_body: (body) => {
        const response = validator(body, {
            coupon_id: JOI.number().required(),
            longitude: JOI.number().required(),
            latitude: JOI.number().required(),
            hash: JOI.string().allow(null).optional(),
            countryIso: JOI.string().allow(null).allow('').max(5).optional(),
            country_id: JOI.number().allow(null).optional(),
            coupon_code: JOI.string().allow(null).optional(),
            coupon_name: JOI.string().allow(null).optional(),
            coupon_type: JOI.string().allow(null).optional(),
            coupon_image: JOI.string().allow(null).optional(),
            brand_id: JOI.number().allow(null).optional(),
            brand_name: JOI.string().allow(null).optional(),
            category_id: JOI.number().allow(null).optional(),
            outlet_id: JOI.number().allow(null).optional(),
            outlet_name: JOI.string().allow(null).optional(),
            coupon_code_id: JOI.number().allow(null).optional(),
        });
        return response;
    }
};
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

    getsubCategories: (body) => {
        const response = validator(body, {
            main_category_id: JOI.number().required(),

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
    createSubCategory: (body) => {
        const response = validator(body, {
            title_kr: JOI.string().required(),
            title_en: JOI.string().required(),
            main_cat_id: JOI.number().required(),
        });
        return response;
    },
    createads: (body) => {
        const response = validator(body, {
            category_id: JOI.number().required(),
            repeat_count: JOI.number().required(),
            budget_itc: JOI.number().required(),
            title: JOI.string().required(),
            detail: JOI.string().allow(''),
            ad_type: JOI.string().required(),
            infolink: JOI.string().allow(''),
            video_link: JOI.string().allow(''),
            utube_url: JOI.string().allow(''),

            isVideoUrl: JOI.number().allow(''),
        });
        return response;
    },

    editad: (body) => {
        const response = validator(body, {
            category_id: JOI.number().required(),
            repeat_count: JOI.number().required(),
            title: JOI.string().required(),
            detail: JOI.string().allow(''),
            ad_type: JOI.string().required(),
            infolink: JOI.string().allow(''),

            utube_url: JOI.string().allow(''),
            video_link: JOI.string().allow(''),
            isVideoUrl: JOI.number().allow(''),
            ad_id: JOI.number().allow(''),
        });
        return response;
    },
    pausead: (body) => {
        const response = validator(body, {
            adId: JOI.number().required(),
            pauseAd: JOI.boolean().required()
        });
        return response;
    },


    deletead: (body) => {
        const response = validator(body, {
            ad_id: JOI.number().required(),
        });
        return response;
    },




    updatecouponBody: (body) => {
        const response = validator(body, {
            coupon_id: JOI.number().required(),
            coupon_name: JOI.string().max(100).required(),
            description: JOI.string().required(),
            total_coupons: JOI.number().required(),
            coupon_code: JOI.string().required(),
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
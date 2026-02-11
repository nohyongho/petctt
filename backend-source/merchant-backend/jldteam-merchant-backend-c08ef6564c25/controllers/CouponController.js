/** Model */
const User = require('../models/User');
const Brand = require('../models/Brand');
const Outlet = require('../models/Outlet');
const CouponCategory = require('../models/CouponCategory');
const Category = require('../models/Categories');
const Currency = require('../models/Currency');
const TimeTable = require('../models/TimeTable');
const Coupon = require('../models/Coupon');
const MpBrandCategory = require('../models/MpBrandCategory');
const MpCouponOutlet = require('../models/MpCouponOutlet');
const CouponCode = require('../models/CouponCode');
const CollectedCoupon = require('../models/CollectedCoupon');
const Campaign = require('../models/Campaign');
const CountryList = require('../models/CountryList');
const Fcm = require('../models/Fcm');
const Role = require('../models/Role');
const MerchantOrders = require('../models/MerchantOrders');



/**Services  */
const uploadImage = require('../services/imageUpload.service');

/** Helpers */
const response = require('../helper/response');
const constant = require('../constants/ConstantMessages');
const validate = require('../helper/validators/CouponValidator');
const FirebaseMessaging = require('../helper/FirebaseMessaging');

/** Database */
const sequelize = require('../config/database');

/** Library */
const randomLocation = require('random-location');
const randomString = require('randomstring');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const path = require('path');
const fs = require('fs')
const randomstring = require("randomstring");

const CouponController = () => {

    /**get all coupons & outlet coupons  */
    const allCouponList = async(req, res) => {
        try {
            const { user } = req;
            const { type, status, outletid } = req.body;
            const bodyResposnse = validate.couponsList(req.body);
            if (bodyResposnse.status === false) {
                return response.error(res, bodyResposnse.msg);
            }
            let coupons;
            let brand = await Brand.findOne({
                where: {
                    user_id: user.data.user_id
                }
            });
            /**all coupons list */
            // if (type === 'all') {
            if (outletid != null) {
                coupons = await Coupon.findAll({
                    where: [{
                            brand_id: brand.id
                        },
                        {
                            outlet_id: outletid
                        },
                        {
                            is_deleted: false
                        }
                    ],
                    order: [
                        ['createdAt', 'desc']
                    ],
                    include: [{
                        model: CollectedCoupon,
                        required: false,
                    }],

                    limit: parseInt(req.body.limit),
                    offset: parseInt(req.body.limit) * (parseInt(req.body.page - 1))
                });
            } else {

                coupons = await Coupon.findAll({
                    where: [{
                        brand_id: brand.id
                    }, {
                        is_deleted: false
                    }],

                    include: [{
                        model: CollectedCoupon,
                        required: false,
                    }],


                    order: [
                        ['createdAt', 'desc']
                    ],
                    limit: parseInt(req.body.limit),
                    offset: parseInt(req.body.limit) * (parseInt(req.body.page - 1))
                });


            }

            let recordsTotal = 0;
            let recordsFiltered = 0;
            recordsTotal = coupons.length;
            recordsFiltered = coupons.length;
            mappedcoupons = coupons.map(Element => {

                var cc = [];
                var rr = [];
                var dd = [];
                var st = [];
                Element.CollectedCoupons.forEach(ele => {


                    if (ele.is_coupon == "COLLECTED")
                        cc.push(ele.is_coupon + "--" + ele.coupon_id)
                    if (ele.is_coupon == "REDEEMED")
                        rr.push(ele.is_coupon + "--" + ele.coupon_id)
                    if (ele.is_coupon == "HIDDEN" || ele.is_deleted == true)
                        dd.push(ele.is_deleted + "--" + ele.coupon_id)
                    if (ele.is_coupon == "EXPIRED")
                        st.push(ele.is_coupon + "--" + ele.is_coupon)





                });

                return {
                    id: Element.id,
                    name: Element.coupon_name,
                    totalCoupons: Element.total_coupons,
                    remainingCoupons: Element.remaining_coupons,
                    type: Element.coupon_type,
                    coupon_image: Element.coupon_image,
                    percent_off: Element.percent_off,
                    amount: Element.amount,
                    per_user: Element.per_user,
                    // coupon_code:Element.coupon_code,
                    desc: Element.description,
                    radius: Element.radius,
                    category_id: Element.category_id,
                    brand_id: Element.brand_id,
                    outlet_id: Element.outlet_id,
                    validFrom: Element.valid_from,
                    validTill: Element.valid_till,
                    status: Element.status,
                    max_discount: Element.max_discount,
                    type_position: Element.type_position,
                    design_position: Element.design_position,
                    location_position: Element.location_position,
                    collectedCoupons: cc.length,
                    redeemedCoupons: rr.length,
                    deletedCoupons: dd.length,
                    expiredCoupons: st.length,


                };
            });


            return response.successDT(res, constant.SUCCESS, mappedcoupons, recordsTotal, recordsFiltered);
        } catch (error) {

            return response.error(res, error.message);
        }
    };


    /**coupon History  */
    const CouponHistory = async(req, res) => {
        try {
            const {
                user
            } = req;
            const {
                outlet_id,
                type
            } = req.body;
            const bodyResposnse = validate.CouponHistory(req.body);
            if (bodyResposnse.status === false) {
                return response.error(res, bodyResposnse.msg);
            }
            let coupons;
            let brand = await Brand.findOne({
                where: {
                    user_id: user.data.user_id
                }
            });



            if (outlet_id != null) {
                whereclausecoupon = [{
                    brand_id: brand.id
                }, {
                    outlet_id: outlet_id
                }, {
                    is_deleted: false
                }];

            } else {
                whereclausecoupon = [{
                    brand_id: brand.id
                }, {
                    is_deleted: false
                }];

            }
            /**all coupons list */
            // if (type === 'all') {

            coupons = await CollectedCoupon.findAll({
                where: [{
                    is_coupon: type
                }],
                attributes: ['id', 'is_coupon', 'createdAt'],

                include: [

                    {
                        model: User,
                        attributes: ['id', 'full_name', 'email'],
                    },

                    {
                        model: Coupon,
                        where: whereclausecoupon,
                        attributes: ['id', 'coupon_name', 'coupon_image', 'coupon_image', 'total_coupons', 'remaining_coupons', 'amount', 'percent_off'],
                        include: [{
                                    model: Brand,
                                    attributes: ['id', 'brand_name', ],
                                },
                                {
                                    model: Outlet,
                                    attributes: ['id', 'outlet_name', ],
                                    required: false,
                                }

                            ]
                            // attributes:['coupon_code','is_used'],
                            //required:false,

                    },
                    {
                        model: CouponCode,
                        attributes: ['id', 'coupon_code', 'is_used'],
                        //required:false,

                    },


                ],


                order: [
                    ['createdAt', 'desc']
                ],
                limit: parseInt(req.body.limit),
                offset: parseInt(req.body.limit) * (parseInt(req.body.page - 1))
            });

            let recordsTotal = 0;
            let recordsFiltered = 0;
            recordsTotal = coupons.length;
            recordsFiltered = coupons.length;
            // couponsdata = coupons.map(Element => {
            //     return {
            //         id: Element.id,
            //         coupon_name: Element.coupon_name,
            // totalCoupons: Element.total_coupons,
            // type: Element.coupon_type,
            // coupon_image :	Element.coupon_image,
            // percent_off:Element.percent_off,

            // price:Element.amount,
            // per_user:Element.per_user,
            // coupon_code:Element.coupon_code,
            // desc:Element.description,
            // total_coupons:Element.total_coupons,
            // radius:Element.	radius,
            // category_id:Element.category_id,
            // brand_id:Element.brand_id,
            // outlet_id:Element.outlet_id,
            // validFrom: Element.valid_from,
            // validTill: Element.valid_till,
            // status: Element.status,
            //         couponcode:Element.CouponCodes[0],
            //         collectedcoupon: Element,
            //     };
            // });


            return response.successDT(res, constant.SUCCESS, coupons, recordsTotal, recordsFiltered);
        } catch (error) {

            return response.error(res, error.message);
        }
    };



    /**creating coupon and assining to multiple outlets */
    const createCoupon = async(req, res) => {
        try {


            // const body = req.body;

            const body = JSON.parse(req.body.createCoupon);
            const {
                user
            } = req;
            const validationResponse = validate.createCouponBody(body);
            if (!validationResponse.status) {
                return response.bodyNotFound(res, validationResponse.msg);
            }
            if (!req.fileexist) {
                return response.error(res, "Please provide couopon Image");

            }

            var is_countrywide
            if (typeof body.is_countrywide == "undefined") {

                var OutletData = await Outlet.findOne({

                    where: [{
                        id: body.outlet_id
                    }],
                    attributes: ['id', 'is_countrywide'],
                });



                is_countrywide = OutletData.is_countrywide
            } else {

                is_countrywide = body.is_countrywide

            }
            /**adding new coupon */
            let newCoupon = await Coupon.create({
                coupon_name: body.coupon_name,
                total_coupons: body.total_coupons,
                remaining_coupons: body.total_coupons,
                percent_off: body.percent_off,
                valid_from: body.valid_from,
                valid_till: body.valid_till,
                description: body.description,
                //coupon_image: '/cImage/' + req.file.filename,
                coupon_image: req.filepath,
                per_user: body.per_user,
                brand_id: body.brand_id,
                radius: body.radius,
                outlet_id: body.outlet_id,
                amount: body.amount,
                category_id: body.categories_id,
                //coupon_code: body.code,
                coupon_type: 'common',
                status: 'available',
                currency_id: 4,
                max_discount: body.max_discount,
                type_position: body.type_position,
                design_position: body.design_position,
                location_position: body.location_position,
                is_countrywide: is_countrywide,

            });
            if (!newCoupon) {
                return response.error(res, constant.SERVER_ERROR);
            }

            let brand = await Brand.findOne({
                where: {
                    id: body.brand_id
                }
            });


            couponcode_arr = [];
            for (var i = 0; i <= body.total_coupons; i++) {

                var rndmstr = randomstring.generate({
                    length: 3,
                    charset: 'alphabetic'
                });

                couponcodedata = {
                    coupon_code: rndmstr + body.percent_off,
                    is_used: false,
                    coupon_id: newCoupon.id
                }
                couponcode_arr.push(couponcodedata)

            }
            // CouponCode.bulkCreate(couponcode_arr);

            coupondata = []

            coupondata = {
                couponId: newCoupon.id,

            }
            if (newCoupon) {

                /**adding merchant order */
                let merchant_order = await MerchantOrders.create({
                    coupon_id: newCoupon.id,
                    user_id: user.data.user_id,
                    amount: body.amount,
                    status: false,
                });




            }

            return response.successDT(res, constant.COUPON_CREATED, coupondata);

            //   return response.successMsg(res,constant.COUPON_CREATED,coupondata);

        } catch (error) {

            return response.error(res, error.message);
        }

    };



    /**Update Coupon record */
    const redeemCoupon = async(req, res) => {

        try {

            const body = req.body;

            const {
                user
            } = req;

            const validationResponse = validate.redeemCoupon(body);
            if (!validationResponse.status) {
                return response.bodyNotFound(res, validationResponse.msg);
            }
            //  let { oldPassword, newPassword } = req.body;

            let getCollectedcoupon = await CollectedCoupon.findOne({
                where: [{
                    id: body.collectedcoupon_id
                }, {
                    is_coupon: "COLLECTED"
                }]
            });


            // let getCoupon = await Coupon.findOne({ where: { id: getCollectedcoupon.coupon_id } });

            if (getCollectedcoupon) {

                let getCouponCode = await CouponCode.findOne({
                    where: [{
                        id: getCollectedcoupon.coupon_code_id
                    }, {
                        coupon_code: body.coupon_code
                    }]
                });

                if (getCouponCode) {


                    let collectedcoupon_update = await CollectedCoupon.update({
                        is_coupon: "REDEEMED",

                    }, {
                        where: {
                            id: body.collectedcoupon_id
                        }
                    });



                    let couponcode_update = await CouponCode.update({
                        is_used: true,

                    }, {
                        where: {
                            id: getCollectedcoupon.coupon_code_id
                        }
                    });

                    // let coupon_update = await Coupon.increment({
                    //     remaining_coupons: -1
                    // }, {
                    //     where: {
                    //         id: getCollectedcoupon.coupon_id
                    //     }
                    // })

                    return response.successMsg(res, constant.COUPON_REDEEMED);

                } else {
                    return response.error(res, constant.COUPON_CODE_NOTCORRECT);
                }

            } else {
                return response.error(res, constant.COLLECTED_COUPON_NOTFOUND);
            }



        } catch (error) {
            return response.error(res, error.message);
        }
    }









    /**Update Coupon record */
    const updateCoupon = async(req, res) => {

        try {

            // const body = req.body;
            const body = JSON.parse(req.body.updateCoupon);
            const { user } = req;
            // const confirmPassword = req.body.confirmPassword
            const validationResponse = validate.updatecouponBody(body);
            if (!validationResponse.status) {
                return response.bodyNotFound(res, validationResponse.msg);
            }


            //  let { oldPassword, newPassword } = req.body;

            let getcoupon = await Coupon.findOne({
                where: {
                    id: body.coupon_id
                }
            });






            if (getcoupon) {


                let updatecoupondata = await Coupon.update({
                        coupon_name: body.coupon_name,

                        total_coupons: body.total_coupons,

                        percent_off: body.percent_off,
                        valid_from: body.valid_from,
                        valid_till: body.valid_till,
                        description: body.description,

                        per_user: body.per_user,

                        radius: body.radius,
                        outlet_id: body.outlet_id,
                        amount: body.amount,
                        category_id: body.category_id,
                        max_discount: body.max_discount,
                        type_position: body.type_position,
                        design_position: body.design_position,
                        location_position: body.location_position,
                        //coupon_code: body.coupon_code,
                    },

                    {
                        where: {
                            id: body.coupon_id
                        }
                    });


                var is_countrywide
                if (typeof body.is_countrywide != "undefined") {


                    let updatecountrywide = await Coupon.update({
                        is_countrywide: body.is_countrywide,
                    }, {

                        where: {
                            id: body.coupon_id
                        }
                    });
                }




                if (req.fileexist) {


                    await Coupon.update({


                            coupon_image: req.filepath,
                        },

                        {
                            where: {
                                id: body.coupon_id
                            }
                        });

                }



                if (updatecoupondata[0] === 1) {
                    response.successMsg(res, constant.COUPON_UPDATED);
                } else {
                    return response.error(res, "Coupon Not Updated");
                }

            } else {
                return response.error(res, constant.COUPON_NOTFOUND);
            }

        } catch (error) {
            return response.error(res, error.message);
        }
    }




    /**delete coupon record */
    const deletecoupon = async(req, res) => {
        try {
            const user = req.user;
            const validationResponse = validate.deletecoupon(req.body);
            if (!validationResponse.status) {
                return response.bodyNotFound(res, validationResponse.msg);
            }

            var getCoupon = await Coupon.findOne({
                where: {
                    id: req.body.coupon_id
                },
                include: { // all includes are neccessory to make sure that coupon deleter is owner of coupon. TAK
                    attributes: [],
                    required: true,
                    model: Outlet,
                    include: {
                        attributes: [],
                        required: true,
                        model: Brand,
                        include: {
                            required: true,
                            attributes: [],
                            model: User,
                            where: {
                                id: user.data.user_id
                            }
                        }
                    }
                }
            });

            if (getCoupon.is_deleted)
                return response.error(res, constant.COUPON_DELETED_ALREADY);

            if (getCoupon) {
                getCoupon.is_deleted = true;
                getCoupon.save();

                sendDeleteCouponNotification(getCoupon.id);
                response.successMsg(res, constant.COUPON_DELETED);
            } else {
                return response.error(res, constant.COUPON_NOTFOUND);
            }

        } catch (error) {
            return response.error(res, error.message);
        }
    }

    /**Get All parent Categories */
    const getCategories = async(req, res) => {

        let foundCategories = await Category.findAll({
            attributes: ['id', 'title', 'image', 'description'],
            where: {
                parent_id: null
            }
        });
        if (!foundCategories) {
            return response.recordNotFound(res);
        }

        const data = [];
        for (let category of foundCategories) {
            data.push({
                id: category.id,
                name: category.title,
                description: category.description,
                image: category.image,
            });
        }

        return response.success(res, constant.SUCCESS, data);
    };
    /**getting brands detail on the basis of category */
    const getBrandByCategoryId = async(req, res) => {

        const {
            categoryId
        } = req.params;
        if (!categoryId) {
            return response.error(res, constant.SERVER_ERROR);
        }

        const foundData = await MpBrandCategory.findAll({
            where: {
                category_id: categoryId
            },
            include: [{
                model: Brand,
                include: {
                    model: CountryList
                }
            }, ]
        });

        if (!foundData) {
            return response.recordNotFound(res);
        }

        const brands = [];

        for (let ele of foundData) {
            brands.push({
                id: ele.Brand.id,
                brandName: ele.Brand.brand_name,
                email: ele.Brand.email,
                phoneNumber: ele.Brand.phone_number,
                address: ele.Brand.address,
                countryName: ele.Brand.CountryList.country_name,
                logo: ele.Brand.logo,
                description: ele.Brand.description,
                createdAt: ele.Brand.createdAt
            });
        }


        return response.success(res, constant.SUCCESS, brands);

    };
    /**get sigle coupon detail on the basis of coupon ID */
    const getCouponDetail = async(req, res) => {
        try {
            const {
                user
            } = req;

            let coupon = await Coupon.findOne({
                where: {
                    id: req.params.id
                },
                include: [{
                    model: CollectedCoupon
                }, {
                    model: Currency,
                    include: CountryList
                }, {
                    model: MpCouponOutlet,
                    include: {
                        model: Outlet,
                        include: {
                            model: TimeTable
                        }
                    }
                }, {
                    model: Category,
                    attributes: ['title']
                }, {
                    model: Brand,
                    attributes: ["brand_name", "image"],
                    include: {
                        model: Category,
                        attributes: ['title']
                    }
                }]
            });
            let collected = 0;
            let redeemed = 0;
            let expired = 0;
            /**getting sum of collected, redeemed and expired coupon quantity Manualy*/
            let collectedCoupon = coupon.CollectedCoupons;
            collectedCoupon.forEach(element => {
                switch (element.is_coupon) {
                    case 'collected':
                        collected = collected + 1;
                        break;
                    case 'redeemed':
                        redeemed = redeemed + 1;
                        break;
                    case 'expired':
                        expired = expired + 1;
                        break;
                    default:
                        break;
                }
            });

            /**mapping and prepairing respone of outlet. */
            let outlet = coupon.MpCouponOutlets;
            outlet = outlet.map(Element => {
                return {
                    id: Element.Outlet.id,
                    name: Element.Outlet.outlet_name,
                    address: Element.Outlet.address,
                    phoneNumber: Element.Outlet.phone_number,
                    createdAt: Element.Outlet.createdAt,
                    status: Element.Outlet.status ? 'Active' : 'Blocked',
                };
            });
            /**final Data */
            let data = {
                id: coupon.id,
                name: coupon.coupon_name,
                image: coupon.coupon_image,
                description: coupon.description,
                type: coupon.coupon_type,
                total: coupon.total_coupons,
                remaining: coupon.remaining_coupons,
                fullAmount: coupon.amount,
                percentOff: coupon.percent_off + '%',
                offAmount: coupon.amount - ((coupon.percent_off / 100) * coupon.amount),
                validFrom: coupon.valid_from,
                validTill: coupon.valid_till,
                createdAt: coupon.createdAt,
                status: coupon.status,
                perUser: coupon.per_user,
                category: coupon.Category ? coupon.Category.title : '',
                redeemed: redeemed,
                collected: collected,
                expired: expired,
                country: {
                    name: (coupon.Currency && coupon.Currency.CountryList) ? coupon.Currency.CountryList.country_name : ''
                },
                currency: {
                    id: coupon.Currency ? coupon.Currency.id : '',
                    name: coupon.Currency ? coupon.Currency.name : '',
                    symbol: coupon.Currency ? coupon.Currency.symbol : ''
                },
                brand: {
                    name: coupon.Brand.brand_name,
                    image: coupon.Brand.image,
                    category: coupon.Brand.Category.title
                },
                outlet
            };
            return response.success(res, constant.SUCCESS, data);

        } catch (error) {

            return response.error(res, error.message);
        }
    };
    /**Active Coupons or available coupons */
    const activeCouponSummary = async(req, res) => {
        const {
            user
        } = req;

        if (!user) {
            return response.unauthorized(res, 'Unauthorized');
        }

        Coupon.findAll({
            where: {
                status: 'available'
            },
            attributes: [
                ['coupon_name', 'couponName'],
                ['total_coupons', 'totalCoupons'],
                ['remaining_coupons', 'remainingCoupons'],
                [sequelize.col('Brand.brand_name'), 'brandName'],
                [sequelize.col('Brand.image'), 'brandImage'],
            ],
            include: [{
                model: Brand,
                attributes: []
            }]
        }).then(data => {
            if (!data) {
                return response.recordNotFound(res);
            }

            const parsedData = data.map(ele => {
                return ele.toJSON();
            });

            return response.success(res, 'ok', parsedData);
        }).catch(error => {
            return response.error(res, error.message);
        });
    };





    /**tests3image */
    const tests3image = async(req, res) => {



        return response.success(res, constant.SUCCESS);
    };

    return {
        allCouponList,
        createCoupon,
        updateCoupon,
        getCategories,
        getBrandByCategoryId,
        getCouponDetail,
        activeCouponSummary,
        deletecoupon,
        redeemCoupon,
        CouponHistory,
        tests3image,
    };
};

module.exports = CouponController;

/* 
Method to send hidden in app notification to android devices. TAK
param = single couponId
*/
function sendDeleteCouponNotification(couponId) {
    if (!couponId)
        return;

    Fcm.findAll({
        attributes: ["fcm_token"],
        include: {
            required: true,
            model: User,
            attributes: [],
            include: {
                attributes: [],
                required: true,
                model: Role,
                where: {
                    name: {
                        [Op.like]: 'user'
                    },
                }
            }
        }
    }).then(fcmArr => {
        if (fcmArr && fcmArr.length > 0) {
            var userFcmsArray = [];
            fcmArr.forEach(fcmObj => {
                userFcmsArray.push(fcmObj.fcm_token);
            });
            var title = "Coupon";
            var msg = "Coupon";
            var jsonData = {};
            jsonData.title = title;
            jsonData.message = msg;
            jsonData.method = "removeCoupon"; //this has to be "removeCoupon".
            jsonData.ids = couponId;
            if (userFcmsArray.length > 0) {
                var firebaseMsg = new FirebaseMessaging(userFcmsArray, title, msg, jsonData);
                firebaseMsg.send();
            }

        }
    });
}
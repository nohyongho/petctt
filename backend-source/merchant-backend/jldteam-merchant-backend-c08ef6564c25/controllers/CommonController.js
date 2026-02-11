/** Model */
const CountryList = require('../models/CountryList');
const Brand = require('../models/Brand');
const Outlet = require('../models/Outlet');
const Coupon = require('../models/Coupon');
const CollectedCoupons = require('../models/CollectedCoupon');
const MpCouponOutlet = require('../models/MpCouponOutlet');
const CouponCode = require('../models/CouponCode');
const Currency = require('../models/Currency');
const Category = require('../models/Categories');
const State = require('../models/StateList');
const City = require('../models/CityList');
const User = require('../models/User');
const Role = require('../models/Role');
const Products = require('../models/Products');
const TypeProducts = require('../models/TypeProducts');
const Ads = require('../models/Ads');
const mailer = require('../services/mailer.service');
const UserWalletCrypto = require('../models/UserWalletCrypto');
const UserWalletFiat = require('../models/UserWalletFiat');
const GeneralConfig = require('../models/GeneralConfig');

/** Helpers */
const response = require('../helper/response');
const constant = require('../constants/ConstantMessages');
//const validate = require('../helper/validators/AuthValidator');
const validateCoupon = require('../helper/validators/CouponValidator');
const validate = require('../helper/validators/CommonValidator');
const axios = require('axios');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const CommonController = () => {
    /**get all countries list  */
    const getCountryList = async(req, res) => {
        const foundCountryList = await CountryList.findAll({
            attributes: ['id', ['country_name', 'name'],
                ['flag_image', 'image'],
                ['phone_code', 'phoneCode'],
                ['sort_name', 'sortName']
            ]
        });

        if (!foundCountryList) {
            return response.recordNotFound(res, req);
        }
        return response.success(res, constant.SUCCESS, foundCountryList);
    };

    /**creating ads */
    const createads = async(req, res) => {
        try {
            //const body = req.body;


            const body = JSON.parse(req.body.createAd);
            const { user } = req;
            const validationResponse = validate.createads(body);
            if (!validationResponse.status) {
                return response.bodyNotFound(res, validationResponse.msg);
            }
            let foundWallet = await UserWalletCrypto.findOne({ where: { user_id: user.data.user_id } });



            if (!foundWallet) {
                return response.error(res, "No Crypto Wallet Found against this merchant");
            }

            // console.log(foundWallet.dataValues.balance_crypto)
            // console.log(isNaN(foundWallet.dataValues.balance_crypto))
            // console.log('---------')
            // console.log(body.budget_itc)

            // console.log(isNaN(body.budget_itc))

            if (Math.round(body.budget_itc * 100) >= Math.round(foundWallet.dataValues.balance_crypto * 100)) {


                return response.error(res, "You do not have sufficient balance in your wallet. Please recharge your wallet first.");
            }



            var img_url = null;
            var video_url = null;
            var link = null;
            var is_link = false



            if (body.ad_type == "VIDEO") {



                if (typeof req.filevideo != 'undefined') {
                    video_url = req.videofilepath

                } else {

                    video_url = body.video_link,
                        is_link = true
                }
            }

            if (body.ad_type == "IMAGE") {
                img_url = req.imagefilepath
            }

            if (body.ad_type == "MARKER") {
                img_url = req.imagefilepath

                if (typeof req.filevideo != 'undefined') {
                    video_url = req.videofilepath

                } else {

                    video_url = body.video_link,
                        is_link = true
                }
            }

            if (body.ad_type == "YOUTUBE") {
                video_url = body.utube_url
            }

            if (body.ad_type == "LINK") {
                video_url = body.video_link
            }
            if (body.ad_type == "QRAD") {
                img_url = req.imagefilepath

                if (typeof req.filevideo != 'undefined') {
                    video_url = req.videofilepath

                } else {

                    video_url = body.video_link,
                        is_link = true
                }
            }



            /**adding new ad */
            let newAd = await Ads.create({


                advertiser_id: user.data.user_id,
                cat_id: body.category_id,
                repeat_count: body.repeat_count,
                budget_itc: body.budget_itc,
                remaining_budget: body.budget_itc,
                title: body.title,
                detail: body.detail,
                ad_type: body.ad_type,
                link: body.infolink,
                img_url: img_url,
                video_url: video_url,
                availbility: 'GLOBAL',
                status: 'ACTIVE',
                is_external_link: is_link,
            });

            if (!newAd) {
                return response.error(res, constant.SERVER_ERROR);
            }

            var newbalance = foundWallet.dataValues.balance_crypto - body.budget_itc

            let updatewalletbalance = await UserWalletCrypto.update({
                    balance_crypto: newbalance,

                },

                {
                    where: { user_id: user.data.user_id }
                });


            return response.success(res, constant.AD_CREATED, { id: newAd.id, ad_type: body.ad_type });
            //     return response.successMsg(res, constant.AD_CREATED, { id: newAd.id, ad_type: body.ad_type });

        } catch (error) {

            return response.error(res, error.message);
        }

    };




    /**creating ads */
    const editads = async(req, res) => {
        try {
            //const body = req.body;

            const body = JSON.parse(req.body.editAd);
            const { user } = req;
            const validationResponse = validate.editad(body);
            if (!validationResponse.status) {
                return response.bodyNotFound(res, validationResponse.msg);
            }


            var img_url = null;
            var video_url = null;
            var link = null;
            var is_external_link = false;


            if (body.ad_type == "VIDEO") {



                if (typeof req.filevideo !== 'undefined') {
                    video_url = req.videofilepath;
                    is_external_link = false;

                } else {



                    if (body.video_link !== null && typeof body.video_link !== 'undefined' && body.video_link !== '') {


                        video_url = body.video_link
                        is_external_link = true
                    }
                }
            }

            if (body.ad_type == "IMAGE") {
                if (typeof req.fileimage !== 'undefined') {
                    img_url = req.imagefilepath
                }
            }

            if (body.ad_type == "MARKER") {
                if (typeof req.fileimage !== 'undefined') {
                    img_url = req.imagefilepath
                }

                if (typeof req.filevideo !== 'undefined') {
                    video_url = req.videofilepath
                    is_external_link = false


                } else {

                    if (body.video_link !== null && typeof body.video_link !== 'undefined' && body.video_link !== '') {
                        video_url = body.video_link
                        is_external_link = true
                    }
                }
            }

            if (body.ad_type == "YOUTUBE") {
                video_url = body.utube_url
            }

            if (body.ad_type == "LINK") {
                video_url = body.video_link
            }
            if (body.ad_type == "QRAD") {


                if (typeof req.fileimage !== 'undefined') {
                    img_url = req.imagefilepath

                }


                if (typeof req.filevideo !== 'undefined') {
                    video_url = req.videofilepath
                    is_external_link = false




                } else {


                    if (body.video_link !== null && typeof body.video_link !== 'undefined' && body.video_link !== '') {



                        video_url = body.video_link
                        is_external_link = true

                    }
                }
            }
            /**adding new ad */
            let updateAd = await Ads.update({
                advertiser_id: user.data.user_id,
                cat_id: body.category_id,
                repeat_count: body.repeat_count,
                title: body.title,
                detail: body.detail,
                ad_type: body.ad_type,
                link: body.infolink,
                availbility: 'GLOBAL',
                status: 'ACTIVE',
                is_external_link: is_external_link,

            }, {
                where: { id: body.ad_id }
            });



            if (img_url != null && typeof img_url !== 'undefined' && img_url !== '') {

                let updateAd = await Ads.update({

                    img_url: img_url,


                }, {
                    where: { id: body.ad_id }
                });
            }



            // if (video_url == null) {
            //     console.log('--- null------' + video_url)

            // }
            // if (video_url == '') {

            //     console.log('--- empty------' + video_url)
            // }
            // if (typeof video_url == 'undefined') {
            //     console.log('--- undeinfied------' + video_url)

            // }

            if (video_url !== null && typeof video_url !== 'undefined' && video_url !== '') {

                let updateAd = await Ads.update({

                    video_url: video_url,



                }, {
                    where: { id: body.ad_id }
                });
            }
            if (!updateAd) {
                return response.error(res, constant.SERVER_ERROR);
            }

            return response.successMsg(res, constant.AD_UPDATED);

        } catch (error) {

            return response.error(res, error.message);
        }

    };

    /**Pause AD  */

    const pauseAd = async(req, res) => {

        try {

            const { user } = req;
            body = req.body;

            const validationResponse = validate.pausead(req.body);
            if (!validationResponse.status) {
                return response.bodyNotFound(res, validationResponse.msg);
            }

            var myAd = await Ads.findOne({

                where: {
                    advertiser_id: user.data.user_id,
                    id: body.adId
                },
            });

            if (!myAd)
                return response.error(res, "Ad not found");

            // if (myAd.softDelete)
            //     return response.error(res, "Ad is already deleted");

            // if (myAd.dataValues.is_paused === false && body.pauseAd === 'false') {

            //     console.log('---yes false');
            // // }
            // console.log(body.pauseAd)
            // console.log(Boolean(body.pauseAd))
            // console.log(myAd.dataValues.is_paused)


            if (myAd.dataValues.is_paused && body.pauseAd) {
                return response.error(res, "Ad is already paused");
            }
            if (myAd.dataValues.is_paused === false && body.pauseAd === false) {

                return response.error(res, "Ad is already active");
            }


            let updateAd = await Ads.update({

                is_paused: body.pauseAd,



            }, {
                where: { id: body.adId }
            });

            if (!updateAd) {
                return response.error(res, constant.SERVER_ERROR);
            }



            return response.successMsg(res, "Ad " + ((body.pauseAd) ? "paused" : "activated") + " successfully.");

        } catch (error) {
            console.error('Error::', error);
            return response.error(res, error.message);
        }

    };

    /**delete AD record */
    const deletead = async(req, res) => {
        try {
            const { user } = req;
            // const confirmPassword = req.body.confirmPassword
            const validationResponse = validate.deletead(req.body);
            if (!validationResponse.status) {
                return response.bodyNotFound(res, validationResponse.msg);
            }


            //  let { oldPassword, newPassword } = req.body;

            let getad = await Ads.findOne({ where: { id: req.body.ad_id } });


            if (getad == null) {
                return response.error(res, 'Ad not found');
            }
            let updatedata = await Ads.update({
                    soft_delete: 1,


                },

                {
                    where: { id: req.body.ad_id }
                });






            //if (updateaddata[0] === 1) {
            response.successMsg(res, constant.AD_DELETED);
            //   } else {
            //      return response.error(res, constant.AD_CANTDELETED);
            //  }





        } catch (error) {
            return response.error(res, error.message);
        }
    };


    /**get ads per view price list  */
    const priceperviewList = async(req, res) => {
        const { user } = req;
        try {


            let list = await GeneralConfig.findAll();


            if (list) {
                return response.success(res, constant.SUCCESS, list);
            } else {
                return response.error(res, constant.NO_RECORD);
            }
        } catch (error) {
            return response.error(res, error.message);
        }
    };





    /**get ads list  */
    const adsList = async(req, res) => {
        const { user } = req;
        try {


            let list = await Ads.findAll({ where: { advertiser_id: user.data.user_id, soft_delete: false } });

            adsData = list.map(Element => {

                video_url = null
                video_link = null
                if (Element.is_external_link != false) {
                    video_link = Element.video_url
                } else {
                    video_url = Element.video_url
                }

                return {
                    id: Element.id,
                    name: Element.product_name,
                    advertiser_id: Element.advertiser_id,
                    cat_id: Element.cat_id,
                    crypto_txn_id: Element.crypto_txn_id,
                    repeat_count: Element.repeat_count,
                    total_seen_count: Element.total_seen_count,
                    budget_itc: Element.budget_itc,
                    remaining_budget: Element.remaining_budget,
                    per_view_price: Element.per_view_price,
                    title: Element.title,
                    detail: Element.detail,
                    ad_type: Element.ad_type,
                    infolink: Element.link,
                    img_url: Element.img_url,
                    video_url: video_url,
                    video_link: video_link,
                    info_ink: Element.link,
                    img_url: Element.img_url,
                    status: Element.status,
                    is_paused: Element.is_paused,
                    soft_delete: Element.soft_delete,
                    createdAt: Element.createdAt,
                    updatedAt: Element.updatedAt,

                };
            });


            if (list) {
                return response.success(res, constant.SUCCESS, adsData);
            } else {
                return response.error(res, constant.NO_RECORD);
            }
        } catch (error) {
            return response.error(res, error.message);
        }
    };


    /**get sate list by given country id */
    const statesList = async(req, res) => {
        const countryId = req.params.countryId;
        try {
            let list = await State.findAll({ where: { country_id: countryId }, attributes: ['id', ['state_name', 'name']] });
            if (list) {
                return response.success(res, constant.SUCCESS, list);
            } else {
                return response.error(res, constant.NO_RECORD);
            }
        } catch (error) {
            return response.error(res, error.message);
        }
    };
    /**getching the cities list on the basis of country Id and state Id */
    const citiesList = async(req, res) => {
        //  const stateId = req.params.stateId;

        const countryId = req.params.countryId;
        try {
            let cityList = await City.findAll({ where: { country_id: countryId, featured: true }, attributes: ['id', ['city_name', 'name']] });
            if (cityList) {
                return response.success(res, constant.SUCCESS, cityList);
            } else {
                return response.error(res, constant.NO_RECORD);
            }
        } catch (error) {
            return response.error(res, error.message);
        }
    };




    /**creating sub categries */
    const createSubCategory = async(req, res) => {
        try {



            const body = JSON.parse(req.body.createSubCategory);
            const { user } = req;
            const validationResponse = validate.createSubCategory(body);
            if (!validationResponse.status) {
                return response.bodyNotFound(res, validationResponse.msg);
            }
            /**adding new Sub Categories */
            let newSubCat = await Category.create({

                parent_id: body.main_cat_id,
                title: body.title_kr,
                title_en: body.title_en,
                image: req.imagefilepath,


            });
            if (!newSubCat) {
                return response.error(res, constant.SERVER_ERROR);
            }

            return response.successMsg(res, constant.SUBCAT_CREATED);

        } catch (error) {

            return response.error(res, error.message);
        }

    };








    /**get collected coupons country names and their total sum   */
    const collectedCouponsCountry = async(req, res) => {
        try {
            const { user } = req;
            couponIds = [];
            /**get brand id on the basis of user_id(merchant id) */
            let brand = await Brand.findOne({ where: { user_id: user.data.user_id } });
            let getCoupons = await Coupon.findAll({ where: { brand_id: brand.id } });
            /** Pushing coupons ids in a single array
             * to execute the collected coupon aggregate query in single time.
             */
            getCoupons.map(Element => {
                couponIds.push(Element.id);
            });

            let getCollectedCoupons = await collectedCountries();
            getCollectedCoupons = getCollectedCoupons.map(data => {
                data = data.toJSON();
                return {
                    country: data.CountryList.sort_name,
                    collected: data.count
                };
            });
            return response.success(res, constant.SUCCESS, getCollectedCoupons)
        } catch (error) {

            return response.error(res, error.message);
        }

    };
    /**get  */
    const countryStateCities = async(req, res) => {
        try {
            let foundCountryList = await CountryList.findAll({
                attributes: ['id', ['country_name', 'name'],
                    ['sort_name', 'sortName']
                ]
            });
            return response.success(res, constant.SUCCESS, foundCountryList);
        } catch (error) {

            return response.error(res, error.message);
        }

    };
    /**get brand list by merchant's id */
    const getMyBrand = async(req, res) => {
        try {
            const { user } = req;
            couponIds = [];
            let brand = await Brand.findAll({
                where: { user_id: user.data.user_id },

                include: [{
                        model: CountryList,
                        attributes: ['id', 'country_name'],
                        required: false
                    },
                    {
                        model: Category,
                        attributes: ['id', 'title'],

                    },
                ],

                attributes: ['id', ['brand_name', 'name'], 'image', 'postal_code', 'address', 'country_code', ['phone_number', 'phoneNumber']]
            });
            return response.success(res, constant.SUCCESS, brand);
        } catch (error) {

            return response.error(res, error.message);
        }

    };
    /**get all  categories  */
    const getCategories = async(req, res) => {
        try {
            let Categories = await Category.findAll({
                attributes: ['id', 'title', 'image'],
                where: {
                    parent_id: null

                },
                // include: [{
                //     model: Category,
                //     as: 'Children',
                //     include: [{
                //         model: Category,
                //         as: 'Children'
                //     }]
                // }]
            });
            return response.success(res, constant.SUCCESS, Categories);
        } catch (error) {

            return response.error(res, error.message);
        }
    };

    /**get all sub categories  */
    const getsubCategories = async(req, res) => {
        try {


            const body = req.body
            const validationResponse = validate.getsubCategories(body);
            if (!validationResponse.status) {
                return response.bodyNotFound(res, validationResponse.msg);
            }


            let Categories = await Category.findAll({
                attributes: ['id', 'title', 'image', 'parent_id'],
                where: {
                    // parent_id: {
                    //     [Op.not]: null
                    // },
                    // where: { 
                    parent_id: req.body.main_category_id

                    // },

                },
                include: [{
                    model: Category,
                    as: 'Children',

                }],
            });
            return response.success(res, constant.SUCCESS, Categories);
        } catch (error) {

            return response.error(res, error.message);
        }
    };


    /**get product types list */
    const getProductTypes = async(req, res) => {
        try {
            let typeproducts = await TypeProducts.findAll({
                attributes: ['id', 'type_title']
            });
            return response.success(res, constant.SUCCESS, typeproducts)
        } catch (error) {

            return response.error(res, error.message)
        }
    };



    /**get all sub categories  Brand for product creation*/
    const getsubCategoriesProduct = async(req, res) => {
        try {
            //const { user } = req;


            const { brandId } = req.params;
            const body = req.body;
            const validationResponse = validateCoupon.getsubCategoriesProduct(body);
            if (!validationResponse.status) {
                return response.bodyNotFound(res, validationResponse.msg);
            }
            /**get brand id on the basis of user_id(merchant id) */
            let brand = await Brand.findOne({

                attributes: ['category_id'],
                where: { id: brandId }
            });


            /**sequelize query on coupon to get the categories */




            let Categories = await Category.findAll({
                attributes: ['id', 'title', 'image'],
                where: {
                    parent_id: brand.dataValues.category_id,
                    // parent_id: {
                    //     [Op.not]: null
                    // }
                }
            });

            /**final response */
            Categories = Categories.map(data => {
                // data = data.toJSON();
                return {
                    id: data.id,
                    title: data.title.toUpperCase(),
                    image: data.image
                };
            });
            return response.success(res, "Product Categories", Categories);
        } catch (error) {

            return response.error(res, error.message);
        }
    };




    /**get all currencies list */
    const getCurrencies = async(req, res) => {
        try {
            let Currencies = await Currency.findAll({
                attributes: ['id', 'symbol', 'name']
            });
            return response.success(res, constant.SUCCESS, Currencies)
        } catch (error) {

            return response.error(res, error.message)
        }
    };
    /**get all registered outlets of specific brand(merchant's id)  */
    const getOutlets = async(req, res) => {
        try {
            const { user } = req;
            /**get brand id on the basis of user_id(merchant id) */
            let brand = await Brand.findOne({ where: { user_id: user.data.user_id } });
            if (!brand) {
                return response.error(res, constant.SERVER_ERROR);
            }
            let outlets = await Outlet.findAll({
                where: { brand_id: brand.id },
                attributes: ['id', ['outlet_name', 'name']]
            });
            if (!outlets) {
                return response.recordNotFound(res);
            }
            return response.success(res, constant.SUCCESS, outlets);
        } catch (error) {

            return response.error(res, error.message);
        }
    };

    /**all categories list that a brand(merchant) have in their system(Account) */
    const categoriesByBrandId = async(req, res) => {
        try {
            //const { user } = req;


            const { brandId } = req.params;

            const body = req.body;
            const validationResponse = validateCoupon.categoriesByBrandId(body);
            if (!validationResponse.status) {
                return response.bodyNotFound(res, validationResponse.msg);
            }


            /**get brand id on the basis of user_id(merchant id) */
            let brand = await Brand.findOne({

                attributes: ['category_id'],
                where: { id: brandId }
            });


            /**sequelize query on coupon to get the categories */




            let Categories = await Category.findAll({
                attributes: ['id', 'title', 'image'],
                where: {
                    parent_id: brand.dataValues.category_id,
                    // parent_id: {
                    //     [Op.not]: null
                    // }
                }
            });

            /**final response */
            Categories = Categories.map(data => {
                // data = data.toJSON();
                return {
                    id: data.id,
                    title: data.title.toUpperCase(),
                    image: data.image
                };
            });
            return response.success(res, "Brand subcategories for Product Category selection", Categories);
        } catch (error) {

            return response.error(res, error.message);
        }
    };





    /**all categories list that a brand(merchant) have in their system(Account) */
    const categoriesByBrandIdUser = async(req, res) => {
        try {


            // const { user } = req;
            /**get brand id on the basis of user_id(merchant id) */
            let brand = await Brand.findOne({ where: { user_id: req.body.merchant_id, id: req.body.brand_id } });
            /**sequelize query on coupon to get the categories */
            let Categories = await Products.findAll({
                attributes: [
                    [Sequelize.col('category_id'), 'category_id']
                ],
                where: { brand_id: brand.id, id: req.body.outlet_id, user_id: req.body.merchant_id },
                include: { model: Category },
                group: [Sequelize.col('Category.id')]
            });


            /**final response */
            Categories = Categories.map(data => {
                data = data.toJSON();
                return {
                    id: data.Category.id,
                    title: data.Category.title.toUpperCase(),
                    image: data.Category.image
                };
            });
            return response.success(res, constant.SUCCESS, Categories);
        } catch (error) {

            return response.error(res, error.message);
        }
    };






    /**Sum of all three types collected,redeemed and expired
     * that sum will be on the basis of merchant's id(Account)
     */
    const accountsDetail = async(req, res) => {
        try {
            const { user } = req;
            couponIds = [];
            /**get brand id on the basis of user_id(merchant id) */
            let brand = await Brand.findOne({ where: { user_id: user.data.user_id } });
            let getCoupons = await Coupon.findAll({ where: { brand_id: brand.id } });

            getCoupons.map(Element => {
                couponIds.push(Element.id);
            });
            const getCollectedCoupons = await CollectedCoupons.findAll({
                where: {
                    coupon_id: {
                        [Op.in]: couponIds
                    }
                }
            });
            let collected = 0;
            let redeemed = 0;
            let expired = 0;
            /**Taking manual sum of redeemed, collected and expired by simple assignment operator.  */
            getCollectedCoupons.forEach(element => {
                switch (element.is_coupon) {
                    case 'redeemed':
                        redeemed = redeemed + 1;
                        break;
                    case 'collected':
                        collected = collected + 1;
                        break;
                    case 'expired':
                        expired = expired + 1;
                        break;
                    default:
                        break;
                }
            });
            data = [{
                    status: "COLLECTED",
                    value: collected,
                    icon: 'fa-box-open'
                },
                {
                    status: "REDEEMED",
                    value: redeemed,
                    icon: 'fa-box'
                },
                {
                    status: "EXPIRED",
                    value: expired,
                    icon: 'fa-hourglass-end'
                }
            ];
            return response.success(res, constant.SUCCESS, data);

        } catch (error) {

            return response.error(res, error.message);
        }
    };


    /**support email */
    const supportemail = async(req, res) => {
        try {

            let mailbody = `\r\nFrom:\n ${req.body.email}<br><br>`;
            mailbody += `\r\nSubject:\n ${req.body.subject}<br><br>`;
            mailbody += `\r\nMessage:\n ${req.body.message}<br><br>`;
            emailto = 'info@coupontalktalk.com';
            await mailer.sendSupportEmail(emailto, mailbody)
            return response.successMsg(res, constant.SUPPPORT_EMAIL_SENT);


        } catch (error) {

            return response.error(res, error.message)
        }
    }

    /**generate address fro paymnet /QR  */
    const generatecryptoaddress = async(req, res) => {
        try {

            var callResponse = await axios.post("http://54.255.162.58:3000/node/createAccount", {
                symbol: 'itc'
            });



            // return response.successMsg(res, "addresss generated successfully",{callResponse});
            return response.successDT(res, "addresss generated successfully", { address: callResponse.data.account.address });


        } catch (error) {

            return response.error(res, error.message)
        }
    }




    /**Redeemed coupons detail for merchant's portal */
    const redeemedCouponDetail = async(req, res) => {
        try {
            const { user } = req;
            let couponIds = [];
            const bodyResposnse = validateCoupon.redeemedCoupons(req.body);
            if (bodyResposnse.status === false) {
                return response.error(res, bodyResposnse.msg);
            }
            /**get brand id on the basis of user_id(merchant id) */
            let brand = await Brand.findOne({ where: { user_id: user.data.user_id } });
            let getCoupons = await Coupon.findAll({ where: { brand_id: brand.id } });
            getCoupons.forEach(Element => {
                couponIds.push(Element.id);
            });
            /**sequekize join query on collected Coupons table with pagination */
            let redeemedCoupons = await CollectedCoupons.findAll({
                where: {
                    coupon_id: {
                        [Op.in]: couponIds
                    },
                    is_coupon: 'redeemed'
                },
                attributes: ['id', 'updatedAt'],
                include: [{ model: Coupon, attributes: ['id', 'coupon_name', 'coupon_image', 'percent_off', 'amount'] }, {
                    model: User,
                    attributes: ['id', 'full_name']
                }, {
                    model: MpCouponOutlet,
                    attributes: ['outlet_id'],
                    include: {
                        model: Outlet,
                        attributes: ['id', 'outlet_name']
                    }
                }],
                order: [
                    ['createdAt', 'desc']
                ],
                offset: parseInt(req.body.limit) * (parseInt(req.body.page - 1)),
                limit: parseInt(req.body.limit),
            });

            let responseArray = [];

            /**pagination variables */
            let recordsTotal = redeemedCoupons.length;
            let recordsFiltered = redeemedCoupons.length;
            /**end */
            /**setting up final response */
            redeemedCoupons.forEach(element => {
                responseArray.push({
                    id: element.id,
                    name: element.Coupon.coupon_name,
                    image: element.Coupon.coupon_image,
                    offAmount: element.Coupon.amount - ((element.Coupon.percent_off / 100) * element.Coupon.amount),
                    updatedAt: element.updatedAt,
                    user: {
                        name: element.User.full_name
                    },
                    outlet: {
                        name: element.MpCouponOutlet.Outlet.outlet_name
                    }
                })
            })
            return response.successDT(res, constant.SUCCESS, responseArray, recordsTotal, recordsFiltered);

        } catch (error) {

            return response.error(res, error.message);
        }
    };


    return {
        getCountryList,
        statesList,
        citiesList,
        collectedCouponsCountry,
        countryStateCities,
        getMyBrand,
        getCategories,
        getsubCategories,
        getsubCategoriesProduct,
        getCurrencies,
        getOutlets,
        categoriesByBrandId,
        categoriesByBrandIdUser,
        accountsDetail,
        redeemedCouponDetail,
        createSubCategory,
        supportemail,
        getProductTypes,
        generatecryptoaddress,
        createads,
        adsList,
        editads,
        pauseAd,
        deletead,
        priceperviewList,
    };
};

module.exports = CommonController;

async function collectedCountries() {
    return await CollectedCoupons.findAll({
        attributes: [
            [Sequelize.fn('COUNT', '*'), 'count'],
            [Sequelize.col('CountryList.id'), 'country_id']
        ],
        where: {
            coupon_id: {
                [Op.in]: couponIds
            }
        },
        include: [{
            model: CountryList,
            required: true
        }],
        group: [Sequelize.col('CountryList.id')]
    });
}
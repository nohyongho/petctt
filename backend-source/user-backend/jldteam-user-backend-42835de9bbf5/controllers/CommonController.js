/** Model */
const CountryList = require('../models/CountryList');
const StateList = require('../models/StateList');
const CityList = require('../models/CityList');
const Categories = require('../models/Categories');
const Brand = require('../models/Brand');
const Products = require('../models/Products');
const ProductTypes = require('../models/ProductTypes');
const ProductTypesMP = require('../models/ProductTypesMP');

const Outlet = require('../models/Outlet');
const Sequelize = require('sequelize');
const db = require('../config/database');
const Op = Sequelize.Op;
/** Helpers */
const response = require('../helper/response');
const responseMessages = require('../helper/responseMessages');
const validate = require('../helper/validators/AuthController/validate');
const validateOutlet = require("../helper/validators/CouponController/validate");
const randomLocation = require("random-location");
const JOI = require('joi');



const CommonController = () => {

    const getCountryList = async (req, res) => {
        const foundCountryList = await CountryList.findAll({
            attributes: [
                ['id', 'countryId'],
                ['country_name', 'countryName'],
                ['phone_code', 'phoneCode'],
                ['sort_name', 'sortName']
            ]
        });

        if (!foundCountryList) {
            return response.recordNotFound(res, req);
        }
        return response.success(res, 'ok', foundCountryList);
    };

    /**get sate list by given country id */
    const statesList = async (req, res) => {
        const countryId = req.body.countryId;
        try {
            let list = await StateList.findAll({
                where: {
                    country_id: countryId
                },
                attributes: [
                    ['id', 'stateId'],
                    ['state_name', 'stateName'],
                    ['state_code', 'stateCode']
                ]
            });
            if (list) {
                return response.success(res, responseMessages.getter(req, 'common', 'success'), list);
            } else {
                return response.error(res, responseMessages.getter(req, 'common', 'emptyRecord'));
            }
        } catch (error) {
            return response.error(res, error.message);
        }
    }

    /**getching the cities list on the basis of country Id and state Id */
    const citiesList = async (req, res) => {
        const {
            countryId,
            stateId
        } = req.body;
        try {
            let cityList = await CityList.findAll({
                where: {
                    state_id: stateId,
                    country_id: countryId
                },
                attributes: [
                    ['id', 'cityId'],
                    ['city_name', 'cityName']
                ]
            });
            if (cityList) {
                return response.success(res, responseMessages.getter(req, 'common', 'success'), cityList);
            } else {
                return response.error(res, responseMessages.getter(req, 'common', 'emptyRecord'))
            }
        } catch (error) {
            return response.error(res, error.message)
        }
    }

    /**getting coupon categories */
    const getCouponCategories = async (req, res) => {
        try {
            // let mostPopular = await db.query(`
            // select     brnd.brand_name as brandName,brnd.id as brandId, brnd.image,clcpn.coupon_id,
            //            cpnctgry.title as category,count(clcpn.is_coupon) as totalCount
            // from       collected_coupon clcpn 
            // inner join coupon cpn on clcpn.coupon_id = cpn.id 
            // inner join brand brnd on cpn.brand_id = brnd.id
            // inner join categories cpnctgry on brnd.category_id=cpnctgry.id
            // where      clcpn.is_coupon = 'redeemed' 
            // group by   clcpn.coupon_id
            // order by   count(clcpn.is_coupon) desc
            //            limit 9;`, { raw: true, type: Sequelize.QueryTypes.SELECT });

            // let mostPopularList = [];
            // // let categoryNames = [];
            // if (mostPopular[0]) {
            //     mostPopular = mostPopular.map(Element => {
            //         return {
            //             brandId: Element.brandId,
            //             brandName: Element.brandName,
            //             image: Element.image,
            //             category: Element.category
            //         }
            //     })
            //     mostPopularList.push(mostPopular);
            // } else {
            //     let allList = await BrandsList();
            //     mostPopularList.push(allList);
            // }
            // mostPopularList = mostPopularList[0];
            // // res.send(mostPopularList[0]);
            let categoryNames = await Categories.findAll({
                attributes: ['id', 'title', 'image'],
                where: {
                    parent_id: {
                        [Op.eq]: null
                    }
                }
            })
            return response.success(res, responseMessages.getter(req, 'common', 'success'), {
                categoryNames
            })
        } catch (error) {
            console.log("Error:::", error)
            return response.error(res, error.message)
        }
    }

    /**getting Brands list on the basis of categories Id */
    const getBrandsList = async (req, res) => {
        try {
            let categoryId = req.params.categoryId;
            let brands = await Brand.findAll({
                attributes: ['id', 'brand_name', ['image', 'brand_image']],
                where: {
                    category_id: categoryId
                }
            });
            return response.success(res, responseMessages.getter(req, 'common', 'success'), brands)
        } catch (error) {
            console.log("Error:::", error)
            return response.error(res, error.message)
        }
    }

    /**getting outlet list on the basis of brand Id */
    const getOutletsList = async (req, res) => {
        try {
            const body = req.body;
            const validationResponse = validateOutlet.getCouponsByBrand(body);
            if (!validationResponse.status) {
                return response.bodyNotFound(res, validationResponse.msg);
            }
            let outlets = await Outlet.findAll({
                where: {
                    brand_id: req.body.brandId,
                    status: true
                },
                include: {
                    model: Brand
                }
            });
            if (!outlets) {
                return response.recordNotFound(res);
            }
            let currentLocation = {
                latitude: parseFloat(req.body.currentLat),
                longitude: parseFloat(req.body.currentLong)
            };
            /**arranging the outlet record */
            outlets = outlets.map(Element => {
                let outletLocation = {
                    latitude: parseFloat(Element.latitude),
                    longitude: parseFloat(Element.longitude)
                }
                return {
                    outletId: Element.id,
                    outletName: Element.outlet_name,
                    outletArea: Element.area,
                    latitude: Element.latitude,
                    longitude: Element.longitude,
                    outletAltitude: Element.altitude,
                    brandImage: Element.Brand.image,
                    distance: (randomLocation.distance(currentLocation, outletLocation)).toFixed(0),
                    insideRange: (randomLocation.distance(currentLocation, outletLocation) <= 500) ? true : false,
                };
            });

            return response.success(res, responseMessages.getter(req, 'common', 'success'), outlets)
        } catch (error) {
            console.log("Error:::", error)
            return response.error(res, error.message)
        }
    }

    const test = async (req, res) => {
        try {
            const foundCountryList = await CountryList.findAll();
            let jsFile = require('../controllers/country');
            if (!foundCountryList) {
                return response.recordNotFound(res, req);
            }
            // for (let i = 0; jsFile.length; i++) {
            //     for (let j = 0; j < foundCountryList.length; j++) {
            //         if (jsFile[i].sortName === foundCountryList[j].sort_name) {
            //             await CountryList.update({
            //                 flag_image: jsFile[i].image,
            //                 latitude: jsFile[i].lat,
            //                 longitude: jsFile[i].long
            //             }, { where: { sort_name: jsFile[i].sortName } })
            //             console.log('Sort Name not included', jsFile[i].sortName)
            //         }
            //     }
            // }
            return response.success(res, 'ok', foundCountryList);
        } catch (error) {
            console.log('Errorr:::', error)
            return response.error(res, error.message);
        }
    }

    const getBrandsListTyped = async (req, res) => {
        try {
            const body = req.body;

            const JoiResponse = JOI.validate(body, {
                categoryId: JOI.number().min(1).integer().required(),
                productTypes: JOI.array().items(JOI.string().max(40)).required(),
            });

            if (JoiResponse.error) {
                return response.error(res, JoiResponse.error.details[0].message);
            }

            let brands = await Brand.findAll({
                attributes: ['id', 'brand_name', ['image', 'brand_image']],
                where: {
                    category_id: body.categoryId,
                    '': Sequelize.literal("`Category->Children->Products`.`brand_id` =`Brand`.`id`"),
                },
                include: {
                    model: Categories,
                    attributes: [],
                    required: true,
                    include: {
                        required: true,
                        model: Categories,
                        as: 'Children',
                        attributes: [],
                        include: {
                            required: true,
                            model: Products,
                            where: {
                                status: true,
                            },
                            attributes: [],
                            include: {
                                required: true,
                                model: ProductTypesMP,
                                attributes: [],
                                include: {
                                    required: true,
                                    attributes: [],
                                    model: ProductTypes,
                                    where: {
                                        title: body.productTypes
                                    }
                                }
                            }
                        }
                    }
                }
            });
            return response.success(res, responseMessages.getter(req, 'common', 'success'), brands)
        } catch (error) {
            console.log("Error:::", error)
            return response.error(res, error.message)
        }
    }
    return {
        getCountryList,
        statesList,
        citiesList,
        getCouponCategories,
        getBrandsList,
        getOutletsList,
        test,
        getBrandsListTyped
    };
};

module.exports = CommonController;